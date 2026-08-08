"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Users,
  FileText,
  ArrowRight,
  Receipt,
  Crown,
  Zap,
  Shield,
  HelpCircle,
} from "lucide-react"
import { cancelSubscription } from "./actions"
import type { BillingCycle, InvoiceStatus, PaymentMethodType, SubscriptionStatus } from "@/lib/generated/prisma/client"

type SubscriptionData = {
  planName: string
  price: number | null
  currency: string
  billingCycle: BillingCycle
  studentLimit: number | null
  startDate: string
  renewalDate: string
  status: SubscriptionStatus
  features: string[]
}

type InvoiceRow = { id: string; date: string; amount: number; status: InvoiceStatus; period: string }
type PaymentMethodData = { type: PaymentMethodType; brand: string | null; last4: string | null; expiry: string | null }

export function SubscriptionView({
  school,
  subscription,
  currentStudents,
  recentInvoices,
  paymentMethod,
}: {
  school: { name: string; address: string; town: string; region: string }
  subscription: SubscriptionData | null
  currentStudents: number
  recentInvoices: InvoiceRow[]
  paymentMethod: PaymentMethodData | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleCancel = () => {
    setError(null)
    startTransition(async () => {
      try {
        await cancelSubscription()
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to cancel subscription.")
      }
    })
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-muted-foreground mt-1">Manage your plan, billing, and payment methods</p>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <Crown className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No active subscription</h3>
            <p className="text-muted-foreground mb-4">
              Your school hasn&apos;t completed a plan purchase yet, or a previous checkout didn&apos;t finish.
            </p>
            <Button asChild>
              <Link href="/school-admin/subscription/upgrade">Choose a Plan</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const studentUsagePercent = subscription.studentLimit ? (currentStudents / subscription.studentLimit) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-muted-foreground mt-1">Manage your plan, billing, and payment methods</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/school-admin/subscription/invoices">
              <Receipt className="h-4 w-4 mr-2" />
              View All Invoices
            </Link>
          </Button>
          <Button asChild>
            <Link href="/school-admin/subscription/upgrade">
              <Zap className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{subscription.billingCycle === "yearly" ? "Yearly" : subscription.billingCycle === "term" ? "Termly" : "Monthly"} Cost</p>
                <p className="text-2xl font-bold">
                  {subscription.currency} {subscription.price ?? "-"}
                </p>
              </div>
              <div className="rounded-full bg-muted p-3 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Student Seats</p>
                <p className="text-2xl font-bold">
                  {currentStudents}/{subscription.studentLimit ?? "∞"}
                </p>
              </div>
              <div className="rounded-full bg-muted p-3 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next Billing</p>
                <p className="text-2xl font-bold">{new Date(subscription.renewalDate).toLocaleDateString()}</p>
              </div>
              <div className="rounded-full bg-muted p-3 text-amber-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-bold capitalize">{subscription.status.replace("_", " ")}</p>
              </div>
              <div className="rounded-full bg-muted p-3 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>Your subscription details</CardDescription>
                </div>
              </div>
              <Badge
                className={
                  subscription.status === "active"
                    ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                    : subscription.status === "past_due"
                    ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                    : "bg-muted text-muted-foreground"
                }
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {subscription.status.replace("_", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl font-bold">{subscription.planName}</h3>
                <p className="text-muted-foreground">
                  {subscription.currency} {subscription.price}/{subscription.billingCycle}
                </p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Started</p>
                  <p className="font-semibold">{new Date(subscription.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Renews</p>
                  <p className="font-semibold">{new Date(subscription.renewalDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <Separator />

            {subscription.studentLimit && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Student Seats</span>
                  </div>
                  <span className="text-sm">
                    {currentStudents} / {subscription.studentLimit} used
                  </span>
                </div>
                <Progress value={studentUsagePercent} className="h-2" />
                {studentUsagePercent > 80 && (
                  <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Running low on student seats</p>
                      <p className="text-sm text-amber-700 mt-1">
                        You&apos;re using {Math.round(studentUsagePercent)}% of your student seats. Consider upgrading
                        to add more students.
                      </p>
                      <Button size="sm" variant="outline" className="mt-2" asChild>
                        <Link href="/school-admin/subscription/upgrade">View Upgrade Options</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-3">Plan Features</h4>
              <div className="grid gap-2 md:grid-cols-2">
                {subscription.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" asChild>
                <Link href="/school-admin/subscription/upgrade">Change Plan</Link>
              </Button>
              {subscription.status !== "cancelled" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-destructive hover:text-destructive">
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your school will lose access to plan features. This doesn&apos;t issue a refund for the
                        current billing period.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={(e) => {
                          e.preventDefault()
                          handleCancel()
                        }}
                        disabled={isPending}
                      >
                        {isPending ? "Cancelling..." : "Cancel Subscription"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethod ? (
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded bg-muted p-2">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {paymentMethod.brand ?? "Card"} **** {paymentMethod.last4 ?? "----"}
                      </p>
                      <p className="text-sm text-muted-foreground">Expires {paymentMethod.expiry ?? "-"}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Default
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No payment method on file yet.</p>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/school-admin/subscription/payment-method">Manage Payment Methods</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-primary" />
                Renewal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`font-medium ${subscription.status === "active" ? "text-emerald-600" : "text-muted-foreground"}`}>
                {subscription.status === "active" ? "Active" : subscription.status === "cancelled" ? "Cancelled" : "Past Due"}
              </p>
              <p className="text-sm text-muted-foreground">
                {subscription.status === "cancelled"
                  ? "This subscription will not renew."
                  : `Renews on ${new Date(subscription.renewalDate).toLocaleDateString()}.`}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Recent Invoices
              </CardTitle>
              <CardDescription>Your latest billing statements</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/school-admin/subscription/invoices">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No invoices yet.</p>
          ) : (
            <div className="space-y-3">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-muted p-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.period} - {new Date(invoice.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">GHS {invoice.amount}</p>
                      <Badge
                        className={
                          invoice.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : invoice.status === "overdue"
                            ? "bg-red-500/10 text-red-600"
                            : "bg-amber-500/10 text-amber-600"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Need help with your subscription?</h3>
                <p className="text-sm text-muted-foreground">Contact our support team for billing questions or plan changes</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
