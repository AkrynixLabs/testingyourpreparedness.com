import { NextResponse } from "next/server"
import { createJoinedStudent } from "@/lib/student/join"
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limit"

// Step 2 of the mobile school-code join flow, mirroring app/join's own
// registerJoinedStudent. Independent-student signup (with plan selection +
// Paystack checkout) is a deliberately separate, not-yet-built follow-up -
// this route only covers the no-billing, school-provisioned path. Updated
// 2026-08-16: no longer signs the student in immediately - the account
// starts "pending" until a school admin approves it (see
// lib/student/join-approval.ts).
export async function POST(request: Request) {
  const ip = getClientIpFromHeaders((name) => request.headers.get(name))
  const rateLimit = await checkRateLimit("signup", ip)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  const schoolCode = typeof body?.schoolCode === "string" ? body.schoolCode : null
  const firstName = typeof body?.firstName === "string" ? body.firstName : null
  const lastName = typeof body?.lastName === "string" ? body.lastName : null
  const email = typeof body?.email === "string" ? body.email : null
  const password = typeof body?.password === "string" ? body.password : null
  const agreeTerms = body?.agreeTerms === true
  const subscribeNewsletter = body?.subscribeNewsletter === true

  if (!schoolCode || !firstName || !lastName || !email || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 })
  }
  if (!agreeTerms) {
    return NextResponse.json({ error: "You must agree to the Terms of Service and Privacy Policy." }, { status: 400 })
  }

  let created: Awaited<ReturnType<typeof createJoinedStudent>>
  try {
    created = await createJoinedStudent({ schoolCode, firstName, lastName, email, password, agreeTerms, subscribeNewsletter })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not create your account." }, { status: 400 })
  }

  // Decided/built 2026-08-16: no token is issued anymore - the account
  // starts "pending" and can't log in until a school admin approves it (see
  // lib/student/join-approval.ts). Previously this signed the new student
  // in immediately, same as the web join flow used to.
  return NextResponse.json({
    pendingApproval: true,
    schoolName: created.schoolName,
    message: "Your request has been sent to your school for approval. You'll get an email once a decision is made.",
  })
}
