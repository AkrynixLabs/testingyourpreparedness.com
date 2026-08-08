"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, ArrowLeft, Crown, Zap, Building2, Users, Sparkles, CreditCard, Calendar, AlertCircle, ArrowRight } from "lucide-react"
import { initiateUpgradeCheckout } from "../actions"
import type { BillingCycle, SubscriptionPlan } from "@/lib/generated/prisma/client"

const planIcon: Record<string, typeof Zap> = { starter: Zap, professional: Crown, enterprise: Building2 }

export function UpgradeView({
  plans,
  currentPlanId,
  currentBillingCycle,
}: {
  plans: SubscriptionPlan[]
  currentPlanId: string | null
  currentBillingCycle: BillingCycle | null
}) {
  const [selectedPlanId, setSelectedPlanId] = useState(currentPlanId ?? plans[1]?.id ?? plans[0]?.id ?? "")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(currentBillingCycle === "yearly" ? "yearly" : "monthly")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const selectedPlan = plans.find((p) => p.id === selectedPlanId)
  const currentIndex = plans.findIndex((p) => p.id === currentPlanId)
  const selectedIndex = plans.findIndex((p) => p.id === selectedPlanId)
  const isCurrentPlan = selectedPlanId === currentPlanId && billingCycle === currentBillingCycle
  const isUpgrade = currentPlanId !== null && selectedIndex > currentIndex
  const isDowngrade = currentPlanId !== null && selectedIndex < currentIndex

  const getMonthlyEquivalent = (plan: SubscriptionPlan) =>
    billingCycle === "yearly" && plan.yearlyPrice ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice ?? 0
  const getPrice = (plan: SubscriptionPlan) => (billingCycle === "yearly" ? plan.yearlyPrice ?? 0 : plan.monthlyPrice ?? 0)
  const getSavings = (plan: SubscriptionPlan) => (plan.monthlyPrice ?? 0) * 12 - (plan.yearlyPrice ?? 0)

  const handleConfirm = () => {
    if (!selectedPlan) return
    setError(null)
    startTransition(async () => {
      try {
        const { authorizationUrl } = await initiateUpgradeCheckout(selectedPlan.id, billingCycle)
        window.location.href = authorizationUrl
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start checkout.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/school-admin/subscription">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Change Plan</h1>
          <p className="text-muted-foreground mt-1">Choose the plan that best fits your school&apos;s needs</p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Billing Cycle</p>
                <p className="text-sm text-muted-foreground">Save with yearly billing</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="billing-toggle" className={billingCycle === "monthly" ? "font-medium" : "text-muted-foreground"}>
                Monthly
              </Label>
              <Switch
                id="billing-toggle"
                checked={billingCycle === "yearly"}
                onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
              />
              <Label htmlFor="billing-toggle" className={billingCycle === "yearly" ? "font-medium" : "text-muted-foreground"}>
                Yearly
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <RadioGroup value={selectedPlanId} onValueChange={setSelectedPlanId} className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id
          const isCurrent = plan.id === currentPlanId
          const Icon = planIcon[plan.id] ?? Zap
          const features = plan.features as string[]

          return (
            <div key={plan.id} className="relative">
              <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
              <Label htmlFor={plan.id} className="cursor-pointer block">
                <Card className={`relative transition-all h-full ${isSelected ? "border-primary shadow-md ring-2 ring-primary/20" : "hover:border-primary/50 hover:shadow-sm"}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-primary">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 right-4 z-10">
                      <Badge variant="outline" className="bg-background">
                        Current Plan
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2 pt-6">
                    <div className="mx-auto rounded-full bg-primary/10 p-3 w-fit mb-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        {plan.currency} {getMonthlyEquivalent(plan)}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {billingCycle === "yearly" && plan.yearlyPrice && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {plan.currency} {getPrice(plan)} billed yearly
                        {getSavings(plan) > 0 && (
                          <span className="text-emerald-600 font-medium ml-1">(Save {plan.currency} {getSavings(plan)})</span>
                        )}
                      </p>
                    )}
                    <div className="flex items-center justify-center gap-1 mt-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {plan.studentLimit === null ? "Unlimited" : `Up to ${plan.studentLimit}`} students
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <Separator />
                    <ul className="space-y-2">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Label>
            </div>
          )
        })}
      </RadioGroup>

      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {isCurrentPlan ? "You're on this plan" : isUpgrade ? "Upgrade to " + selectedPlan?.name : currentPlanId ? "Switch to " + selectedPlan?.name : "Subscribe to " + selectedPlan?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedPlan?.currency} {getMonthlyEquivalent(selectedPlan!)}/month
                  {billingCycle === "yearly" && ` (${selectedPlan?.currency} ${getPrice(selectedPlan!)} billed yearly)`}
                </p>
                {isDowngrade && (
                  <p className="text-sm text-amber-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    Downgrading will reduce your student limit
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/school-admin/subscription">Cancel</Link>
              </Button>
              <Button disabled={isCurrentPlan} onClick={() => setShowConfirmDialog(true)}>
                {isCurrentPlan ? "Current Plan" : isUpgrade ? "Upgrade Now" : currentPlanId ? "Change Plan" : "Subscribe"}
                {!isCurrentPlan && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Plan Change</DialogTitle>
            <DialogDescription>
              You&apos;ll be taken to a secure Paystack checkout to complete this {isUpgrade || !currentPlanId ? "payment" : "change"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">New Plan</span>
                <span className="font-medium">{selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing Cycle</span>
                <span className="font-medium capitalize">{billingCycle}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Amount Due</span>
                <span className="font-bold text-primary">
                  {selectedPlan?.currency} {getPrice(selectedPlan!)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Charged in full for the new billing period - there&apos;s no prorated-credit calculation for the
                remainder of your current period yet.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isPending}>
              {isPending ? "Redirecting..." : "Continue to Checkout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
