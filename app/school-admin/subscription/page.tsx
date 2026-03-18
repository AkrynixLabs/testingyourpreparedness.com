"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
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
  Crown,
  Zap,
  Shield,
  HelpCircle,
  ExternalLink,
} from "lucide-react"

const currentPlan = {
  name: "Professional",
  price: 250,
  currency: "GHS",
  billingCycle: "monthly",
  studentLimit: 200,
  currentStudents: 156,
  renewalDate: "Apr 18, 2026",
  startDate: "Sep 1, 2025",
  status: "active",
  features: [
    "Up to 200 students",
    "Unlimited assessments",
    "Detailed analytics",
    "Priority support",
    "Custom branding",
  ],
}

const quickStats = [
  {
    label: "Monthly Cost",
    value: `GHS ${currentPlan.price}`,
    icon: CreditCard,
    color: "text-primary",
  },
  {
    label: "Student Seats",
    value: `${currentPlan.currentStudents}/${currentPlan.studentLimit}`,
    icon: Users,
    color: "text-blue-600",
  },
  {
    label: "Next Billing",
    value: currentPlan.renewalDate,
    icon: Calendar,
    color: "text-amber-600",
  },
  {
    label: "Status",
    value: "Active",
    icon: CheckCircle2,
    color: "text-emerald-600",
  },
]

const recentInvoices = [
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
]

const paymentMethod = {
  type: "card",
  last4: "4242",
  brand: "Visa",
  expiry: "12/27",
}

export default function SubscriptionPage() {
  const studentUsagePercent = (currentPlan.currentStudents / currentPlan.studentLimit) * 100

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-muted-foreground mt-1">
            Manage your plan, billing, and payment methods
          </p>
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

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`rounded-full bg-muted p-3 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Plan Details */}
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
              <div className="flex gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Started</p>
                  <p className="font-semibold">{currentPlan.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Renews</p>
                  <p className="font-semibold">{currentPlan.renewalDate}</p>
                </div>
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
                <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Running low on student seats
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      You&apos;re using {Math.round(studentUsagePercent)}% of your student seats. 
                      Consider upgrading to add more students.
                    </p>
                    <Button size="sm" variant="outline" className="mt-2" asChild>
                      <Link href="/school-admin/subscription/upgrade">
                        View Upgrade Options
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Separator />

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

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" asChild>
                <Link href="/school-admin/subscription/upgrade">
                  Change Plan
                </Link>
              </Button>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded bg-muted p-2">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{paymentMethod.brand} **** {paymentMethod.last4}</p>
                    <p className="text-sm text-muted-foreground">Expires {paymentMethod.expiry}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Default</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/school-admin/subscription/payment-method">
                  Update Payment Method
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Auto-Renewal Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-primary" />
                Auto-Renewal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-emerald-600">Enabled</p>
                  <p className="text-sm text-muted-foreground">
                    Your subscription will automatically renew on {currentPlan.renewalDate}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Invoices */}
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
          <div className="space-y-3">
            {recentInvoices.map((invoice) => (
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
                    <Badge className="bg-emerald-500/10 text-emerald-600">
                      Paid
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

      {/* Help Section */}
      <Card className="bg-muted/30">
        <CardContent className="py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Need help with your subscription?</h3>
                <p className="text-sm text-muted-foreground">
                  Contact our support team for billing questions or plan changes
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                FAQs
              </Button>
              <Button variant="outline">
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
