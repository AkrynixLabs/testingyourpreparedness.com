// Plain HTML string templates - no react-email/JSX rendering dependency,
// kept deliberately lean since this app's email needs are simple
// transactional notices, not marketing/newsletter-grade design.

import { stripTrailingSlash } from "@/lib/utils"

function appUrl(): string {
  return stripTrailingSlash(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
}

function wrapper(bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <p style="font-size: 20px; font-weight: 700; margin-bottom: 24px;">TYP</p>
      ${bodyHtml}
      <p style="font-size: 12px; color: #888; margin-top: 32px;">This is an automated message from TYP. Please don't reply to this email.</p>
    </div>
  `
}

export function passwordResetEmail(resetToken: string) {
  const url = `${appUrl()}/reset-password?token=${resetToken}`
  return {
    subject: "Reset your TYP password",
    html: wrapper(`
      <p>We received a request to reset your TYP password. Click the link below to choose a new one - it expires in 1 hour.</p>
      <p><a href="${url}" style="display:inline-block;padding:10px 20px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a></p>
      <p style="font-size:13px;color:#666;">If you didn't request this, you can safely ignore this email.</p>
    `),
  }
}

export function schoolAdminInviteEmail(schoolName: string, token: string) {
  const url = `${appUrl()}/invite/accept?token=${token}`
  return {
    subject: `You've been invited to join ${schoolName} on TYP`,
    html: wrapper(`
      <p>You've been invited to join <strong>${schoolName}</strong> as a school administrator on TYP.</p>
      <p>Accept the invitation to create your account - this link expires in 7 days:</p>
      <p><a href="${url}" style="display:inline-block;padding:10px 20px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;">Accept Invitation</a></p>
    `),
  }
}

export function newAccountTempPasswordEmail(input: { name: string; email: string; tempPassword: string; roleLabel: string }) {
  return {
    subject: `Your TYP ${input.roleLabel} account is ready`,
    html: wrapper(`
      <p>Hi ${input.name},</p>
      <p>An account has been created for you on TYP as a ${input.roleLabel}. Here are your temporary login details:</p>
      <p style="background:#f5f5f5;padding:12px 16px;border-radius:6px;font-family:monospace;">
        Email: ${input.email}<br/>
        Temporary password: ${input.tempPassword}
      </p>
      <p>Please log in and change your password as soon as possible.</p>
      <p><a href="${appUrl()}/login" style="display:inline-block;padding:10px 20px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;">Log In</a></p>
    `),
  }
}

export function weeklyPlatformReportEmail(input: { weekOf: string }) {
  return {
    subject: `TYP weekly platform report - ${input.weekOf}`,
    html: wrapper(`
      <p>Attached is this week's platform report: schools by region, subscription distribution, and subject performance - as an Excel workbook (3 sheets) and a PDF.</p>
      <p><a href="${appUrl()}/super-admin/reports" style="display:inline-block;padding:10px 20px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;">View Live Reports</a></p>
    `),
  }
}

export function guardianApprovalEmail(input: { guardianName: string; studentName: string; token: string }) {
  const url = `${appUrl()}/guardian/approve?token=${input.token}`
  return {
    subject: `Approval requested: ${input.studentName}'s TYP account`,
    html: wrapper(`
      <p>Hi ${input.guardianName},</p>
      <p><strong>${input.studentName}</strong> has registered for a TYP account and listed you as their guardian. Please confirm you approve this registration - this link expires in 7 days:</p>
      <p><a href="${url}" style="display:inline-block;padding:10px 20px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;">Review & Approve</a></p>
      <p style="font-size:13px;color:#666;">If you don't recognize this request, you can safely ignore this email - no action is taken without your approval.</p>
    `),
  }
}

export function assignmentNotificationEmail(input: { studentName: string; assessmentTitle: string; startDate: Date; endDate: Date }) {
  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
  return {
    subject: `New assessment assigned: ${input.assessmentTitle}`,
    html: wrapper(`
      <p>Hi ${input.studentName},</p>
      <p>A new assessment has been assigned to you: <strong>${input.assessmentTitle}</strong>.</p>
      <p>Available from <strong>${fmt(input.startDate)}</strong> to <strong>${fmt(input.endDate)}</strong>.</p>
      <p><a href="${appUrl()}/student/exams" style="display:inline-block;padding:10px 20px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;">View Exams</a></p>
    `),
  }
}
