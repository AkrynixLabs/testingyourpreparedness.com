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

// Broader audit 2026-08-15, prompted by the user asking for "any important
// email notification there should be" after the account-removed pair above -
// went through every status/moderation action in the app looking for other
// currently-silent ones. Confirmed in scope with the user (multi-select,
// picked these 6 + flagged payment receipts and approval confirmations as
// real but deliberately deferred - see docs/build-log.md's 2026-08-15 entry).

// Shared by content-admin and tutor suspend/reactivate (setContentAdminStatus,
// setTutorStatus) - both are a simple "you can/can't log in" toggle, same
// message shape either way.
export function accountStatusChangedEmail(input: { name: string; roleLabel: string; active: boolean }) {
  return {
    subject: input.active ? "Your TYP account has been reactivated" : "Your TYP account has been suspended",
    html: wrapper(
      input.active
        ? `
          ${heading("Account reactivated")}
          <p style="margin:0 0 20px 0;">Hi ${input.name}, your TYP ${input.roleLabel} account has been reactivated. You can log in again now.</p>
          ${button("Log In", `${appUrl()}/login`)}
        `
        : `
          ${heading("Account suspended")}
          <p style="margin:0 0 12px 0;">Hi ${input.name}, your TYP ${input.roleLabel} account has been suspended by a platform administrator. You won't be able to log in until it's reactivated.</p>
          <p style="margin:0; font-size:13px; color:#7A88A0;">If you believe this was a mistake, <a href="${appUrl()}/contact" style="color:#0072D5;">contact us</a>.</p>
        `
    ),
  }
}

// Sent to the school's own contact email (School.email) rather than a
// specific admin, since a school can have several admins and this affects
// all of them equally - matches how the rest of the app treats School.email
// as the school's own address (e.g. Paystack checkout receipts).
export function schoolStatusChangedEmail(input: { schoolName: string; status: "active" | "suspended" }) {
  return {
    subject:
      input.status === "active"
        ? `${input.schoolName} has been approved on TYP`
        : `${input.schoolName}'s TYP account has been suspended`,
    html: wrapper(
      input.status === "active"
        ? `
          ${heading("School approved")}
          <p style="margin:0 0 20px 0;"><strong style="color:#142A4F;">${input.schoolName}</strong> has been verified and approved on TYP. Every school admin can now log in and get started.</p>
          ${button("Log In", `${appUrl()}/login`)}
        `
        : `
          ${heading("School suspended")}
          <p style="margin:0 0 12px 0;"><strong style="color:#142A4F;">${input.schoolName}</strong>'s TYP account has been suspended by a platform administrator. School admins won't be able to log in until it's reactivated.</p>
          <p style="margin:0; font-size:13px; color:#7A88A0;">If you believe this was a mistake, <a href="${appUrl()}/contact" style="color:#0072D5;">contact us</a>.</p>
        `
    ),
  }
}

// Shared by flagCourse/removeCourse (app/super-admin/courses/actions.ts).
// "flagged" is reversible (course exists, just hidden from the catalog);
// "removed" is not - the copy is deliberately different, not just a
// find-replace on one word.
export function courseModeratedEmail(input: { tutorName: string; courseTitle: string; action: "flagged" | "removed"; reason: string }) {
  return {
    subject:
      input.action === "flagged"
        ? `Your course "${input.courseTitle}" has been flagged`
        : `Your course "${input.courseTitle}" has been removed`,
    html: wrapper(`
      ${heading(input.action === "flagged" ? "Course flagged" : "Course removed")}
      <p style="margin:0 0 12px 0;">Hi ${input.tutorName}, your course <strong style="color:#142A4F;">${input.courseTitle}</strong> has been ${input.action === "flagged" ? "flagged and temporarily hidden from the catalog" : "removed from TYP"} by a platform administrator.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;">
        <tr>
          <td style="background-color:#EEF3FA; border-radius:8px; padding:14px 16px; font-size:14px; color:#142A4F;">
            Reason: ${input.reason}
          </td>
        </tr>
      </table>
      <p style="margin:0; font-size:13px; color:#7A88A0;">Questions about this decision? <a href="${appUrl()}/contact" style="color:#0072D5;">Contact us</a>.</p>
    `),
  }
}

