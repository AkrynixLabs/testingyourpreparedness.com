"use server"

import { verifyEmailToken, resendVerificationEmailBestEffort, type VerifyEmailTokenResult } from "@/lib/email-verification"
import { enforceRateLimit } from "@/lib/rate-limit"

// A real Server Action, not a mutation directly inside the page's Server
// Component - deliberately requires an explicit button click (see
// verify-email-action.tsx) rather than firing the moment the page loads.
// Some email clients/security scanners pre-fetch links in an inbox before a
// user ever opens the email, which would silently burn a one-time-use
// token before the real recipient clicks it if verification happened on a
// bare GET - same reasoning behind app/invite/accept requiring a real form
// submit rather than acting on page load.
export async function confirmEmailVerification(token: string): Promise<VerifyEmailTokenResult> {
  return verifyEmailToken(token)
}

// Reachable from the login page's "your email isn't verified yet" state.
// Always resolves the same way regardless of whether the address exists or
// is already verified - matches this codebase's existing best-effort-send
// precedent (never reveals account existence via response shape).
export async function resendVerificationEmail(email: string): Promise<void> {
  await enforceRateLimit("verify-email")
  await resendVerificationEmailBestEffort(email)
}
