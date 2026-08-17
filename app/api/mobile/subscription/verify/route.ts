import { NextResponse } from "next/server"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { verifyTransaction } from "@/lib/payments/paystack"

// Called by the Flutter app right after its checkout webview intercepts the
// Paystack callback redirect - best-effort UX confirmation only, same
// pattern as app/signup/independent/checkout/callback's own server logic
// and app/api/mobile/courses/purchase/verify. The webhook
// (app/api/webhooks/paystack/route.ts) remains the sole source of truth for
// actually creating/renewing the Subscription; this never touches it.
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

  try {
    const result = await verifyTransaction(reference)
    return NextResponse.json({ status: result.status === "success" ? "success" : "failed" })
  } catch {
    return NextResponse.json({ status: "unverifiable" })
  }
}