// Shared by rejectQuestion/rejectAssessment (app/super-admin/review-queue/
// actions.ts) - the one review-queue outcome that carries actionable
// feedback (a reason), unlike approval, which is why it's the one built in
// this pass and approval isn't (see the build-log entry for the full call).
export function contentRejectedEmail(input: { name: string; contentType: "question" | "assessment"; excerpt: string; reason: string }) {
  return {
    subject: `Your ${input.contentType} submission was rejected`,
    html: wrapper(`
      ${heading("Submission rejected")}
      <p style="margin:0 0 12px 0;">Hi ${input.name}, a ${input.contentType} you submitted was rejected during review:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px 0;">
        <tr>
          <td style="background-color:#EEF3FA; border-radius:8px; padding:14px 16px; font-size:14px; color:#142A4F; font-style:italic;">
            &ldquo;${input.excerpt}&rdquo;
          </td>
        </tr>
      </table>
      <p style="margin:0 0 20px 0;"><strong style="color:#142A4F;">Reason:</strong> ${input.reason}</p>
      ${button("View in TYP", `${appUrl()}/content-admin`)}
    `),
  }
}

// Sent right after a successful password change (not the reset-request
// email, which already exists) - a real security-best-practice gap: an
// account-takeover attempt that changes the password currently produces no
// signal to the real owner at all. Deliberately vague about *how* it was
// changed (this is shared by 5 near-identical updatePassword actions across
// every role's own settings page - content-admin, school-admin, super-admin,
// student, tutor) since the mechanism is always the same "logged in, entered
// current + new password" flow.
export function passwordChangedEmail(input: { name: string }) {
  return {
    subject: "Your TYP password was changed",
    html: wrapper(`
      ${heading("Password changed")}
      <p style="margin:0 0 12px 0;">Hi ${input.name}, your TYP password was just changed.</p>
      <p style="margin:0; font-size:13px; color:#7A88A0;">If this wasn't you, <a href="${appUrl()}/contact" style="color:#0072D5;">contact us</a> right away.</p>
    `),
  }
}

// Three-email lifecycle for self-service account deletion (added 2026-08-15,
// student/tutor only - see lib/account-deletion.ts for the full flow).
// Anonymized, not hard-deleted, once the 30-day window elapses - "removed"
// wording is deliberately avoided in favor of being precise about what
// actually happens (login stops working, personal info is wiped; the
// account isn't a literal missing row afterward).
export function accountDeletionRequestedEmail(input: { name: string; scheduledDate: string }) {
  return {
    subject: "Your TYP account deletion is scheduled",
    html: wrapper(`
      ${heading("Deletion scheduled")}
      <p style="margin:0 0 12px 0;">Hi ${input.name}, we've received your request to delete your TYP account. It's scheduled for <strong style="color:#142A4F;">${input.scheduledDate}</strong> - 30 days from today.</p>
      <p style="margin:0 0 20px 0;">Changed your mind, or this wasn't you? Log in before then and cancel it from Settings.</p>
      ${button("Log In", `${appUrl()}/login`)}
      <p style="margin:20px 0 0 0; font-size:13px; color:#7A88A0;">After that date, your name, email, and password will be permanently wiped and you won't be able to log in again.</p>
    `),
  }
}

export function accountDeletionCancelledEmail(input: { name: string }) {
  return {
    subject: "Your TYP account deletion was cancelled",
    html: wrapper(`
      ${heading("Deletion cancelled")}
      <p style="margin:0 0 12px 0;">Hi ${input.name}, your scheduled account deletion has been cancelled. Your account is safe and nothing has changed.</p>
      <p style="margin:0; font-size:13px; color:#7A88A0;">Didn't do this? <a href="${appUrl()}/contact" style="color:#0072D5;">Contact us</a> right away.</p>
    `),
  }
}

// Sent right before the anonymization itself runs (the account's real email
// address won't be usable to reach afterward - same "send before, not
// after" ordering as contentAdminAccountRemovedEmail).
export function accountDeletedEmail(input: { name: string }) {
  return {
    subject: "Your TYP account has been deleted",
    html: wrapper(`
      ${heading("Account deleted")}
      <p style="margin:0 0 12px 0;">Hi ${input.name}, as requested 30 days ago, your TYP account has now been deleted. Your name, email, and password have been permanently removed and you can no longer log in.</p>
      <p style="margin:0; font-size:13px; color:#7A88A0;">This is the last email you'll receive from us regarding this account.</p>
    `),
  }
}
