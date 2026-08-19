"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { GuardianRelation } from "@/lib/generated/prisma/client"
import { requestAccountDeletion, cancelAccountDeletion } from "@/lib/account-deletion"
import { changePasswordForUser } from "@/lib/student/change-password"

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
  await changePasswordForUser(userId, input.currentPassword, input.newPassword)
}

export async function deleteAccount() {
  const { userId } = await resolveStudent()
  const { scheduledDeletionAt } = await requestAccountDeletion(userId)
  revalidatePath("/student/settings")
  return { scheduledDeletionAt }
}

export async function cancelDeleteAccount() {
  const { userId } = await resolveStudent()
  await cancelAccountDeletion(userId)
  revalidatePath("/student/settings")
}
