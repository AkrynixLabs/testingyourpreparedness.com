"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatCard } from "@/components/stat-card"
import { DollarSign, TrendingUp, ArrowUpRight, CreditCard, RefreshCw } from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import type { PaymentType, PaymentStatus } from "@/lib/generated/prisma/client"

const PLAN_COLORS = ["oklch(0.65 0.15 220)", "oklch(0.55 0.15 170)", "oklch(0.55 0.15 280)"]

const METHOD_LABEL: Record<string, string> = {
  card: "Card Payment",
  mobile_money: "Mobile Money",
  bank_transfer: "Bank Transfer",
}

export function RevenueView({
  stats,
  revenueByPlan,
  revenueByRegion,
  paymentMethods,
  recentTransactions,
}: {
  stats: {
    totalRevenue: number
    recurringRevenue: number
    newRevenue: number
    upgradeRevenue: number
    avgTransaction: number
    transactionCount: number
    schoolRevenue: number
    independentRevenue: number
  }
  revenueByPlan: { name: string; amount: number; count: number }[]
  revenueByRegion: { region: string; amount: number }[]
  paymentMethods: { method: string; amount: number; percentage: number }[]
  recentTransactions: {
    id: string
    payerName: string
    payerType: "school" | "independent" | null
    planName: string
    type: PaymentType
    amount: number
    createdAt: Date
    status: PaymentStatus
  }[]
}) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Revenue Analytics</h1>
          <p className="text-muted-foreground">Real revenue from completed payments - current totals, not a historical trend</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => router.refresh()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={`GHS ${stats.totalRevenue.toLocaleString()}`} changeLabel="All completed payments" icon={DollarSign} />
        <StatCard title="Recurring Revenue" value={`GHS ${stats.recurringRevenue.toLocaleString()}`} changeLabel="From renewals" icon={TrendingUp} />
        <StatCard title="New Revenue" value={`GHS ${stats.newRevenue.toLocaleString()}`} changeLabel="From new schools" icon={ArrowUpRight} />
        <StatCard title="Avg Transaction" value={`GHS ${stats.avgTransaction.toLocaleString()}`} changeLabel={`${stats.transactionCount} transactions`} icon={CreditCard} />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Revenue by Plan</CardTitle>
                <CardDescription>Distribution across subscription tiers</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueByPlan.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-12 text-center">No completed payments yet.</p>
                ) : (
                  <>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={revenueByPlan} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="amount">
                            {revenueByPlan.map((entry, index) => (
                              <Cell key={entry.name} fill={PLAN_COLORS[index % PLAN_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => [`GHS ${value.toLocaleString()}`, "Revenue"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      {revenueByPlan.map((plan, index) => (
                        <div key={plan.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PLAN_COLORS[index % PLAN_COLORS.length] }} />
                            <span className="text-sm font-medium">{plan.name}</span>
                            <Badge variant="secondary" className="text-xs">{plan.count} payments</Badge>
                          </div>
                          <span className="font-semibold">GHS {plan.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Revenue by Region</CardTitle>
                <CardDescription>School subscriptions only - independent students have no structured region field</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueByRegion.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-12 text-center">No completed payments yet.</p>
                ) : (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueByRegion} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                        <YAxis dataKey="region" type="category" stroke="var(--muted-foreground)" fontSize={11} width={100} />
                        <Tooltip formatter={(value: number) => [`GHS ${value.toLocaleString()}`, "Revenue"]} />
                        <Bar dataKey="amount" fill="oklch(0.55 0.15 170)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Payment Methods</CardTitle>
              <CardDescription>Revenue breakdown by payment method</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentMethods.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No completed payments yet.</p>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.method} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{METHOD_LABEL[method.method] ?? method.method}</span>
                        <div className="text-right">
                          <span className="font-semibold">GHS {method.amount.toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground ml-2">({method.percentage}%)</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${method.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Real completed payments across the platform</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {recentTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No completed payments yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Payer</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{txn.payerName}</span>
                            {txn.payerType && (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {txn.payerType}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{txn.planName}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              txn.type === "new"
                                ? "bg-emerald-100 text-emerald-700"
                                : txn.type === "renewal"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                            }
                          >
                            {txn.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">GHS {txn.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{txn.createdAt.toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Revenue by Audience</CardTitle>
              <CardDescription>School subscriptions vs. independent-student subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">School Subscriptions</p>
                  <p className="text-2xl font-bold">GHS {stats.schoolRevenue.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Independent Students</p>
                  <p className="text-2xl font-bold">GHS {stats.independentRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Revenue Sources</CardTitle>
              <CardDescription>Completed payments by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="font-medium">New Subscriptions</p>
                  </div>
                  <p className="font-bold">GHS {stats.newRevenue.toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="font-medium">Renewals</p>
                  </div>
                  <p className="font-bold">GHS {stats.recurringRevenue.toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="font-medium">Upgrades</p>
                  </div>
                  <p className="font-bold">GHS {stats.upgradeRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
