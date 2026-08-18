import { NextResponse } from "next/server"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limit"
import { createContactMessage } from "@/lib/support/contact-message"

// Backs the mobile app's Support tab "Send us a message" form - reuses the
// exact ContactMessage row the public web /contact form creates (see
// lib/support/contact-message.ts), rather than a second copy of that
// validation. Unlike the web form, name/email/role are derived from the
// authenticated student, not re-typed - a logged-in student shouldn't have
// to re-enter identity info the app already has.
export async function POST(request: Request) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const ip = getClientIpFromHeaders((name) => request.headers.get(name))
  const rateLimit = await checkRateLimit("contact", ip)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many messages sent. Try again later." }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  const subject = typeof body?.subject === "string" ? body.subject : null
  const message = typeof body?.message === "string" ? body.message : null
  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required." }, { status: 400 })
  }

  const [firstName, ...rest] = authUser.name.trim().split(/\s+/)

  try {
    await createContactMessage({
      firstName: firstName || authUser.name,
      lastName: rest.join(" ") || "-",
      email: authUser.email,
      role: "student",
      subject,
      message,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to send message." }, { status: 400 })
  }
}
