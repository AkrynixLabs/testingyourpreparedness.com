"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { EducationLevel } from "@/lib/generated/prisma/client"

async function resolveSchoolAdmin(userId: string) {
  const schoolAdmin = await prisma.schoolAdmin.findUnique({ where: { userId } })
  if (!schoolAdmin) throw new Error("Not authorized")
  return schoolAdmin
}

export type UpdateSchoolProfileInput = {
  name: string
  email: string
  phone: string
  website: string
  address: string
  educationLevel: EducationLevel
}

export async function updateSchoolProfile(input: UpdateSchoolProfileInput) {
  const session = await auth()
  if (session?.user?.role !== "school_admin") throw new Error("Not authorized")
  const { schoolId } = await resolveSchoolAdmin(session.user.id)

  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  const phone = input.phone.trim()
  const address = input.address.trim()
  if (!name) throw new Error("School name is required.")
  if (!email) throw new Error("Email is required.")
  if (!phone) throw new Error("Phone is required.")
  if (!address) throw new Error("Address is required.")

  await prisma.school.update({
    where: { id: schoolId },
    data: { name, email, phone, address, website: input.website.trim() || null, educationLevel: input.educationLevel },
  })

  revalidatePath("/school-admin/settings")
}

export async function inviteAdmin(email: string) {
  const session = await auth()
  if (session?.user?.role !== "school_admin") throw new Error("Not authorized")
  const { schoolId } = await resolveSchoolAdmin(session.user.id)

  const normalized = email.trim().toLowerCase()
  if (!normalized) throw new Error("Email is required.")

  const existingUser = await prisma.user.findUnique({ where: { email: normalized } })
  if (existingUser) throw new Error("A user with that email already exists.")

  const existingInvite = await prisma.invitation.findFirst({
    where: { schoolId, email: normalized, status: "pending" },
  })
  if (existingInvite) throw new Error("There's already a pending invitation for that email.")

  await prisma.invitation.create({
    data: { schoolId, email: normalized, invitedById: session.user.id, status: "pending" },
  })

  revalidatePath("/school-admin/settings")
}

export async function cancelInvitation(invitationId: string) {
  const session = await auth()
  if (session?.user?.role !== "school_admin") throw new Error("Not authorized")
  const { schoolId } = await resolveSchoolAdmin(session.user.id)

  const invitation = await prisma.invitation.findUnique({ where: { id: invitationId } })
  if (!invitation || invitation.schoolId !== schoolId) throw new Error("Not authorized")

  await prisma.invitation.delete({ where: { id: invitationId } })
  revalidatePath("/school-admin/settings")
}

export async function removeAdmin(schoolAdminId: string) {
  const session = await auth()
  if (session?.user?.role !== "school_admin") throw new Error("Not authorized")
  const { schoolId } = await resolveSchoolAdmin(session.user.id)

  const target = await prisma.schoolAdmin.findUnique({ where: { id: schoolAdminId } })
  if (!target || target.schoolId !== schoolId) throw new Error("Not authorized")
  if (target.isPrimary) throw new Error("The primary admin can't be removed.")
  if (target.userId === session.user.id) throw new Error("You can't remove yourself.")

  await prisma.schoolAdmin.delete({ where: { id: schoolAdminId } })
  revalidatePath("/school-admin/settings")
}

export async function updatePassword(input: { currentPassword: string; newPassword: string }) {
  const session = await auth()
  if (session?.user?.role !== "school_admin") throw new Error("Not authorized")

  if (input.newPassword.length < 8) throw new Error("New password must be at least 8 characters.")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) throw new Error("Not authorized")

  const currentMatches = await bcrypt.compare(input.currentPassword, user.passwordHash)
  if (!currentMatches) throw new Error("Current password is incorrect.")

  const passwordHash = await bcrypt.hash(input.newPassword, 10)
  await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash } })
}
