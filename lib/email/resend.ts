import { Resend } from "resend"

// Internal email interface (same "route third-party integrations through an
// internal layer, never call the SDK directly from business logic" pattern
// as lib/payments/paystack.ts) - Resend is the only provider today, but
// callers only ever see sendEmail(), so swapping providers later wouldn't
// touch any call site.

function getClient(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    throw new Error("Email isn't configured yet - set RESEND_API_KEY in .env (see .env.example).")
  }
  return new Resend(key)
}

export type SendEmailInput = {
  to: string
  subject: string
  html: string
  // Added for the weekly platform report (see lib/reports/generate.ts) -
  // Resend's own Attachment.content accepts a Buffer directly, no manual
  // base64 encoding needed.
  attachments?: { filename: string; content: Buffer; contentType?: string }[]
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const client = getClient()
  const from = process.env.EMAIL_FROM || "TYP <onboarding@resend.dev>"

  const { error } = await client.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    attachments: input.attachments,
  })

  if (error) {
    throw new Error(`Resend failed to send email: ${error.message}`)
  }
}

// Best-effort send: logs and swallows any error (missing key, Resend API
// failure) instead of throwing - used by every caller where email is a nice-
// to-have on top of an already-real in-app fallback (e.g. a displayed reset
// link), so a misconfigured/down email provider never blocks the underlying
// feature. Callers where email delivery IS the entire point of the action
// (there is no in-app fallback) should call sendEmail() directly instead and
// let the error surface.
export async function sendEmailBestEffort(input: SendEmailInput): Promise<void> {
  try {
    await sendEmail(input)
  } catch (err) {
    console.error("[email] best-effort send failed:", err instanceof Error ? err.message : err)
  }
}
