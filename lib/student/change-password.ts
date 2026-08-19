import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { sendEmailBestEffort } from "@/lib/email/resend"
import { passwordChangedEmail } from "@/lib/email/templates"

// Extracted out of app/student/settings/actions.ts's updatePassword so a
// mobile caller (app/api/mobile/account/change-password) can reuse the exact
// same logic - same "one function, two callers" pattern as
// lib/account-deletion.ts, which this mobile route's sibling
// (app/api/mobile/account/delete) already follows. No auth check inside -
// each caller resolves/verifies the userId at its own entry point (the web
// Server Action via its session, the mobile route via its bearer token).
export async function changePasswordForUser(userId: string, currentPassword: string, newPassword: string) {
  if (newPassword.length < 8) throw new Error("New password must be at least 8 characters.")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error("Not authorized")

  const currentMatches = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!currentMatches) throw new Error("Current password is incorrect.")

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } })

  const { subject, html } = passwordChangedEmail({ name: user.name })
  await sendEmailBestEffort({ to: user.email, subject, html })
}
