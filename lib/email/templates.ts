// Plain HTML string templates - no react-email/JSX rendering dependency.
// Redesigned 2026-08-15 to actually look like a real product's email, not a
// bare paragraph-and-button notice - real brand blue (#0072D5, this
// project's own --primary token), the real logo, and the same table-based/
// inline-style email-HTML conventions as docs/email-templates/
// brevo-broadcast-template.html (the Brevo broadcast template), so a
// transactional email and a marketing broadcast both read as "from TYP"
// rather than two unrelated systems. Still deliberately simpler than that
// template per email - one short message, one action, no eyebrow/hero -
// these are still transactional notices, not newsletters.

import { stripTrailingSlash } from "@/lib/utils"

function appUrl(): string {
  return stripTrailingSlash(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
}

function button(label: string, href: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="border-radius:8px; background-color:#0072D5;">
          <a href="${href}" target="_blank" style="display:inline-block; padding:0 24px; height:44px; line-height:44px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:15px; font-weight:700; color:#FFFFFF; text-decoration:none;">${label}</a>
        </td>
      </tr>
    </table>
  `
}

function wrapper(bodyHtml: string): string {
  const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
  return `
    <div style="margin:0; padding:0; width:100%; background-color:#EEF3FA;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EEF3FA;">
        <tr>
          <td align="center" style="padding:32px 16px;">
            <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="width:480px; max-width:480px;">
              <tr>
                <td style="height:4px; line-height:4px; font-size:0; background-color:#0072D5; border-radius:10px 10px 0 0;">&nbsp;</td>
              </tr>
              <tr>
                <td style="background-color:#FFFFFF; border-radius:0 0 10px 10px; box-shadow:0 1px 3px rgba(20,42,79,0.06);">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding:28px 36px 20px 36px;">
                        <img src="${appUrl()}/logo.png" width="88" height="48" alt="TYP" style="display:block; width:88px; height:48px;">
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 36px 28px 36px; font-family:${font}; font-size:15px; line-height:24px; color:#45526A;">
                        ${bodyHtml}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 36px;">
                        <div style="border-top:1px solid #DCE4F0; line-height:1px; font-size:1px;">&nbsp;</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px 36px 28px 36px; font-family:${font}; font-size:12px; line-height:18px; color:#9AA6B8;">
                        This is an automated message from TYP - please don't reply to this email. Questions? <a href="${appUrl()}/contact" style="color:#0072D5;">Contact us</a>.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="height:24px; line-height:24px; font-size:0;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `
}

function heading(text: string): string {
  return `<p style="margin:0 0 12px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:20px; line-height:26px; font-weight:800; color:#142A4F;">${text}</p>`
}

export function passwordResetEmail(resetToken: string) {
  const url = `${appUrl()}/reset-password?token=${resetToken}`
  return {
    subject: "Reset your TYP password",
    html: wrapper(`
      ${heading("Reset your password")}
      <p style="margin:0 0 20px 0;">We received a request to reset your TYP password. Choose a new one below - this link expires in 1 hour.</p>
      ${button("Reset Password", url)}
      <p style="margin:20px 0 0 0; font-size:13px; color:#7A88A0;">If you didn't request this, you can safely ignore this email.</p>
    `),
  }
}

export function schoolAdminInviteEmail(schoolName: string, token: string) {
  const url = `${appUrl()}/invite/accept?token=${token}`
  return {
    subject: `You've been invited to join ${schoolName} on TYP`,
    html: wrapper(`
      ${heading("You've been invited")}
      <p style="margin:0 0 20px 0;">You've been invited to join <strong style="color:#142A4F;">${schoolName}</strong> as a school administrator on TYP.</p>
      ${button("Accept Invitation", url)}
      <p style="margin:20px 0 0 0; font-size:13px; color:#7A88A0;">This invitation expires in 7 days.</p>
    `),
  }
}

export function newAccountTempPasswordEmail(input: { name: string; email: string; tempPassword: string; roleLabel: string }) {
  return {
    subject: `Your TYP ${input.roleLabel} account is ready`,
    html: wrapper(`
      ${heading("Your account is ready")}
      <p style="margin:0 0 16px 0;">Hi ${input.name}, an account has been created for you on TYP as a ${input.roleLabel}. Here are your temporary login details:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;">
        <tr>
          <td style="background-color:#EEF3FA; border-radius:8px; padding:14px 16px; font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace; font-size:13px; color:#142A4F;">
            Email: ${input.email}<br/>
            Temporary password: ${input.tempPassword}
          </td>
        </tr>
      </table>
      <p style="margin:0 0 20px 0;">Please log in and change your password as soon as possible.</p>
      ${button("Log In", `${appUrl()}/login`)}
    `),
  }
}

export function weeklyPlatformReportEmail(input: { weekOf: string }) {
  return {
    subject: `TYP weekly platform report - ${input.weekOf}`,
    html: wrapper(`
      ${heading("Weekly platform report")}
      <p style="margin:0 0 20px 0;">Attached is this week's report: schools by region, subscription distribution, and subject performance - as an Excel workbook and a PDF.</p>
      ${button("View Live Reports", `${appUrl()}/super-admin/reports`)}
    `),
  }
}

export function guardianApprovalEmail(input: { guardianName: string; studentName: string; token: string }) {
  const url = `${appUrl()}/guardian/approve?token=${input.token}`
  return {
    subject: `Approval requested: ${input.studentName}'s TYP account`,
    html: wrapper(`
      ${heading("Approval requested")}
      <p style="margin:0 0 20px 0;">Hi ${input.guardianName}, <strong style="color:#142A4F;">${input.studentName}</strong> has registered for a TYP account and listed you as their guardian. Please confirm you approve this registration - this link expires in 7 days.</p>
      ${button("Review & Approve", url)}
      <p style="margin:20px 0 0 0; font-size:13px; color:#7A88A0;">If you don't recognize this request, you can safely ignore this email - no action is taken without your approval.</p>
    `),
  }
}

// Sent once, right after a self-signup succeeds (school admin, independent
// student, tutor, or a student joining via school code). Deliberately
// simple per the user's own call: just confirm the account and point to the
// dashboard, no mention of the newsletter opt-in choice - that's Brevo's own
// concern if it ever needs one, not this email's.
export function welcomeEmail(input: { name: string; roleLabel: string; dashboardPath: string }) {
  return {
    subject: "Welcome to TYP",
    html: wrapper(`
      ${heading(`Welcome to TYP, ${input.name.split(" ")[0]}`)}
      <p style="margin:0 0 20px 0;">Your account is ready. You're all set up as a ${input.roleLabel} - jump in whenever you're ready.</p>
      ${button("Go to Dashboard", `${appUrl()}${input.dashboardPath}`)}
    `),
  }
}

export function assignmentNotificationEmail(input: { studentName: string; assessmentTitle: string; startDate: Date; endDate: Date }) {
  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
  return {
    subject: `New assessment assigned: ${input.assessmentTitle}`,
    html: wrapper(`
      ${heading("New assessment assigned")}
      <p style="margin:0 0 20px 0;">Hi ${input.studentName}, a new assessment has been assigned to you: <strong style="color:#142A4F;">${input.assessmentTitle}</strong>. Available from <strong style="color:#142A4F;">${fmt(input.startDate)}</strong> to <strong style="color:#142A4F;">${fmt(input.endDate)}</strong>.</p>
      ${button("View Exams", `${appUrl()}/student/exams`)}
    `),
  }
}

// Two real "your account access changed" cases found 2026-08-15, alongside
// the welcome-email gap: deleteContentAdmin (app/super-admin/content-admins/
// actions.ts) permanently deletes the User row, and removeAdmin
// (app/school-admin/settings/actions.ts) removes a SchoolAdmin's access to
// one school without deleting their User row. Both previously happened
// completely silently - the affected person had no way to find out except
// noticing they could no longer log in (or, for the content-admin case,
// couldn't log in at all since the account is gone). Sent *before* the
// delete in the content-admin case (the row won't exist to read an email
// address from afterward) and after in the school-admin case (no data is
// destroyed, just an access grant).
export function contentAdminAccountRemovedEmail(input: { name: string }) {
  return {
    subject: "Your TYP content admin account has been removed",
    html: wrapper(`
      ${heading("Account removed")}
      <p style="margin:0 0 12px 0;">Hi ${input.name}, your TYP content admin account has been removed by a platform administrator. You'll no longer be able to log in.</p>
      <p style="margin:0; font-size:13px; color:#7A88A0;">If you believe this was a mistake, <a href="${appUrl()}/contact" style="color:#0072D5;">contact us</a>.</p>
    `),
  }
}

export function removedAsSchoolAdminEmail(input: { name: string; schoolName: string }) {
  return {
    subject: `You've been removed as an administrator at ${input.schoolName}`,
    html: wrapper(`
      ${heading("Admin access removed")}
      <p style="margin:0 0 12px 0;">Hi ${input.name}, you've been removed as a school administrator at <strong style="color:#142A4F;">${input.schoolName}</strong> on TYP. Your TYP account still exists, but you no longer have access to that school's dashboard.</p>
      <p style="margin:0; font-size:13px; color:#7A88A0;">If you believe this was a mistake, <a href="${appUrl()}/contact" style="color:#0072D5;">contact us</a>.</p>
    `),
  }
}
