"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import {
  CheckCircle2,
  ArrowLeft,
  Crown,
  Zap,
  Building2,
  Users,
  Sparkles,
  CreditCard,
  Calendar,
  AlertCircle,
  ArrowRight,
} from "lucide-react"

const plans = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 150,
    yearlyPrice: 1440,
    currency: "GHS",
    studentLimit: 100,
    description: "Perfect for small schools getting started",
    features: [
      "Up to 100 students",
      "Basic assessments",
      "Standard reports",
      "Email support",
      "5 GB storage",
    ],
    icon: Zap,
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    monthlyPrice: 350,
    yearlyPrice: 3360,
    currency: "GHS",
    studentLimit: 500,
    description: "Ideal for growing schools with more needs",
    features: [
      "Up to 500 students",
      "Unlimited assessments",
      "Detailed analytics",
      "Priority support",
      "Custom branding",
      "10 GB storage",
      "API access",
    ],
    icon: Crown,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 750,
    yearlyPrice: 7200,
    currency: "GHS",
    studentLimit: -1,
    description: "For large institutions with advanced requirements",
    features: [
      "Unlimited students",
      "Unlimited everything",
      "Advanced analytics",
      "Dedicated account manager",
      "White-label option",
      "50 GB storage",
      "Full API access",
      "Custom integrations",
      "SLA guarantee",
    ],
    icon: Building2,
    popular: false,
  },
]

const currentPlan = {
  id: "professional",
  name: "Professional",
  price: 350,
  billingCycle: "monthly" as "monthly" | "yearly",
}

export default function UpgradePage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState(currentPlan.id)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const selectedPlanDetails = plans.find((p) => p.id === selectedPlan)
  const isCurrentPlan = selectedPlan === currentPlan.id && billingCycle === currentPlan.billingCycle
  const isUpgrade = plans.findIndex((p) => p.id === selectedPlan) > plans.findIndex((p) => p.id === currentPlan.id)
  const isDowngrade = plans.findIndex((p) => p.id === selectedPlan) < plans.findIndex((p) => p.id === currentPlan.id)

  const getPrice = (plan: typeof plans[0]) => {
    return billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice
  }

  const getMonthlyEquivalent = (plan: typeof plans[0]) => {
    return billingCycle === "yearly" ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice
  }

  const getSavings = (plan: typeof plans[0]) => {
    const yearlySavings = plan.monthlyPrice * 12 - plan.yearlyPrice
    return yearlySavings
  }

  const handleConfirm = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setShowConfirmDialog(false)
      router.push("/school-admin/subscription?success=true")
    }, 2000)
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
          <p className="text-muted-foreground mt-1">
            Choose the plan that best fits your school&apos;s needs
          </p>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Billing Cycle</p>
                <p className="text-sm text-muted-foreground">Save 20% with yearly billing</p>
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
              {billingCycle === "yearly" && (
                <Badge className="bg-emerald-500/10 text-emerald-600 ml-2">Save 20%</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id
          const isCurrent = plan.id === currentPlan.id
          const Icon = plan.icon

          return (
            <div key={plan.id} className="relative">
              <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
              <Label htmlFor={plan.id} className="cursor-pointer block">
                <Card
                  className={`relative transition-all h-full ${
                    isSelected
                      ? "border-primary shadow-md ring-2 ring-primary/20"
                      : "hover:border-primary/50 hover:shadow-sm"
                  }`}
                >
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
                      <Badge variant="outline" className="bg-background">Current Plan</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2 pt-6">
                    <div className="mx-auto rounded-full bg-primary/10 p-3 w-fit mb-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription className="mt-1">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.currency} {getMonthlyEquivalent(plan)}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {billingCycle === "yearly" && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {plan.currency} {getPrice(plan)} billed yearly
                        <span className="text-emerald-600 font-medium ml-1">
                          (Save {plan.currency} {getSavings(plan)})
                        </span>
                      </p>
                    )}
                    <div className="flex items-center justify-center gap-1 mt-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {plan.studentLimit === -1 ? "Unlimited" : `Up to ${plan.studentLimit}`} students
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <Separator />
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
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

      {/* Summary & Action */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {isCurrentPlan
                    ? "You're on this plan"
                    : isUpgrade
                    ? "Upgrade to " + selectedPlanDetails?.name
                    : "Switch to " + selectedPlanDetails?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedPlanDetails?.currency} {getMonthlyEquivalent(selectedPlanDetails!)}/month
                  {billingCycle === "yearly" && ` (${selectedPlanDetails?.currency} ${getPrice(selectedPlanDetails!)} billed yearly)`}
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
              <Button 
                disabled={isCurrentPlan} 
                onClick={() => setShowConfirmDialog(true)}
              >
                {isCurrentPlan ? "Current Plan" : isUpgrade ? "Upgrade Now" : "Change Plan"}
                {!isCurrentPlan && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Plan Change</DialogTitle>
            <DialogDescription>
              You are about to {isUpgrade ? "upgrade" : "switch"} to the {selectedPlanDetails?.name} plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">New Plan</span>
                <span className="font-medium">{selectedPlanDetails?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing Cycle</span>
                <span className="font-medium capitalize">{billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  {selectedPlanDetails?.currency} {getPrice(selectedPlanDetails!)}
                  {billingCycle === "yearly" ? "/year" : "/month"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Due Today</span>
                <span className="font-bold text-primary">
                  {selectedPlanDetails?.currency} {isUpgrade ? Math.round((getMonthlyEquivalent(selectedPlanDetails!) - currentPlan.price) * 0.5) : 0}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isUpgrade
                  ? "Prorated amount for the remainder of your current billing period."
                  : "Changes will take effect at the start of your next billing cycle."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Confirm Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FAQ Section */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium text-sm">What happens when I upgrade?</p>
            <p className="text-sm text-muted-foreground mt-1">
              When you upgrade, you&apos;ll immediately get access to all features of your new plan. You&apos;ll be charged a prorated amount for the remainder of your current billing period.
            </p>
          </div>
          <div>
            <p className="font-medium text-sm">Can I downgrade my plan?</p>
            <p className="text-sm text-muted-foreground mt-1">
              Yes, you can downgrade at any time. The change will take effect at the start of your next billing cycle. Make sure your student count is within the new plan&apos;s limit.
            </p>
          </div>
          <div>
            <p className="font-medium text-sm">What if I exceed my student limit?</p>
            <p className="text-sm text-muted-foreground mt-1">
              If you reach your student limit, you won&apos;t be able to add new students until you upgrade or remove existing students.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
