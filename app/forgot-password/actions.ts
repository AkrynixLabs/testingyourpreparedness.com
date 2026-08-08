"use server"

import crypto from "node:crypto"
import { prisma } from "@/lib/prisma"

// No email service is wired up yet (see CLAUDE.md), so the generated reset
// link is returned directly to the caller instead of being emailed - the UI
// displays it with a clear "no email service yet" label rather than
// pretending an email went out.
export async function requestPasswordReset(email: string) {
  const normalized = email.trim().toLowerCase()
  if (!normalized) throw new Error("Email is required.")

  const user = await prisma.user.findUnique({ where: { email: normalized } })
  if (!user) throw new Error("No account found with that email address.")

  const token = crypto.randomBytes(32).toString("hex")
  const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiresAt },
  })

  return { resetUrl: `/reset-password?token=${token}` }
}
