"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function resetPassword(token: string, newPassword: string) {
  if (!token) throw new Error("Missing reset token.")
  if (newPassword.length < 8) throw new Error("Password must be at least 8 characters.")

  const user = await prisma.user.findUnique({ where: { resetToken: token } })
  if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
    throw new Error("This reset link is invalid or has expired. Please request a new one.")
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiresAt: null },
  })
}
