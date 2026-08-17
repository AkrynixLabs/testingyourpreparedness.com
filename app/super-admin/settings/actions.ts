"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendEmailBestEffort } from "@/lib/email/resend"
import { passwordChangedEmail } from "@/lib/email/templates"

export async function updateProfile(input: { name: string; email: string }) {
  const session = await auth()
  if (session?.user?.role !== "super_admin") {
    throw new Error("Not authorized")
  }

  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  if (!name) throw new Error("Name is required.")
  if (!email) throw new Error("Email is required.")

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing && existing.id !== session.user.id) {
    throw new Error("That email is already in use.")
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, email },
  })

  revalidatePath("/super-admin/settings")
}

export async function updatePassword(input: { currentPassword: string; newPassword: string }) {
  const session = await auth()
  if (session?.user?.role !== "super_admin") {
    throw new Error("Not authorized")
  }

  if (input.newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters.")
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) throw new Error("Not authorized")

  const currentMatches = await bcrypt.compare(input.currentPassword, user.passwordHash)
  if (!currentMatches) {
    throw new Error("Current password is incorrect.")
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 10)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  })

  const { subject, html } = passwordChangedEmail({ name: user.name })
  await sendEmailBestEffort({ to: user.email, subject, html })
}

export async function updatePlatformFeePercent(platformFeePercent: number) {
  const session = await auth()
  if (session?.user?.role !== "super_admin") {
    throw new Error("Not authorized")
  }

  if (!Number.isInteger(platformFeePercent) || platformFeePercent < 0 || platformFeePercent > 100) {
    throw new Error("Platform fee must be a whole number between 0 and 100.")
  }

  const previous = await prisma.platformSettings.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  })

  await prisma.platformSettings.update({
    where: { id: "default" },
    data: { platformFeePercent },
  })

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "update",
      category: "billing",
      description: `Changed platform fee from ${previous.platformFeePercent}% to ${platformFeePercent}%`,
      details: { type: "platform_settings", field: "platformFeePercent", from: previous.platformFeePercent, to: platformFeePercent },
    },
  })

  revalidatePath("/super-admin/settings")
}

export async function updatePlatformInfo(input: { platformName: string; supportEmail: string }) {
  const session = await auth()
  if (session?.user?.role !== "super_admin") {
    throw new Error("Not authorized")
  }

  const platformName = input.platformName.trim()
  const supportEmail = input.supportEmail.trim().toLowerCase()
  if (!platformName) throw new Error("Platform name is required.")
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) throw new Error("Enter a valid support email address.")

  const previous = await prisma.platformSettings.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  })

  await prisma.platformSettings.update({
    where: { id: "default" },
    data: { platformName, supportEmail },
  })

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "update",
      category: "settings",
      description: `Updated platform info (name: "${previous.platformName}" → "${platformName}", support email: "${previous.supportEmail}" → "${supportEmail}")`,
      details: {
        type: "platform_settings",
        from: { platformName: previous.platformName, supportEmail: previous.supportEmail },
        to: { platformName, supportEmail },
      },
    },
  })

  revalidatePath("/super-admin/settings")
}
