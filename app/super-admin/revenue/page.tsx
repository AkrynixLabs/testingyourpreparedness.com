"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatCard } from "@/components/stat-card"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  School,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  ComposedChart,
} from "recharts"

// Daily revenue data
const dailyRevenue = [
  { date: "Mar 1", revenue: 4520, transactions: 12 },
  { date: "Mar 2", revenue: 3890, transactions: 10 },
  { date: "Mar 3", revenue: 5120, transactions: 14 },
  { date: "Mar 4", revenue: 4780, transactions: 13 },
  { date: "Mar 5", revenue: 6200, transactions: 16 },
  { date: "Mar 6", revenue: 5890, transactions: 15 },
  { date: "Mar 7", revenue: 7100, transactions: 18 },
  { date: "Mar 8", revenue: 6540, transactions: 17 },
  { date: "Mar 9", revenue: 5980, transactions: 15 },
  { date: "Mar 10", revenue: 7250, transactions: 19 },
  { date: "Mar 11", revenue: 6890, transactions: 18 },
  { date: "Mar 12", revenue: 8100, transactions: 21 },
  { date: "Mar 13", revenue: 7450, transactions: 20 },
  { date: "Mar 14", revenue: 8520, transactions: 22 },
  { date: "Mar 15", revenue: 7890, transactions: 20 },
  { date: "Mar 16", revenue: 9100, transactions: 24 },
  { date: "Mar 17", revenue: 8650, transactions: 23 },
  { date: "Today", revenue: 9450, transactions: 25 },
]

const weeklyRevenue = [
  { week: "Week 1", revenue: 32500, newSubscriptions: 45, renewals: 28 },
  { week: "Week 2", revenue: 38200, newSubscriptions: 52, renewals: 35 },
  { week: "Week 3", revenue: 42100, newSubscriptions: 58, renewals: 42 },
  { week: "Week 4", revenue: 48500, newSubscriptions: 65, renewals: 48 },
]

const monthlyRevenue = [
  { month: "Sep 2025", revenue: 85000, growth: 12 },
  { month: "Oct 2025", revenue: 98000, growth: 15.3 },
  { month: "Nov 2025", revenue: 112000, growth: 14.3 },
  { month: "Dec 2025", revenue: 105000, growth: -6.3 },
  { month: "Jan 2026", revenue: 125000, growth: 19 },
  { month: "Feb 2026", revenue: 142000, growth: 13.6 },
  { month: "Mar 2026", revenue: 158000, growth: 11.3 },
]

const revenueByPlan = [
  { name: "Starter", value: 28500, count: 57, color: "oklch(0.65 0.15 220)" },
  { name: "Professional", value: 84000, count: 84, color: "oklch(0.55 0.15 170)" },
  { name: "Enterprise", value: 45500, count: 13, color: "oklch(0.55 0.15 280)" },
]

const revenueByRegion = [
  { region: "Greater Accra", revenue: 68000, schools: 42 },
  { region: "Ashanti", revenue: 45000, schools: 28 },
  { region: "Western", revenue: 22000, schools: 15 },
  { region: "Central", revenue: 18500, schools: 12 },
  { region: "Eastern", revenue: 15000, schools: 10 },
  { region: "Others", revenue: 11500, schools: 20 },
]

const recentTransactions = [
  { id: "TXN001", school: "Presec Legon", plan: "Professional", amount: 2500, date: "Mar 18, 2026", status: "completed", type: "renewal" },
  { id: "TXN002", school: "Wesley Girls", plan: "Enterprise", amount: 5000, date: "Mar 18, 2026", status: "completed", type: "new" },
  { id: "TXN003", school: "Achimota School", plan: "Professional", amount: 2500, date: "Mar 17, 2026", status: "completed", type: "renewal" },
  { id: "TXN004", school: "Holy Child", plan: "Starter", amount: 500, date: "Mar 17, 2026", status: "completed", type: "new" },
  { id: "TXN005", school: "Mfantsipim", plan: "Professional", amount: 2500, date: "Mar 16, 2026", status: "pending", type: "renewal" },
  { id: "TXN006", school: "Adisadel College", plan: "Enterprise", amount: 5000, date: "Mar 16, 2026", status: "completed", type: "upgrade" },
  { id: "TXN007", school: "Opoku Ware", plan: "Starter", amount: 500, date: "Mar 15, 2026", status: "failed", type: "new" },
  { id: "TXN008", school: "St. Augustine's", plan: "Professional", amount: 2500, date: "Mar 15, 2026", status: "completed", type: "new" },
]

