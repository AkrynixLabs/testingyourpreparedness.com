"use server"

import crypto from "node:crypto"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role, type ContentAdminStatus } from "@/lib/generated/prisma/client"

// No email service is wired up yet (see CLAUDE.md), so there's no invite-by-email
// flow. A temporary password is generated and returned once so the super admin
// can hand it to the new content admin directly - same tradeoff already made
// for school-admin/students/add.
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

  revalidatePath("/super-admin/content-admins")
  return { tempPassword }
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
