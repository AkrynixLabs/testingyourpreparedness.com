import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react"
import { verifyTransaction } from "@/lib/payments/paystack"

// Same pattern as app/signup/school/checkout/callback - synchronous,
// best-effort confirmation for the user's own UX only. The webhook
// (app/api/webhooks/paystack/route.ts) is the actual source of truth.
export default async function SubscriptionCheckoutCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>
}) {
  const { reference } = await searchParams

  let outcome: "success" | "pending" | "failed" | "unverifiable" = "unverifiable"
  if (reference) {
    try {
      const result = await verifyTransaction(reference)
      outcome = result.status === "success" ? "success" : "failed"
    } catch {
      outcome = "unverifiable"
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <Card>
        <CardHeader className="text-center">
          {outcome === "success" ? (
            <>
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <CardTitle className="text-2xl">Payment Successful</CardTitle>
              <CardDescription>Your subscription has been updated.</CardDescription>
            </>
          ) : outcome === "failed" ? (
            <>
              <div className="mx-auto h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <CardTitle className="text-2xl">Payment Not Completed</CardTitle>
              <CardDescription>Your card wasn&apos;t charged. Your plan is unchanged.</CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <CardTitle className="text-2xl">Confirming Payment</CardTitle>
              <CardDescription>
                We couldn&apos;t confirm this payment&apos;s status directly - it may still be processing.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/school-admin/subscription">Back to Subscription</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
