import { NextResponse } from "next/server"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { verifyCoursePurchaseForStudent } from "@/lib/student/courses"

// Called by the Flutter app right after its purchase webview intercepts the
// Paystack callback redirect (see [id]/purchase/route.ts's doc comment) -
// best-effort UX confirmation only, same as the web checkout callback page.
// The webhook (app/api/webhooks/paystack/route.ts) remains the sole source
// of truth for actually creating the Enrollment; this never creates one.
export async function GET(request: Request) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const reference = searchParams.get("reference")
  if (!reference) {
    return NextResponse.json({ error: "Missing reference." }, { status: 400 })
  }

  const status = await verifyCoursePurchaseForStudent(reference)
  return NextResponse.json({ status })
}
