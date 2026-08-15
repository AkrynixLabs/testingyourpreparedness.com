import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createJoinedStudent } from "@/lib/student/join"
import { signMobileToken } from "@/lib/mobile-auth"
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limit"

// Step 2 of the mobile school-code join flow, mirroring app/join's own
// registerJoinedStudent - creates the account then immediately signs the
// new student in (same shape as POST /api/mobile/auth/login's response) so
// the client never needs a second round trip. Independent-student signup
// (with plan selection + Paystack checkout) is a deliberately separate,
// not-yet-built follow-up - this route only covers the no-billing,
// school-provisioned path.
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

  if (!schoolCode || !firstName || !lastName || !email || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 })
  }

  let created: Awaited<ReturnType<typeof createJoinedStudent>>
  try {
    created = await createJoinedStudent({ schoolCode, firstName, lastName, email, password })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not create your account." }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: created.email } })
  if (!user) {
    return NextResponse.json({ error: "Something went wrong creating your account." }, { status: 500 })
  }

  const token = await signMobileToken({ id: user.id, email: user.email, name: user.name, role: user.role })

  return NextResponse.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })
}
