"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  Download,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Users,
  FileText,
  TrendingUp,
  ArrowRight,
  Receipt,
  Building2,
  Crown,
} from "lucide-react"

const currentPlan = {
  name: "Professional",
  price: 250,
  currency: "GHS",
  billingCycle: "monthly",
  studentLimit: 200,
  currentStudents: 156,
  renewalDate: "Apr 18, 2026",
  status: "active",
  features: [
    "Up to 200 students",
    "Unlimited assessments",
    "Detailed analytics",
    "Priority support",
    "Custom branding",
  ],
}

const invoices = [
  {
    id: "INV-2026-003",
    date: "Mar 1, 2026",
    amount: 250,
    status: "paid",
    period: "Mar 2026",
  },
  {
    id: "INV-2026-002",
    date: "Feb 1, 2026",
    amount: 250,
    status: "paid",
    period: "Feb 2026",
  },
  {
    id: "INV-2026-001",
    date: "Jan 1, 2026",
    amount: 250,
    status: "paid",
    period: "Jan 2026",
  },
  {
    id: "INV-2025-012",
    date: "Dec 1, 2025",
    amount: 250,
    status: "paid",
    period: "Dec 2025",
  },
  {
    id: "INV-2025-011",
    date: "Nov 1, 2025",
    amount: 250,
    status: "paid",
    period: "Nov 2025",
  },
]

const plans = [
  {
    name: "Starter",
    price: 100,
    currency: "GHS",
    studentLimit: 50,
    features: [
      "Up to 50 students",
      "Basic assessments",
      "Standard reports",
      "Email support",
    ],
    recommended: false,
    current: false,
  },
  {
    name: "Professional",
    price: 250,
    currency: "GHS",
    studentLimit: 200,
    features: [
      "Up to 200 students",
      "Unlimited assessments",
      "Detailed analytics",
      "Priority support",
      "Custom branding",
    ],
    recommended: true,
    current: true,
  },
  {
    name: "Enterprise",
    price: 500,
    currency: "GHS",
    studentLimit: 500,
    features: [
      "Up to 500 students",
      "Unlimited everything",
      "Advanced analytics",
      "Dedicated support",
      "API access",
      "White-label option",
    ],
    recommended: false,
    current: false,
  },
]

const paymentMethod = {
  type: "card",
  last4: "4242",
  brand: "Visa",
  expiry: "12/27",
}

const usageStats = {
  assessmentsThisMonth: 45,
  assessmentsLimit: "Unlimited",
  storageUsed: 2.4,
  storageLimit: 10,
  apiCalls: 12500,
  apiLimit: 50000,
}

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan.name)
  const studentUsagePercent = (currentPlan.currentStudents / currentPlan.studentLimit) * 100

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription, payment methods, and view invoices
        </p>
      </div>

      {/* Current Plan Overview */}
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
                  <CardDescription>Your active subscription details</CardDescription>
                </div>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                <p className="text-muted-foreground">
                  {currentPlan.currency} {currentPlan.price}/{currentPlan.billingCycle}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Next renewal</p>
                <p className="font-semibold">{currentPlan.renewalDate}</p>
              </div>
            </div>

            <Separator />

            {/* Student Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Student Seats</span>
                </div>
                <span className="text-sm">
                  {currentPlan.currentStudents} / {currentPlan.studentLimit} used
                </span>
              </div>
              <Progress value={studentUsagePercent} className="h-2" />
              {studentUsagePercent > 80 && (
                <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  You&apos;re using {Math.round(studentUsagePercent)}% of your student seats. Consider upgrading.
                </p>
              )}
            </div>

            {/* Features */}
            <div>
              <h4 className="text-sm font-medium mb-3">Plan Features</h4>
              <div className="grid gap-2 md:grid-cols-2">
                {currentPlan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded bg-muted p-2">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{paymentMethod.brand} ending in {paymentMethod.last4}</p>
                    <p className="text-sm text-muted-foreground">Expires {paymentMethod.expiry}</p>
                  </div>
                </div>
                <Badge variant="outline">Default</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Update Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Plans and Invoices */}
      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">Available Plans</TabsTrigger>
          <TabsTrigger value="invoices">Invoice History</TabsTrigger>
          <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
        </TabsList>

        {/* Available Plans */}
        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative transition-all ${
                  plan.current
                    ? "border-primary shadow-md"
                    : "hover:border-primary/50 hover:shadow-sm"
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Recommended</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.currency} {plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription className="mt-2">
                    Up to {plan.studentLimit} students
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.current ? "outline" : "default"}
                    disabled={plan.current}
                  >
                    {plan.current ? "Current Plan" : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Invoice History */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-primary" />
                    Invoice History
                  </CardTitle>
                  <CardDescription>Download and view past invoices</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-muted p-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.period} - {invoice.date}
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
                              : "bg-amber-500/10 text-amber-600"
                          }
                        >
                          {invoice.status === "paid" ? "Paid" : "Pending"}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage & Limits */}
        <TabsContent value="usage">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Resource Usage
                </CardTitle>
                <CardDescription>Current usage this billing cycle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Assessments Created</span>
                    <span className="text-sm text-muted-foreground">
                      {usageStats.assessmentsThisMonth} / {usageStats.assessmentsLimit}
                    </span>
                  </div>
                  <Progress value={100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Unlimited on your plan</p>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Storage Used</span>
                    <span className="text-sm text-muted-foreground">
                      {usageStats.storageUsed} GB / {usageStats.storageLimit} GB
                    </span>
                  </div>
                  <Progress
                    value={(usageStats.storageUsed / usageStats.storageLimit) * 100}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">API Requests</span>
                    <span className="text-sm text-muted-foreground">
                      {usageStats.apiCalls.toLocaleString()} / {usageStats.apiLimit.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={(usageStats.apiCalls / usageStats.apiLimit) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Billing Information
                </CardTitle>
                <CardDescription>Your organization billing details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Organization</p>
                    <p className="font-medium">Accra Academy</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Billing Email</p>
                    <p className="font-medium">billing@accra-academy.edu.gh</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Billing Address</p>
                    <p className="font-medium">P.O. Box 123, Accra, Ghana</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tax ID</p>
                    <p className="font-medium">GH-1234567890</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Update Billing Info
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <Card className="bg-muted/30">
        <CardContent className="py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold">Need help with billing?</h3>
              <p className="text-sm text-muted-foreground">
                Contact our support team for any billing-related questions
              </p>
            </div>
            <Button variant="outline">
              Contact Support
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