const paymentMethods = [
  { method: "Mobile Money (MTN)", percentage: 52, amount: 82160 },
  { method: "Mobile Money (Vodafone)", percentage: 18, amount: 28440 },
  { method: "Bank Transfer", percentage: 15, amount: 23700 },
  { method: "Card Payment", percentage: 12, amount: 18960 },
  { method: "Other", percentage: 3, amount: 4740 },
]

export default function RevenuePage() {
  const [timeRange, setTimeRange] = useState("month")
  const [compareMode, setCompareMode] = useState(false)

  const totalRevenue = 158000
  const previousRevenue = 142000
  const revenueGrowth = ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
  const averageTransactionValue = 1875
  const totalTransactions = 84
  const recurringRevenue = 142500
  const newRevenue = 15500

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Revenue Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive financial insights and revenue tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`GHS ${(totalRevenue / 1000).toFixed(0)}K`}
          change={parseFloat(revenueGrowth)}
          changeLabel="from last month"
          icon={DollarSign}
        />
        <StatCard
          title="Recurring Revenue"
          value={`GHS ${(recurringRevenue / 1000).toFixed(0)}K`}
          change={8.2}
          changeLabel="MRR growth"
          icon={TrendingUp}
        />
        <StatCard
          title="New Revenue"
          value={`GHS ${(newRevenue / 1000).toFixed(1)}K`}
          change={24.5}
          changeLabel="from new schools"
          icon={ArrowUpRight}
        />
        <StatCard
          title="Avg Transaction"
          value={`GHS ${averageTransactionValue.toLocaleString()}`}
          change={5.3}
          changeLabel="per transaction"
          icon={CreditCard}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Trend */}
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Revenue Trend</CardTitle>
                <CardDescription>Daily revenue for the current month</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total this month</p>
                  <p className="text-2xl font-bold">GHS 158,000</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dailyRevenue}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.55 0.15 170)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.55 0.15 170)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => [
                        name === "revenue" ? `GHS ${value.toLocaleString()}` : value,
                        name === "revenue" ? "Revenue" : "Transactions"
                      ]}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="oklch(0.55 0.15 170)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="transactions"
                      stroke="oklch(0.65 0.15 50)"
                      strokeWidth={2}
                      dot={false}
                      name="Transactions"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Plan and Region */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Revenue by Plan</CardTitle>
                <CardDescription>Distribution across subscription tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueByPlan}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {revenueByPlan.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`GHS ${value.toLocaleString()}`, "Revenue"]}
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {revenueByPlan.map((plan) => (
                    <div key={plan.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: plan.color }} />
                        <span className="text-sm font-medium">{plan.name}</span>
                        <Badge variant="secondary" className="text-xs">{plan.count} schools</Badge>
                      </div>
                      <span className="font-semibold">GHS {plan.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Revenue by Region</CardTitle>
                <CardDescription>Geographic distribution of revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByRegion} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                      <YAxis dataKey="region" type="category" stroke="var(--muted-foreground)" fontSize={11} width={100} />
                      <Tooltip
                        formatter={(value: number) => [`GHS ${value.toLocaleString()}`, "Revenue"]}
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="revenue" fill="oklch(0.55 0.15 170)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Payment Methods</CardTitle>
              <CardDescription>Revenue breakdown by payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.method} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{method.method}</span>
                      <div className="text-right">
                        <span className="font-semibold">GHS {method.amount.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground ml-2">({method.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${method.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Tab */}
        <TabsContent value="daily" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold">GHS 9,450</p>
                  <div className="flex items-center text-emerald-600 text-sm">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>+12.5% vs yesterday</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Yesterday</p>
                  <p className="text-2xl font-bold">GHS 8,400</p>
                  <p className="text-sm text-muted-foreground">23 transactions</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">7-Day Average</p>
                  <p className="text-2xl font-bold">GHS 8,123</p>
                  <p className="text-sm text-muted-foreground">21 transactions/day</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Best Day (Month)</p>
                  <p className="text-2xl font-bold">GHS 12,450</p>
                  <p className="text-sm text-muted-foreground">Mar 12, 2026</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Daily Revenue - Last 18 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip
                      formatter={(value: number) => [`GHS ${value.toLocaleString()}`, "Revenue"]}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="revenue" fill="oklch(0.55 0.15 170)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Tab */}
        <TabsContent value="weekly" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">GHS 48,500</p>
                  <div className="flex items-center text-emerald-600 text-sm">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>+15.2% vs last week</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Last Week</p>
                  <p className="text-2xl font-bold">GHS 42,100</p>
                  <p className="text-sm text-muted-foreground">58 new subscriptions</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">New Subscriptions</p>
                  <p className="text-2xl font-bold">65</p>
                  <p className="text-sm text-muted-foreground">This week</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Renewals</p>
                  <p className="text-2xl font-bold">48</p>
                  <p className="text-sm text-muted-foreground">This week</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={weeklyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="oklch(0.55 0.15 170)" radius={[4, 4, 0, 0]} name="Revenue (GHS)" />
                    <Line yAxisId="right" type="monotone" dataKey="newSubscriptions" stroke="oklch(0.65 0.15 50)" strokeWidth={2} name="New Subscriptions" />
                    <Line yAxisId="right" type="monotone" dataKey="renewals" stroke="oklch(0.55 0.15 280)" strokeWidth={2} name="Renewals" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Tab */}
        <TabsContent value="monthly" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">GHS 158,000</p>
                  <div className="flex items-center text-emerald-600 text-sm">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>+11.3% vs last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Year-to-Date</p>
                  <p className="text-2xl font-bold">GHS 425,000</p>
                  <p className="text-sm text-muted-foreground">Jan - Mar 2026</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Annual Run Rate</p>
                  <p className="text-2xl font-bold">GHS 1.9M</p>
                  <p className="text-sm text-muted-foreground">Projected ARR</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Avg Monthly Growth</p>
                  <p className="text-2xl font-bold">14.2%</p>
                  <p className="text-sm text-muted-foreground">Last 6 months</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Monthly Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="oklch(0.55 0.15 170)" radius={[4, 4, 0, 0]} name="Revenue (GHS)" />
                    <Line yAxisId="right" type="monotone" dataKey="growth" stroke="oklch(0.65 0.15 50)" strokeWidth={2} name="Growth %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>All payment transactions across the platform</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                      <TableCell className="font-medium">{txn.school}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{txn.plan}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={
                          txn.type === "new" ? "bg-emerald-100 text-emerald-700" :
                          txn.type === "renewal" ? "bg-blue-100 text-blue-700" :
                          "bg-purple-100 text-purple-700"
                        }>
                          {txn.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">GHS {txn.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{txn.date}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={
                          txn.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                          txn.status === "pending" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }>
                          {txn.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Revenue Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium">New Subscriptions</p>
                        <p className="text-sm text-muted-foreground">15 schools this month</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">GHS 22,500</p>
                      <p className="text-sm text-emerald-600">14.2%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Renewals</p>
                        <p className="text-sm text-muted-foreground">68 schools renewed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">GHS 125,000</p>
                      <p className="text-sm text-muted-foreground">79.1%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Upgrades</p>
                        <p className="text-sm text-muted-foreground">8 plan upgrades</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">GHS 10,500</p>
                      <p className="text-sm text-muted-foreground">6.6%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-2">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Customer LTV</p>
                    <p className="text-2xl font-bold">GHS 18,500</p>
                    <p className="text-xs text-emerald-600">+8% YoY</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">CAC</p>
                    <p className="text-2xl font-bold">GHS 450</p>
                    <p className="text-xs text-emerald-600">-12% YoY</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">LTV:CAC Ratio</p>
                    <p className="text-2xl font-bold">41:1</p>
                    <p className="text-xs text-muted-foreground">Excellent</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Churn Rate</p>
                    <p className="text-2xl font-bold">2.1%</p>
                    <p className="text-xs text-emerald-600">-0.3% MoM</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Net Revenue Retention</p>
                    <p className="text-2xl font-bold">112%</p>
                    <p className="text-xs text-emerald-600">Healthy expansion</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Avg Revenue/School</p>
                    <p className="text-2xl font-bold">GHS 1,245</p>
                    <p className="text-xs text-muted-foreground">Monthly</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
