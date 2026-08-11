"use server"

import crypto from "node:crypto"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { EducationLevel } from "@/lib/generated/prisma/client"
import { sendEmailBestEffort } from "@/lib/email/resend"
import { schoolAdminInviteEmail } from "@/lib/email/templates"

const INVITATION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

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

  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_MS)

  await prisma.invitation.create({
    data: { schoolId, email: normalized, invitedById: session.user.id, status: "pending", token, expiresAt },
  })

  // Real one-click accept link now (app/invite/accept) - added 2026-08-08,
  // previously this was just a pending record with no redemption flow at
  // all. Best-effort - a down/unconfigured email provider shouldn't block
  // recording the invite itself.
  const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { name: true } })
  const { subject, html } = schoolAdminInviteEmail(school?.name ?? "your school", token)
  await sendEmailBestEffort({ to: normalized, subject, html })

  revalidatePath("/school-admin/settings")
}

// Unlike resendContentAdminCredentials/resendStudentCredentials, there's no
// plaintext-vs-hash problem here - the invitation token itself was persisted
// from the start (see the schema comment above), so it's simply re-sent as
// the exact same link, not regenerated. Regenerating would invalidate a
// link the invitee might already have open in their inbox.
export async function resendInvitation(invitationId: string) {
  const session = await auth()
  if (session?.user?.role !== "school_admin") throw new Error("Not authorized")
  const { schoolId } = await resolveSchoolAdmin(session.user.id)

  const invitation = await prisma.invitation.findUnique({ where: { id: invitationId } })
  if (!invitation || invitation.schoolId !== schoolId) throw new Error("Not authorized")
  if (invitation.status !== "pending") throw new Error("This invitation is no longer pending.")
  if (invitation.expiresAt < new Date()) {
    throw new Error("This invitation has expired - cancel it and send a new one instead.")
  }

  const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { name: true } })
  const { subject, html } = schoolAdminInviteEmail(school?.name ?? "your school", invitation.token)
  await sendEmailBestEffort({ to: invitation.email, subject, html })
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
