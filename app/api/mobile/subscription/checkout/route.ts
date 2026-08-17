import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { stripTrailingSlash } from "@/lib/utils"
import type { BillingCycle } from "@/lib/generated/prisma/client"
import { initializeSubscriptionCheckoutForStudent } from "@/lib/student/subscription"

// Same webview-interception pattern as app/api/mobile/courses/[id]/purchase:
// reuses the real web callback URL (app/signup/independent/checkout/callback)
// as the Paystack callbackUrl, since the Flutter app's checkout webview
// intercepts navigation to it before it ever loads and calls
// GET /api/mobile/subscription/verify itself for a native result screen.
export async function POST(request: Request) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const student = await prisma.student.findUnique({ where: { userId: authUser.id } })
  if (!student) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 })
  }
  if (student.enrollmentType !== "independent") {
    return NextResponse.json({ error: "Only independent students can upgrade a personal subscription." }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  const planId = typeof body?.planId === "string" ? body.planId : null
  const billingCycle = typeof body?.billingCycle === "string" ? (body.billingCycle as BillingCycle) : null
  if (!planId || !billingCycle) {
    return NextResponse.json({ error: "planId and billingCycle are required." }, { status: 400 })
  }

  const appUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")

  try {
    const result = await initializeSubscriptionCheckoutForStudent(
      student.id,
      planId,
      billingCycle,
      `${appUrl}/signup/independent/checkout/callback`
    )
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start checkout."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
