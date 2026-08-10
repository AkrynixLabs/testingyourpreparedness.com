"use server"

import crypto from "node:crypto"
import { prisma } from "@/lib/prisma"
import { sendEmailBestEffort } from "@/lib/email/resend"
import { passwordResetEmail } from "@/lib/email/templates"
import { enforceRateLimit } from "@/lib/rate-limit"

// Real email now sends when RESEND_API_KEY is configured (best-effort - a
// misconfigured/down email provider never blocks the reset flow itself).
// The UI still also displays the reset link directly regardless of whether
// the email actually went out, since this app has no way to confirm
// delivery and no environment in this project has real keys configured yet
// - same honest-fallback precedent as every other "no confirmed delivery
// channel" flow here (temp passwords, invites).
export async function requestPasswordReset(email: string) {
  await enforceRateLimit("forgot-password")

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

  const { subject, html } = passwordResetEmail(token)
  await sendEmailBestEffort({ to: normalized, subject, html })

  return { resetUrl: `/reset-password?token=${token}` }
}
