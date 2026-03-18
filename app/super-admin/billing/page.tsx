"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { StatCard } from "@/components/stat-card"
import { DataTable } from "@/components/data-table"
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Search,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const revenueData = [
  { month: "Sep", revenue: 12500 },
  { month: "Oct", revenue: 15200 },
  { month: "Nov", revenue: 18900 },
  { month: "Dec", revenue: 22100 },
  { month: "Jan", revenue: 25800 },
  { month: "Feb", revenue: 28500 },
  { month: "Mar", revenue: 32000 },
]

const subscriptions = [
  {
    id: 1,
    school: "Accra Academy",
    plan: "Professional",
    amount: 250,
    students: 156,
    status: "active",
    nextBilling: "Apr 18, 2026",
    since: "Jan 2024",
  },
  {
    id: 2,
    school: "Mfantsipim School",
    plan: "Enterprise",
    amount: 500,
    students: 412,
    status: "active",
    nextBilling: "Apr 5, 2026",
    since: "Mar 2024",
  },
  {
    id: 3,
    school: "Wesley Girls High",
    plan: "Professional",
    amount: 250,
    students: 189,
    status: "active",
    nextBilling: "Apr 12, 2026",
    since: "Jun 2024",
  },
  {
    id: 4,
    school: "Prempeh College",
    plan: "Enterprise",
    amount: 500,
    students: 385,
    status: "past_due",
    nextBilling: "Mar 15, 2026",
    since: "Feb 2024",
  },
  {
    id: 5,
    school: "Achimota School",
    plan: "Starter",
    amount: 100,
    students: 45,
    status: "active",
    nextBilling: "Apr 20, 2026",
    since: "Sep 2025",
  },
  {
    id: 6,
    school: "St. Augustine's College",
    plan: "Professional",
    amount: 250,
    students: 178,
    status: "cancelled",
    nextBilling: "-",
    since: "Nov 2024",
  },
]

const subscriptionColumns = [
  {
    key: "school",
    label: "School",
    render: (value: string) => (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{value}</span>
      </div>
    ),
  },
  {
    key: "plan",
    label: "Plan",
    render: (value: string) => (
      <Badge variant="secondary">{value}</Badge>
    ),
  },
  {
    key: "amount",
    label: "Amount",
    render: (value: number) => (
      <span className="font-medium">GHS {value}/mo</span>
    ),
  },
  {
    key: "students",
    label: "Students",
  },
  {
    key: "status",
    label: "Status",
    render: (value: string) => {
      const statusStyles: Record<string, string> = {
        active: "bg-emerald-500/10 text-emerald-600",
        past_due: "bg-red-500/10 text-red-600",
        cancelled: "bg-muted text-muted-foreground",
      }
      const statusLabels: Record<string, string> = {
        active: "Active",
        past_due: "Past Due",
        cancelled: "Cancelled",
      }
      return (
        <Badge className={statusStyles[value]}>
          {statusLabels[value]}
        </Badge>
      )
    },
  },
  {
    key: "nextBilling",
    label: "Next Billing",
  },
]

export default function SuperAdminBillingPage() {
  const activeSubscriptions = subscriptions.filter(s => s.status === "active").length
  const mrr = subscriptions
    .filter(s => s.status === "active")
    .reduce((acc, s) => acc + s.amount, 0)
  const pastDue = subscriptions.filter(s => s.status === "past_due").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor revenue, subscriptions, and billing across all schools
          </p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Revenue"
          value={`GHS ${mrr.toLocaleString()}`}
          changeLabel="From active subscriptions"
          icon={DollarSign}
          change={15}
        />
        <StatCard
          title="Active Subscriptions"
          value={activeSubscriptions.toString()}
          changeLabel="Paying schools"
          icon={CheckCircle2}
          change={3}
        />
        <StatCard
          title="Past Due"
          value={pastDue.toString()}
          changeLabel="Requiring attention"
          icon={AlertTriangle}
          change={-1}
        />
        <StatCard
          title="Avg Revenue/School"
          value={`GHS ${Math.round(mrr / activeSubscriptions)}`}
          changeLabel="Per active school"
          icon={TrendingUp}
          change={8}
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Revenue Trend
          </CardTitle>
          <CardDescription>Monthly recurring revenue over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis
                  className="text-xs"
                  tickFormatter={(value) => `GHS ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`GHS ${value.toLocaleString()}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                School Subscriptions
              </CardTitle>
              <CardDescription>Manage all school billing and subscriptions</CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search schools..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={subscriptionColumns}
            data={subscriptions}
            searchKey="school"
            actions={(row) => (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">View</Button>
                {row.status === "past_due" && (
                  <Button variant="outline" size="sm">Send Reminder</Button>
                )}
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Plan Distribution */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Starter Plan</CardTitle>
            <CardDescription>GHS 100/month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {subscriptions.filter(s => s.plan === "Starter" && s.status === "active").length}
            </div>
            <p className="text-sm text-muted-foreground">active schools</p>
            <div className="mt-4 text-sm">
              <span className="font-medium">
                GHS {subscriptions.filter(s => s.plan === "Starter" && s.status === "active").length * 100}
              </span>
              <span className="text-muted-foreground"> /month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Professional Plan</CardTitle>
            <CardDescription>GHS 250/month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {subscriptions.filter(s => s.plan === "Professional" && s.status === "active").length}
            </div>
            <p className="text-sm text-muted-foreground">active schools</p>
            <div className="mt-4 text-sm">
              <span className="font-medium">
                GHS {subscriptions.filter(s => s.plan === "Professional" && s.status === "active").length * 250}
              </span>
              <span className="text-muted-foreground"> /month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Enterprise Plan</CardTitle>
            <CardDescription>GHS 500/month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {subscriptions.filter(s => s.plan === "Enterprise" && s.status === "active").length}
            </div>
            <p className="text-sm text-muted-foreground">active schools</p>
            <div className="mt-4 text-sm">
              <span className="font-medium">
                GHS {subscriptions.filter(s => s.plan === "Enterprise" && s.status === "active").length * 500}
              </span>
              <span className="text-muted-foreground"> /month</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
