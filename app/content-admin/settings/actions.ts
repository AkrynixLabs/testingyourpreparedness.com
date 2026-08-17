"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendEmailBestEffort } from "@/lib/email/resend"
import { passwordChangedEmail } from "@/lib/email/templates"

export async function updateProfile(input: { name: string; email: string }) {
  const session = await auth()
  if (session?.user?.role !== "content_admin") {
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

  revalidatePath("/content-admin/settings")
}

export async function updatePassword(input: { currentPassword: string; newPassword: string }) {
  const session = await auth()
  if (session?.user?.role !== "content_admin") {
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
