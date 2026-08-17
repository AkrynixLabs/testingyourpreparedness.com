import crypto from "node:crypto"
import { prisma } from "@/lib/prisma"
import { sendEmailBestEffort } from "@/lib/email/resend"
import { verifyEmailAddressEmail } from "@/lib/email/templates"

// Shared by all 4 self-signup creation sites (registerSchool,
// registerIndependentStudent, registerTutor, lib/student/join.ts's
// createJoinedStudent - the last one already shared between the web join
// page and the mobile join routes, so this covers mobile for free). Same
// "one function, several callers" pattern as this project's other shared
// lib functions - see prisma/schema.prisma's own comment on
// User.emailVerified for why admin-provisioned accounts never call this.

const TOKEN_EXPIRY_HOURS = 48

// Best-effort by design, same as every other email send in this app - a
// down/unconfigured Resend must never block account creation. Unlike a
// welcome email, though, failing silently here has a real consequence (the
// account can never log in without the link) - callers should still surface
// the account as created successfully; a "Resend verification email" action
// is the real recovery path, not retrying this call.
export async function sendVerificationEmailBestEffort(userId: string, email: string, name: string): Promise<void> {
  const token = crypto.randomBytes(32).toString("hex")
  const emailVerificationTokenExpiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

  await prisma.user.update({
    where: { id: userId },
    data: { emailVerificationToken: token, emailVerificationTokenExpiresAt },
  })

  const { subject, html } = verifyEmailAddressEmail({ name, token })
  await sendEmailBestEffort({ to: email, subject, html })
}

export type VerifyEmailTokenResult = { ok: true } | { ok: false; reason: "invalid" | "expired" }

export async function verifyEmailToken(token: string): Promise<VerifyEmailTokenResult> {
  const user = await prisma.user.findUnique({ where: { emailVerificationToken: token } })
  if (!user) return { ok: false, reason: "invalid" }

  if (!user.emailVerificationTokenExpiresAt || user.emailVerificationTokenExpiresAt < new Date()) {
    return { ok: false, reason: "expired" }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerificationToken: null, emailVerificationTokenExpiresAt: null },
  })
  return { ok: true }
}

// Used by the "Resend verification email" action on the login page - no
// account-enumeration protection, matching this codebase's own existing
// forgot-password precedent (app/forgot-password/actions.ts throws a plain
// "No account found" rather than staying silent). Silently no-ops (not an
// error) for an already-verified account, since resending in that case
// isn't actionable - the caller wouldn't need it.
export async function resendVerificationEmailBestEffort(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (!user || user.emailVerified) return
  await sendVerificationEmailBestEffort(user.id, user.email, user.name)
}
