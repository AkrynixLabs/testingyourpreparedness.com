"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Eye,
  DollarSign,
  AlertTriangle,
  Clock,
  XCircle,
  CreditCard,
  Smartphone,
  Landmark,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StatCard } from "@/components/stat-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  Payment,
  Invoice,
  Subscription,
  School,
  Student,
  User,
  SubscriptionPlan,
  PaymentStatus,
  PaymentMethodType,
} from "@/lib/generated/prisma/client"

type SubscriptionOwner = Subscription & { school: School | null; student: (Student & { user: User }) | null }
type PaymentRow = Payment & {
  invoice: (Invoice & { subscription: SubscriptionOwner & { plan: SubscriptionPlan } }) | null
}
type InvoiceRow = Invoice & { subscription: SubscriptionOwner }

function payerName(sub: SubscriptionOwner | undefined | null): string {
  return sub?.school?.name ?? sub?.student?.user.name ?? "-"
}
function payerType(sub: SubscriptionOwner | undefined | null): "school" | "independent" | null {
  return sub?.school ? "school" : sub?.student ? "independent" : null
}

const METHOD_LABEL: Record<string, string> = {
  card: "Card",
  mobile_money: "Mobile Money",
  bank_transfer: "Bank Transfer",
}

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
    case "paid":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{status === "paid" ? "Paid" : "Completed"}</Badge>
    case "pending":
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>
    case "failed":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Failed</Badge>
    case "refunded":
      return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Refunded</Badge>
    case "overdue":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Overdue</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getMethodIcon(method: string) {
  switch (method) {
    case "mobile_money":
      return <Smartphone className="h-4 w-4" />
    case "card":
      return <CreditCard className="h-4 w-4" />
    case "bank_transfer":
      return <Landmark className="h-4 w-4" />
    default:
      return <DollarSign className="h-4 w-4" />
  }
}

export function PaymentsView({
  payments,
  invoices,
  stats,
}: {
  payments: PaymentRow[]
  invoices: InvoiceRow[]
  stats: { totalRevenue: number; pendingAmount: number; failedCount: number; overdueInvoices: number }
}) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all")
  const [methodFilter, setMethodFilter] = useState<PaymentMethodType | "all">("all")
  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null)

  const filteredPayments = payments.filter((payment) => {
    const name = payerName(payment.invoice?.subscription)
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) || payment.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesMethod = methodFilter === "all" || payment.method === methodFilter
    return matchesSearch && matchesStatus && matchesMethod
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments & Invoices</h1>
          <p className="text-muted-foreground">
            Real payment and invoice records from school and independent-student checkout - no live charges have completed yet since no
            real Paystack keys are configured in this environment
          </p>
        </div>
        <Button variant="outline" onClick={() => router.refresh()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={`GHS ${stats.totalRevenue.toLocaleString()}`} changeLabel="All completed payments" icon={DollarSign} />
        <StatCard title="Pending Payments" value={`GHS ${stats.pendingAmount.toLocaleString()}`} changeLabel="Awaiting confirmation" icon={Clock} />
        <StatCard title="Failed Transactions" value={stats.failedCount.toString()} changeLabel="Needs attention" icon={XCircle} />
        <StatCard title="Overdue Invoices" value={stats.overdueInvoices.toString()} changeLabel="Past due date" icon={AlertTriangle} />
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PaymentStatus | "all")}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={methodFilter} onValueChange={(v) => setMethodFilter(v as PaymentMethodType | "all")}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredPayments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No payments match these filters.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Payer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium">{payerName(payment.invoice?.subscription)}</p>
                              <p className="text-sm text-muted-foreground">{payment.invoice?.subscription.plan.name ?? "-"}</p>
                            </div>
                            {payerType(payment.invoice?.subscription) && (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {payerType(payment.invoice?.subscription)}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">GHS {payment.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMethodIcon(payment.method)}
                            <span className="text-sm">{METHOD_LABEL[payment.method] ?? payment.method}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-muted-foreground">{payment.createdAt.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedPayment(payment)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>View all invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No invoices yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Payer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                        <TableCell className="font-medium">{payerName(invoice.subscription)}</TableCell>
                        <TableCell className="font-semibold">GHS {invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>{invoice.period}</TableCell>
                        <TableCell className="text-muted-foreground">{invoice.dueDate.toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>{selectedPayment?.id}</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payer</p>
                  <p className="font-medium">{payerName(selectedPayment.invoice?.subscription)}</p>
                  {payerType(selectedPayment.invoice?.subscription) && (
                    <p className="text-xs text-muted-foreground capitalize">{payerType(selectedPayment.invoice?.subscription)}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-medium">{selectedPayment.invoice?.subscription.plan.name ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold text-lg">GHS {selectedPayment.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedPayment.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <div className="flex items-center gap-2">
                    {getMethodIcon(selectedPayment.method)}
                    <span>{METHOD_LABEL[selectedPayment.method] ?? selectedPayment.method}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{selectedPayment.createdAt.toLocaleDateString()}</p>
                </div>
                {selectedPayment.paystackReference && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Paystack Reference</p>
                    <p className="font-mono text-sm">{selectedPayment.paystackReference}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
