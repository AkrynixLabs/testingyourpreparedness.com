import { NextResponse } from "next/server"
import { registerIndependentStudent } from "@/lib/student/independent-registration"
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limit"

// Independent-student mobile signup - the deliberately-deferred follow-up to
// app/api/mobile/auth/join (school-code join), now built (confirmed with the
// user 2026-08-18). Account creation only, no plan/checkout step - see
// lib/student/independent-registration.ts's own note for why. No token is
// returned: the account starts unverified (same as every other self-signup
// path, see prisma/schema.prisma's User.emailVerified), so the client can't
// log in until the emailed verification link is used - the app should show a
// "check your email" confirmation instead, same as the web wizard does.
export async function POST(request: Request) {
  const ip = getClientIpFromHeaders((name) => request.headers.get(name))
  const rateLimit = await checkRateLimit("signup", ip)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  const firstName = typeof body?.firstName === "string" ? body.firstName : null
  const lastName = typeof body?.lastName === "string" ? body.lastName : null
  const email = typeof body?.email === "string" ? body.email : null
  const password = typeof body?.password === "string" ? body.password : null
  const region = typeof body?.region === "string" ? body.region : null
  const town = typeof body?.town === "string" ? body.town : null
  const agreeTerms = body?.agreeTerms === true
  const subscribeNewsletter = body?.subscribeNewsletter === true
  const referralCode = typeof body?.referralCode === "string" ? body.referralCode : undefined

  if (!firstName || !lastName || !email || !password || !region || !town) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 })
  }
  if (!agreeTerms) {
    return NextResponse.json({ error: "You must agree to the Terms of Service and Privacy Policy." }, { status: 400 })
  }

  try {
    const result = await registerIndependentStudent({
      firstName,
      lastName,
      email,
      password,
      region,
      town,
      subscribeNewsletter,
      referralCode,
    })
    return NextResponse.json({ email: result.email, pendingVerification: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not create your account." }, { status: 400 })
  }
}
