"use client"

import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Check, GraduationCap, School } from "lucide-react"
import { planPriceAndPeriod } from "@/lib/pricing"
import type { SubscriptionPlan } from "@/lib/generated/prisma/client"

export function PricingToggle({
  schoolPlans,
  studentPlans,
}: {
  schoolPlans: SubscriptionPlan[]
  studentPlans: SubscriptionPlan[]
}) {
  const [schoolBillingCycle, setSchoolBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [studentBillingCycle, setStudentBillingCycle] = useState<"monthly" | "yearly">("monthly")

  const visibleStudentPlans = studentPlans.filter((plan) => {
    const { period } = planPriceAndPeriod(plan)
    if (period === null) return true // Free plan, always shown
    if (studentBillingCycle === "monthly") return period === "month" || period === "term"
    return period === "year"
  })

  return (
    <Tabs defaultValue="school" className="items-center">
      <TabsList className="mb-8 h-11 p-1">
        <TabsTrigger value="school" className="gap-1.5 px-4 text-sm">
          <School className="h-4 w-4" />
          Schools
        </TabsTrigger>
        <TabsTrigger value="student" className="gap-1.5 px-4 text-sm">
          <GraduationCap className="h-4 w-4" />
          Learners
        </TabsTrigger>
      </TabsList>

      <TabsContent value="school" className="w-full">
        <div className="mb-6 flex items-center justify-center gap-3">
          <Label htmlFor="school-billing-toggle" className={schoolBillingCycle === "monthly" ? "font-medium" : "text-muted-foreground"}>
            Monthly
          </Label>
          <Switch
            id="school-billing-toggle"
            checked={schoolBillingCycle === "yearly"}
            onCheckedChange={(checked) => setSchoolBillingCycle(checked ? "yearly" : "monthly")}
          />
          <Label htmlFor="school-billing-toggle" className={schoolBillingCycle === "yearly" ? "font-medium" : "text-muted-foreground"}>
            Yearly
          </Label>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">Save 20%</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {schoolPlans.map((plan) => {
            const planFeatures = plan.features as string[]
            const monthlyEquivalent =
              schoolBillingCycle === "yearly" && plan.yearlyPrice ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice ?? 0
            const yearlyPrice = plan.yearlyPrice ?? 0
            const savings = (plan.monthlyPrice ?? 0) * 12 - yearlyPrice
            return (
              <Card key={plan.id} className={`relative h-full border-border shadow-sm ${plan.popular ? "border-primary ring-1 ring-primary" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-[11px] font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <CardHeader className="p-5 pb-0">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {plan.studentLimit ? `Up to ${plan.studentLimit} learners` : "Unlimited learners"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="mb-4">
                    <span className="text-2xl font-semibold">
                      {plan.currency} {monthlyEquivalent}
                    </span>
                    <span className="text-sm text-muted-foreground">/month</span>
                    {schoolBillingCycle === "yearly" && plan.yearlyPrice && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {plan.currency} {yearlyPrice} billed yearly
                        {savings > 0 && <span className="text-primary font-medium"> (save {plan.currency} {savings})</span>}
                      </p>
                    )}
                  </div>
                  <ul className="space-y-2 mb-4">
                    {planFeatures.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                    <Link href="/signup/school">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </TabsContent>

      <TabsContent value="student" className="w-full">
        <div className="mb-6 flex items-center justify-center gap-3">
          <Label htmlFor="student-billing-toggle" className={studentBillingCycle === "monthly" ? "font-medium" : "text-muted-foreground"}>
            Monthly
          </Label>
          <Switch
            id="student-billing-toggle"
            checked={studentBillingCycle === "yearly"}
            onCheckedChange={(checked) => setStudentBillingCycle(checked ? "yearly" : "monthly")}
          />
          <Label htmlFor="student-billing-toggle" className={studentBillingCycle === "yearly" ? "font-medium" : "text-muted-foreground"}>
            Yearly
          </Label>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">Save 33%</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {visibleStudentPlans.map((plan) => {
            const { price, period } = planPriceAndPeriod(plan)
            const planFeatures = plan.features as string[]
            return (
              <Card key={plan.id} className={`relative h-full border-border shadow-sm ${plan.popular ? "border-primary ring-1 ring-primary" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-[11px] font-medium rounded-full">
                    Best Value
                  </div>
                )}
                <CardHeader className="p-5 pb-0">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  {period && (
                    <CardDescription className="text-xs">
                      Billed {period === "month" ? "monthly" : period === "term" ? "per term" : "annually"}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-5">
                  <div className="mb-4">
                    {price === 0 ? (
                      <span className="text-2xl font-semibold">Free</span>
                    ) : (
                      <>
                        <span className="text-2xl font-semibold">
                          {plan.currency} {price}
                        </span>
                        <span className="text-sm text-muted-foreground">/{period}</span>
                      </>
                    )}
                  </div>
                  <ul className="space-y-2 mb-4">
                    {planFeatures.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" className="w-full" variant={price === 0 ? "outline" : "default"} asChild>
                    <Link href="/signup/student">{price === 0 ? "Sign Up Free" : "Subscribe"}</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </TabsContent>
    </Tabs>
  )
}
