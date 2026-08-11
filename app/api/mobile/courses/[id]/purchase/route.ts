import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { initializeCoursePurchaseForStudent } from "@/lib/student/courses"

// Reuses the exact same web callback URL as its callbackUrl (rather than a
// dedicated mobile-only route) - the Flutter app's purchase webview
// intercepts navigation to this URL (matching on the `reference` query
// param) before it ever actually loads, then calls
// GET /api/mobile/courses/purchase/verify itself for a native result screen.
// This means Paystack's hosted checkout page is the only thing that ever
// really renders inside the webview - no raw card entry in this app, same
// rule the web app follows.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const student = await prisma.student.findUnique({ where: { userId: authUser.id } })
  if (!student) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 })
  }

  const { id } = await params
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  try {
    const result = await initializeCoursePurchaseForStudent(
      student.id,
      authUser.email,
      id,
      `${appUrl}/student/courses/checkout/callback`
    )
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start checkout."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
