import { NextResponse } from "next/server"
import { resendVerificationEmailBestEffort } from "@/lib/email-verification"
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limit"

// Mobile equivalent of app/verify-email/actions.ts's resendVerificationEmail
// (web) - reachable from LoginScreen's "email_not_verified" error state, no
// auth token exists yet at this point so this can't be an authenticated
// route. Always returns success regardless of whether the address exists or
// is already verified, same account-enumeration-safe shape as the web action.
export async function POST(request: Request) {
  const ip = getClientIpFromHeaders((name) => request.headers.get(name))
  const rateLimit = await checkRateLimit("verify-email", ip)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email : null
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 })
  }

  await resendVerificationEmailBestEffort(email)
  return NextResponse.json({ success: true })
}
