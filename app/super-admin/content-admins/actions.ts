"use server"

import crypto from "node:crypto"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role, type ContentAdminStatus } from "@/lib/generated/prisma/client"
import { sendEmailBestEffort } from "@/lib/email/resend"
import { newAccountTempPasswordEmail, contentAdminAccountRemovedEmail } from "@/lib/email/templates"

// A temporary password is generated and returned once so the super admin
// can hand it to the new content admin directly (still true even now that
// email sends - delivery can't be confirmed, so the in-app display stays as
// the reliable fallback, same tradeoff already made for
// school-admin/students/add).
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

export async function createContentAdmin(input: { name: string; email: string; subjectIds: string[] }) {
  const actorId = await requireSuperAdmin()

  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  if (!name) throw new Error("Name is required.")
  if (!email) throw new Error("Email is required.")

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error("A user with that email already exists.")

  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: Role.content_admin,
      contentAdminProfile: {
        create: {
          status: "active",
          subjects: { create: input.subjectIds.map((subjectId) => ({ subjectId })) },
        },
      },
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "create",
      category: "user",
      description: `Created new Content Admin: ${name}`,
      details: { type: "content_admin", userId: user.id, email },
    },
  })

  const { subject, html } = newAccountTempPasswordEmail({ name, email, tempPassword, roleLabel: "Content Admin" })
  await sendEmailBestEffort({ to: email, subject, html })

  revalidatePath("/super-admin/content-admins")
  return { tempPassword }
}

// Resend can't reuse the original temp password - only its bcrypt hash was
// ever persisted (createContentAdmin above never stores the plaintext
// anywhere), so there's no original value left to re-send. A fresh temp
// password is generated and the hash is overwritten, which does mean the
// old one stops working - an unavoidable tradeoff of never having stored
// the plaintext in the first place, not an oversight. Contrast with
// resendSchoolAdminInvite in school-admin/settings/actions.ts, where the
// invitation *token* itself was persisted from the start and can be resent
// as-is with no such tradeoff.
export async function resendContentAdminCredentials(profileId: string) {
  const actorId = await requireSuperAdmin()

  const profile = await prisma.contentAdminProfile.findUnique({
    where: { id: profileId },
    include: { user: true },
  })
  if (!profile) throw new Error("Content admin not found")

  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 10)
  await prisma.user.update({ where: { id: profile.userId }, data: { passwordHash } })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "update",
      category: "user",
      description: `Resent credentials to Content Admin: ${profile.user.name} (new temporary password issued)`,
      details: { type: "content_admin", userId: profile.userId, action: "resend_credentials" },
    },
  })

  const { subject, html } = newAccountTempPasswordEmail({
    name: profile.user.name,
    email: profile.user.email,
    tempPassword,
    roleLabel: "Content Admin",
  })
  await sendEmailBestEffort({ to: profile.user.email, subject, html })

  revalidatePath("/super-admin/content-admins")
  return { email: profile.user.email, tempPassword }
}

export async function setContentAdminStatus(profileId: string, status: ContentAdminStatus) {
  const actorId = await requireSuperAdmin()

  const profile = await prisma.contentAdminProfile.update({
    where: { id: profileId },
    data: { status },
    include: { user: true },
  })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "update",
      category: "user",
      description: `Set Content Admin ${profile.user.name} to ${status}`,
      details: { type: "content_admin", userId: profile.userId, status },
    },
  })

  revalidatePath("/super-admin/content-admins")
}

export async function deleteContentAdmin(profileId: string) {
  const actorId = await requireSuperAdmin()

  const profile = await prisma.contentAdminProfile.findUnique({
    where: { id: profileId },
    include: { user: { include: { _count: { select: { createdQuestions: true, createdAssessments: true } } } } },
  })
  if (!profile) throw new Error("Content admin not found")
  if (profile.user._count.createdQuestions + profile.user._count.createdAssessments > 0) {
    throw new Error("Cannot remove a content admin who has created questions or assessments")
  }

  const { subject, html } = contentAdminAccountRemovedEmail({ name: profile.user.name })
  await sendEmailBestEffort({ to: profile.user.email, subject, html })

  await prisma.user.delete({ where: { id: profile.userId } })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "delete",
      category: "user",
      description: `Removed Content Admin: ${profile.user.name}`,
      details: { type: "content_admin", userId: profile.userId },
    },
  })

  revalidatePath("/super-admin/content-admins")
}
