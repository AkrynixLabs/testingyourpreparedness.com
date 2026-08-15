import { NextResponse } from "next/server"
import { lookupSchoolByCode } from "@/lib/student/join"
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limit"

// Step 1 of the mobile school-code join flow, mirroring app/join's own
// verifySchoolCode - lets the client show the matched school's name/town
// before the student fills in the rest of the form. Shares the "signup"
// rate-limit bucket per IP with the register route below, same as the web
// flow shares it between verifySchoolCode/registerJoinedStudent.
export async function POST(request: Request) {
  const ip = getClientIpFromHeaders((name) => request.headers.get(name))
  const rateLimit = await checkRateLimit("signup", ip)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  const code = typeof body?.schoolCode === "string" ? body.schoolCode : null
  if (!code) {
    return NextResponse.json({ error: "School code is required." }, { status: 400 })
  }

  try {
    const school = await lookupSchoolByCode(code)
    return NextResponse.json(school)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid invite code." }, { status: 400 })
  }
}
