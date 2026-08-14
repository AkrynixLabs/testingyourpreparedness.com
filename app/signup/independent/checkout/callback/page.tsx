import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, Clock, GraduationCap } from "lucide-react"
import { CustomCursor } from "@/components/custom-cursor"
import { verifyTransaction } from "@/lib/payments/paystack"

// Same pattern as app/signup/school/checkout/callback - synchronous,
// best-effort confirmation for the user's own UX only. The webhook
// (app/api/webhooks/paystack/route.ts) is the actual source of truth.
export default async function StudentCheckoutCallbackPage({
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
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground bg-gradient-to-br from-background via-background to-primary/5">
      <CustomCursor />
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">TYP</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              {outcome === "success" ? (
                <>
                  <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </div>
                  <CardTitle className="text-2xl">Payment Successful</CardTitle>
                  <CardDescription>Your subscription is being activated.</CardDescription>
                </>
              ) : outcome === "failed" ? (
                <>
                  <div className="mx-auto h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                  <CardTitle className="text-2xl">Payment Not Completed</CardTitle>
                  <CardDescription>Your card wasn&apos;t charged. You can try again anytime.</CardDescription>
                </>
              ) : (
                <>
                  <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                  <CardTitle className="text-2xl">Confirming Payment</CardTitle>
                  <CardDescription>
                    We couldn&apos;t confirm this payment&apos;s status directly - it may still be processing. Check
                    your email or contact support if this persists.
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/student">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
