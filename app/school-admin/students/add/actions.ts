"use server"

import crypto from "node:crypto"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role, type Gender, type GuardianRelation } from "@/lib/generated/prisma/client"
import { validateStudentRow, type ClassOption, type ParsedStudentRow } from "./validation"

// No email service is wired up yet (see CLAUDE.md), so there's no way to
// send the student a "set your password" link. A random temporary password
// is generated and returned once so the school admin can hand it to the
// student directly - the same tradeoff made anywhere account creation
// happens without email delivery.
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

  revalidatePath("/school-admin/students")
  return { studentId: student.id, tempPassword }
}

export type BulkStudentResult = {
  created: { name: string; email: string; tempPassword: string }[]
  skipped: { row: number; issues: string[] }[]
}

export async function bulkCreateStudents(
  rows: { row: number; parsed: ParsedStudentRow }[],
  defaultClassId: string | null
): Promise<BulkStudentResult> {
  const session = await auth()
  if (session?.user?.role !== "school_admin") {
    throw new Error("Not authorized")
  }
  const schoolId = await resolveSchoolId(session.user.id)

  const classRows = await prisma.class.findMany({ where: { schoolId } })
  const classOptions: ClassOption[] = classRows.map((c) => ({ id: c.id, displayName: c.displayName }))

  const created: { name: string; email: string; tempPassword: string }[] = []
  const skipped: { row: number; issues: string[] }[] = []

  for (const { row, parsed } of rows) {
    const validated = validateStudentRow(row, parsed, classOptions, defaultClassId)

    if (validated.status === "error" || !validated.resolvedClassId) {
      skipped.push({ row, issues: validated.issues })
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
  }

  revalidatePath("/school-admin/students")
  return { created, skipped }
}
