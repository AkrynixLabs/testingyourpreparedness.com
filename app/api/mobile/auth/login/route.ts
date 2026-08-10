import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { signMobileToken } from "@/lib/mobile-auth"
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limit"

// v1 mobile app is student-only (see CLAUDE.md's mobile-app decision) -
// other roles sign in through the web app until the app grows beyond the
// exam-taking loop. Reuses the exact same credential check as auth.ts's
// Credentials provider (same bcrypt compare, same rate-limit bucket) rather
// than a parallel login implementation.
export async function POST(request: Request) {
  const ip = getClientIpFromHeaders((name) => request.headers.get(name))
  const rateLimit = await checkRateLimit("login", ip)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null
  const password = typeof body?.password === "string" ? body.password : null
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
  }

  if (user.role !== "student") {
    return NextResponse.json(
      { error: "The TYP mobile app is currently available to students only." },
      { status: 403 }
    )
  }

  const token = await signMobileToken({ id: user.id, email: user.email, name: user.name, role: user.role })

  return NextResponse.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })
}
