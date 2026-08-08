"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/stat-card"
import { DataTable } from "@/components/data-table"
import { CreditCard, DollarSign, TrendingUp, AlertTriangle, CheckCircle2, Building2, Eye } from "lucide-react"
import type { BillingCycle, SubscriptionStatus } from "@/lib/generated/prisma/client"

type SubscriptionRow = {
  id: string
  schoolId: string
  schoolName: string
  planName: string
  billingCycle: BillingCycle
  students: number
  status: SubscriptionStatus
  renewalDate: Date
  startDate: Date
  monthlyEquivalent: number
}

const statusStyles: Record<SubscriptionStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-600",
  past_due: "bg-red-500/10 text-red-600",
  cancelled: "bg-muted text-muted-foreground",
}
const statusLabels: Record<SubscriptionStatus, string> = {
  active: "Active",
  past_due: "Past Due",
  cancelled: "Cancelled",
}

const columns = [
  {
    key: "schoolName",
    header: "School",
    render: (item: SubscriptionRow) => (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{item.schoolName}</span>
      </div>
    ),
  },
  {
    key: "planName",
    header: "Plan",
    render: (item: SubscriptionRow) => <Badge variant="secondary">{item.planName}</Badge>,
  },
  {
    key: "monthlyEquivalent",
    header: "Amount",
    render: (item: SubscriptionRow) => (
      <span className="font-medium">
        GHS {item.monthlyEquivalent}/mo
        {item.billingCycle !== "monthly" && <span className="text-muted-foreground"> ({item.billingCycle})</span>}
      </span>
    ),
  },
  { key: "students", header: "Students" },
  {
    key: "status",
    header: "Status",
    render: (item: SubscriptionRow) => <Badge className={statusStyles[item.status]}>{statusLabels[item.status]}</Badge>,
  },
  {
    key: "renewalDate",
    header: "Next Billing",
    render: (item: SubscriptionRow) => (item.status === "cancelled" ? "-" : item.renewalDate.toLocaleDateString()),
  },
]

export function BillingView({
  subscriptions,
  stats,
  planDistribution,
}: {
  subscriptions: SubscriptionRow[]
  stats: { mrr: number; activeSubscriptions: number; pastDueCount: number; avgRevenuePerSchool: number }
  planDistribution: { name: string; monthlyPrice: number | null; activeCount: number; mrr: number }[]
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing Management</h1>
        <p className="text-muted-foreground mt-1">Monitor real revenue, subscriptions, and billing across all schools</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Monthly Revenue (approx)" value={`GHS ${stats.mrr.toLocaleString()}`} changeLabel="From active subscriptions" icon={DollarSign} />
        <StatCard title="Active Subscriptions" value={stats.activeSubscriptions.toString()} changeLabel="Paying schools" icon={CheckCircle2} />
        <StatCard title="Past Due" value={stats.pastDueCount.toString()} changeLabel="Requiring attention" icon={AlertTriangle} />
        <StatCard title="Avg Revenue/School" value={`GHS ${stats.avgRevenuePerSchool}`} changeLabel="Per active school" icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              School Subscriptions
            </CardTitle>
            <CardDescription>Real subscriptions created by school checkout via Paystack</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No school subscriptions yet - none have completed checkout.
            </p>
          ) : (
            <DataTable
              data={subscriptions}
              columns={columns}
              searchKey="schoolName"
              searchPlaceholder="Search schools..."
              actions={(row) => (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/super-admin/schools/${row.schoolId}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </Button>
              )}
            />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {planDistribution.map((plan) => (
          <Card key={plan.name}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{plan.name} Plan</CardTitle>
              <CardDescription>{plan.monthlyPrice !== null ? `GHS ${plan.monthlyPrice}/month` : "No monthly price"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{plan.activeCount}</div>
              <p className="text-sm text-muted-foreground">active schools</p>
              <div className="mt-4 text-sm">
                <span className="font-medium">GHS {plan.mrr.toLocaleString()}</span>
                <span className="text-muted-foreground"> /month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
