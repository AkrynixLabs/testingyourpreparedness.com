import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react"
import { verifyTransaction } from "@/lib/payments/paystack"

// Same pattern as every other checkout callback in this app - synchronous,
// best-effort confirmation for the user's own UX only. The webhook
// (handleCoursePurchaseSuccess in app/api/webhooks/paystack/route.ts) is the
// actual source of truth that creates the Enrollment.
export default async function CourseCheckoutCallbackPage({
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
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {outcome === "success" ? (
            <>
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <CardTitle className="text-2xl">Payment Successful</CardTitle>
              <CardDescription>Your enrollment is being activated.</CardDescription>
            </>
          ) : outcome === "failed" ? (
            <>
              <div className="mx-auto h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <CardTitle className="text-2xl">Payment Not Completed</CardTitle>
              <CardDescription>You weren&apos;t charged. You can try again anytime.</CardDescription>
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
            <Link href="/student/courses">Browse Courses</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
