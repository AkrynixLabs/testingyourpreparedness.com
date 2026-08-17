// Internal newsletter interface (same "route third-party integrations
// through an internal layer, never call the SDK directly from business
// logic" pattern as lib/payments/paystack.ts and lib/email/resend.ts) -
// Brevo (https://www.brevo.com) is the newsletter/marketing-automation
// provider, confirmed with the user. Callers only ever see
// subscribeToNewsletter(), so a different provider could be swapped in later
// without touching call sites.

const BREVO_API_BASE = "https://api.brevo.com/v3"

function getApiKey(): string {
  const key = process.env.BREVO_API_KEY
  if (!key) {
    throw new Error("Newsletter signup isn't configured yet - set BREVO_API_KEY in .env (see .env.example).")
  }
  return key
}

function getListId(): number {
  const raw = process.env.BREVO_NEWSLETTER_LIST_ID
  const id = raw ? Number(raw) : NaN
  if (!raw || Number.isNaN(id)) {
    throw new Error(
      "Newsletter signup isn't configured yet - set BREVO_NEWSLETTER_LIST_ID in .env (see .env.example)."
    )
  }
  return id
}

export type SubscribeToNewsletterResult = { alreadySubscribed: boolean }

export async function subscribeToNewsletter(email: string): Promise<SubscribeToNewsletterResult> {
  const apiKey = getApiKey()
  const listId = getListId()

  const response = await fetch(`${BREVO_API_BASE}/contacts`, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    // updateEnabled: true means an email that's already on the list gets
    // added to it again (204, no error) instead of Brevo rejecting the call
    // as a duplicate - re-subscribing should never look like a failure to
    // the person filling out the form.
    body: JSON.stringify({ email, listIds: [listId], updateEnabled: true }),
  })

  // Brand-new contact: 201 Created. Existing contact updated/re-added to the
  // list: 204 No Content. Both are a real success from the caller's side.
  if (response.status === 201) return { alreadySubscribed: false }
  if (response.status === 204) return { alreadySubscribed: true }

  const body = await response.json().catch(() => null)
  throw new Error(body?.message ? `Brevo: ${body.message}` : `Brevo request failed (${response.status}).`)
}

// Best-effort subscribe: logs and swallows any error (missing key, Brevo API
// failure) instead of throwing - same pattern as lib/email/resend.ts's
// sendEmailBestEffort. Used at account signup, where checking a "send me
// marketing updates" box is a nice-to-have on top of an already-real account
// creation - a misconfigured/down Brevo must never block registration.
export async function subscribeToNewsletterBestEffort(email: string): Promise<void> {
  try {
    await subscribeToNewsletter(email)
  } catch (err) {
    console.error("[newsletter] best-effort subscribe failed:", err instanceof Error ? err.message : err)
  }
}
