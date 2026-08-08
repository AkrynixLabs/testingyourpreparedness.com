"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { GuardianRelation } from "@/lib/generated/prisma/client"

async function resolveStudent() {
  const session = await auth()
  const student = await prisma.student.findUnique({ where: { userId: session!.user.id } })
  if (!student) throw new Error("Not authorized")
  return { student, userId: session!.user.id }
}

export async function updateProfile(input: { name: string; email: string }) {
  const { userId } = await resolveStudent()

  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  if (!name) throw new Error("Name is required.")
  if (!email) throw new Error("Email is required.")

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing && existing.id !== userId) throw new Error("That email is already in use.")

  await prisma.user.update({ where: { id: userId }, data: { name, email } })
  revalidatePath("/student/settings")
}

export async function updateGuardian(input: { name: string; phone: string; email: string; relation: GuardianRelation }) {
  const { student } = await resolveStudent()

  const name = input.name.trim()
  const phone = input.phone.trim()
  if (!name) throw new Error("Guardian name is required.")
  if (!phone) throw new Error("Guardian phone is required.")

  await prisma.guardian.upsert({
    where: { studentId: student.id },
    create: { studentId: student.id, name, phone, email: input.email.trim() || null, relation: input.relation },
    update: { name, phone, email: input.email.trim() || null, relation: input.relation },
  })

  revalidatePath("/student/settings")
}

export async function updatePassword(input: { currentPassword: string; newPassword: string }) {
  const { userId } = await resolveStudent()

  if (input.newPassword.length < 8) throw new Error("New password must be at least 8 characters.")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error("Not authorized")

  const currentMatches = await bcrypt.compare(input.currentPassword, user.passwordHash)
  if (!currentMatches) throw new Error("Current password is incorrect.")

  const passwordHash = await bcrypt.hash(input.newPassword, 10)
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
}
