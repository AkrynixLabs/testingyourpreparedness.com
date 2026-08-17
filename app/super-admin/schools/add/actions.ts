"use server"

import crypto from "node:crypto"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role, type OwnershipType } from "@/lib/generated/prisma/client"
import { asString } from "@/lib/validation"
import { generateSchoolCode } from "@/lib/school-code"
import { sendEmailBestEffort } from "@/lib/email/resend"
import { newAccountTempPasswordEmail } from "@/lib/email/templates"

// A real, super-admin-privileged school-creation flow (added 2026-08-16),
// replacing the old "Add School" button's redirect out to the public
// /signup/school self-signup wizard - that flow is correct for a school
// signing itself up, but wrong for a super admin adding one on someone's
// behalf: it forces a plan-selection/checkout step that doesn't apply here,
// and lands the school in the same "pending verification" queue a self-signup
// would, which is redundant when a super admin is the one directly creating
// it. Confirmed with the user: this creates the school as immediately
// "active" (no billing step, no pending queue), same
// generate-a-temp-password-and-email-it pattern already used for
// content-admin/school-added-student creation, not a bespoke flow.
function generateTempPassword() {
  return crypto.randomBytes(6).toString("base64url")
}

async function requireSuperAdmin() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") {
    throw new Error("Not authorized")
  }
  return session.user.id
}

export type CreateSchoolBySuperAdminInput = {
  schoolName: string
  ownershipType: OwnershipType
  registrationNumber: string
  yearEstablished: string
  website: string
  region: string
  district: string
  town: string
  address: string
  postalCode: string
  adminFirstName: string
  adminLastName: string
  adminEmail: string
  adminPhone: string
}

export async function createSchoolBySuperAdmin(input: CreateSchoolBySuperAdminInput) {
  const actorId = await requireSuperAdmin()

  const schoolName = asString(input.schoolName).trim()
  const region = asString(input.region).trim()
  const district = asString(input.district).trim()
  const town = asString(input.town).trim()
  const address = asString(input.address).trim()
  const adminFirstName = asString(input.adminFirstName).trim()
  const adminLastName = asString(input.adminLastName).trim()
  const adminEmail = asString(input.adminEmail).trim().toLowerCase()
  const adminPhone = asString(input.adminPhone).trim()

  if (!schoolName) throw new Error("School name is required.")
  if (!input.ownershipType) throw new Error("Ownership type is required.")
  if (!region) throw new Error("Region is required.")
  if (!district) throw new Error("District is required.")
  if (!town) throw new Error("Town is required.")
  if (!address) throw new Error("Address is required.")
  if (!adminFirstName || !adminLastName) throw new Error("Administrator name is required.")
  if (!adminEmail) throw new Error("Administrator email is required.")
  if (!adminPhone) throw new Error("Administrator phone is required.")

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (existing) throw new Error("An account with that email already exists.")

  const code = await generateSchoolCode(schoolName)
  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 10)
  const adminName = `${adminFirstName} ${adminLastName}`

  const school = await prisma.school.create({
    data: {
      code,
      name: schoolName,
      registrationNumber: asString(input.registrationNumber).trim() || null,
      ownershipType: input.ownershipType,
      // Same "JHS-only inference" as the public wizard - see that file's
      // own note. Unchanged by who's creating the school.
      educationLevel: "junior_high",
      region,
      district,
      town,
      address,
      postalCode: asString(input.postalCode).trim() || null,
      email: adminEmail,
      phone: adminPhone,
      website: asString(input.website).trim() || null,
      established: input.yearEstablished ? Number(input.yearEstablished) : null,
      // The one real behavior difference from the public wizard: active
      // immediately, not "pending" - a super admin creating it directly is
      // itself the verification step.
      status: "active",
      admins: {
        create: {
          isPrimary: true,
          user: {
            create: {
              name: adminName,
              email: adminEmail,
              passwordHash,
              role: Role.school_admin,
            },
          },
        },
      },
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "create",
      category: "school",
      description: `Created school "${schoolName}" directly (super admin)`,
      details: { type: "school", schoolId: school.id, code },
    },
  })

  const { subject, html } = newAccountTempPasswordEmail({
    name: adminName,
    email: adminEmail,
    tempPassword,
    roleLabel: "School Administrator",
  })
  await sendEmailBestEffort({ to: adminEmail, subject, html })

  revalidatePath("/super-admin/schools")
  redirect(`/super-admin/schools/${school.id}`)
}
