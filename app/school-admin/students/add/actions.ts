"use server"

import crypto from "node:crypto"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role, type Gender, type GuardianRelation } from "@/lib/generated/prisma/client"
import { validateStudentRow, type ClassOption, type ParsedStudentRow } from "./validation"
import { sendEmailBestEffort } from "@/lib/email/resend"
import { newAccountTempPasswordEmail } from "@/lib/email/templates"
import { assertStudentCapacityAvailable, getSchoolStudentCapacity } from "@/lib/school/capacity"

// A random temporary password is generated and returned once so the school
// admin can hand it to the student directly - kept as the reliable fallback
// even now that the single-add path also emails it (delivery can't be
// confirmed). Bulk CSV import deliberately does NOT send email per-row -
// see docs/build-log.md's email-service entry: sending dozens of emails
// synchronously in one request isn't good practice and depends on the
// separate background-jobs work.
function generateTempPassword() {
  return crypto.randomBytes(6).toString("base64url")
}

async function resolveSchoolId(userId: string) {
  const schoolAdmin = await prisma.schoolAdmin.findUnique({ where: { userId }, select: { schoolId: true } })
  if (!schoolAdmin) throw new Error("Not authorized")
  return schoolAdmin.schoolId
}

export type CreateStudentInput = {
  name: string
  email: string
  classId: string
  dateOfBirth: string | null
  gender: Gender | null
  address: string | null
  notes: string | null
  guardianName: string
  guardianPhone: string
  guardianEmail: string
  guardianRelation: GuardianRelation
}

export async function createStudent(input: CreateStudentInput) {
  const session = await auth()
  if (session?.user?.role !== "school_admin") {
    throw new Error("Not authorized")
  }
  const schoolId = await resolveSchoolId(session.user.id)

  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  if (!name) throw new Error("Name is required.")
  if (!email) throw new Error("Email is required.")
  if (!input.classId) throw new Error("Class is required.")

  const cls = await prisma.class.findUnique({ where: { id: input.classId } })
  if (!cls || cls.schoolId !== schoolId) throw new Error("Invalid class for this school.")

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error("A user with that email already exists.")

  await assertStudentCapacityAvailable(schoolId)

  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 10)

  const student = await prisma.student.create({
    data: {
      user: { create: { name, email, passwordHash, role: Role.student } },
      enrollmentType: "school",
      school: { connect: { id: schoolId } },
      class: { connect: { id: input.classId } },
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
      gender: input.gender,
      address: input.address || null,
      notes: input.notes || null,
      status: "active",
      ...(input.guardianName.trim()
        ? {
            guardian: {
              create: {
                name: input.guardianName.trim(),
                phone: input.guardianPhone.trim(),
                email: input.guardianEmail.trim() || null,
                relation: input.guardianRelation,
              },
            },
          }
        : {}),
    },
  })

  const { subject, html } = newAccountTempPasswordEmail({ name, email, tempPassword, roleLabel: "Learner" })
  await sendEmailBestEffort({ to: email, subject, html })

  revalidatePath("/school-admin/students")
  return { studentId: student.id, tempPassword }
}

// Same tradeoff as super-admin/content-admins' resendContentAdminCredentials
// - only the bcrypt hash was ever persisted, never the temp password's
// plaintext, so there's no original value to resend. A fresh temp password
// is generated and the hash overwritten; the old one stops working. Scoped
// to single-add students only, per the task's own scoping (bulk-imported
// students were never emailed in the first place, so there's nothing to
// resend for them - resending would be the first email they ever get, a
// different feature than "retry a failed delivery").
export async function resendStudentCredentials(studentId: string) {
  const session = await auth()
  if (session?.user?.role !== "school_admin") {
    throw new Error("Not authorized")
  }
  const schoolId = await resolveSchoolId(session.user.id)

  const student = await prisma.student.findUnique({ where: { id: studentId }, include: { user: true } })
  if (!student || student.schoolId !== schoolId) {
    throw new Error("Not authorized")
  }

  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 10)
  await prisma.user.update({ where: { id: student.userId }, data: { passwordHash } })

  const { subject, html } = newAccountTempPasswordEmail({
    name: student.user.name,
    email: student.user.email,
    tempPassword,
    roleLabel: "Learner",
  })
  await sendEmailBestEffort({ to: student.user.email, subject, html })

  return { email: student.user.email, tempPassword }
}

export type BulkStudentResult = {
  created: { name: string; email: string; tempPassword: string }[]
  skipped: { row: number; issues: string[] }[]
}

// Decided 2026-08-08 (background-jobs decision, see docs/build-log.md): bulk
// import stays synchronous, not queued, for the same reasoning as
// content-admin/questions/upload's identical cap. Set lower than that one's
// 300 - each row here does a bcrypt hash (real CPU-bound cost, ~50-100ms)
// plus 2+ DB round trips, vs. questions' single DB write per row.
const MAX_BULK_ROWS = 200

export async function bulkCreateStudents(
  rows: { row: number; parsed: ParsedStudentRow }[],
  defaultClassId: string | null
): Promise<BulkStudentResult> {
  const session = await auth()
  if (session?.user?.role !== "school_admin") {
    throw new Error("Not authorized")
  }

  if (rows.length > MAX_BULK_ROWS) {
    throw new Error(
      `This file has ${rows.length} rows - bulk imports are processed synchronously and are capped at ${MAX_BULK_ROWS} rows to avoid timing out partway through. Split the file into smaller batches.`
    )
  }

  const schoolId = await resolveSchoolId(session.user.id)

  const classRows = await prisma.class.findMany({ where: { schoolId } })
  const classOptions: ClassOption[] = classRows.map((c) => ({ id: c.id, displayName: c.displayName }))

  const { current, limit } = await getSchoolStudentCapacity(schoolId)
  let remainingCapacity = limit === null ? Number.POSITIVE_INFINITY : Math.max(0, limit - current)

  const created: { name: string; email: string; tempPassword: string }[] = []
  const skipped: { row: number; issues: string[] }[] = []

  for (const { row, parsed } of rows) {
    const validated = validateStudentRow(row, parsed, classOptions, defaultClassId)

    if (validated.status === "error" || !validated.resolvedClassId) {
      skipped.push({ row, issues: validated.issues })
      continue
    }

    if (remainingCapacity <= 0) {
      skipped.push({
        row,
        issues: [`Your plan's learner limit (${limit}) has been reached - upgrade your subscription plan to import more.`],
      })
      continue
    }

    const email = parsed.email.trim().toLowerCase()
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      skipped.push({ row, issues: [`A user with email "${email}" already exists.`] })
      continue
    }

    const tempPassword = generateTempPassword()
    const passwordHash = await bcrypt.hash(tempPassword, 10)

    await prisma.student.create({
      data: {
        user: { create: { name: parsed.name.trim(), email, passwordHash, role: Role.student } },
        enrollmentType: "school",
        school: { connect: { id: schoolId } },
        class: { connect: { id: validated.resolvedClassId } },
        status: "active",
        ...(parsed.guardian.trim()
          ? {
              guardian: {
                create: {
                  name: parsed.guardian.trim(),
                  phone: parsed.guardian_phone.trim(),
                  relation: "guardian",
                },
              },
            }
          : {}),
      },
    })

    created.push({ name: parsed.name.trim(), email, tempPassword })
    remainingCapacity -= 1
  }

  revalidatePath("/school-admin/students")
  return { created, skipped }
}
