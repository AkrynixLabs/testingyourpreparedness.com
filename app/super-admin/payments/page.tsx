"use client"

import { useState } from "react"
import {
  Search,
  Download,
  Filter,
  MoreHorizontal,
  Eye,
  FileText,
  RefreshCw,
  Mail,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  Smartphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

const payments = [
  {
    id: "PAY-001",
    school: "Accra Academy",
    amount: 350,
    currency: "GHS",
    status: "completed",
    method: "mobile_money",
    provider: "MTN MoMo",
    date: "Dec 15, 2025",
    plan: "Professional",
    invoice: "INV-2025-0127",
  },
  {
    id: "PAY-002",
    school: "Wesley Girls' High School",
    amount: 750,
    currency: "GHS",
    status: "completed",
    method: "card",
    provider: "Visa ****4242",
    date: "Dec 14, 2025",
    plan: "Enterprise",
    invoice: "INV-2025-0126",
  },
  {
    id: "PAY-003",
    school: "Presec Legon",
    amount: 350,
    currency: "GHS",
    status: "pending",
    method: "mobile_money",
    provider: "Vodafone Cash",
    date: "Dec 14, 2025",
    plan: "Professional",
    invoice: "INV-2025-0125",
  },
  {
    id: "PAY-004",
    school: "St. Augustine's College",
    amount: 150,
    currency: "GHS",
    status: "failed",
    method: "mobile_money",
    provider: "MTN MoMo",
    date: "Dec 13, 2025",
    plan: "Starter",
    invoice: "INV-2025-0124",
  },
  {
    id: "PAY-005",
    school: "Holy Child School",
    amount: 3360,
    currency: "GHS",
    status: "completed",
    method: "bank_transfer",
    provider: "GCB Bank",
    date: "Dec 12, 2025",
    plan: "Professional (Yearly)",
    invoice: "INV-2025-0123",
  },
  {
    id: "PAY-006",
    school: "Mfantsipim School",
    amount: 150,
    currency: "GHS",
    status: "refunded",
    method: "card",
    provider: "Mastercard ****8888",
    date: "Dec 10, 2025",
    plan: "Starter",
    invoice: "INV-2025-0120",
  },
]

const invoices = [
  {
    id: "INV-2025-0127",
    school: "Accra Academy",
    amount: 350,
    status: "paid",
    dueDate: "Dec 15, 2025",
    paidDate: "Dec 15, 2025",
    period: "Dec 2025",
  },
  {
    id: "INV-2025-0126",
    school: "Wesley Girls' High School",
    amount: 750,
    status: "paid",
    dueDate: "Dec 14, 2025",
    paidDate: "Dec 14, 2025",
    period: "Dec 2025",
  },
  {
    id: "INV-2025-0128",
    school: "Opoku Ware School",
    amount: 350,
    status: "overdue",
    dueDate: "Dec 10, 2025",
    paidDate: null,
    period: "Dec 2025",
  },
  {
    id: "INV-2025-0129",
    school: "Adisadel College",
    amount: 750,
    status: "pending",
    dueDate: "Dec 20, 2025",
    paidDate: null,
    period: "Dec 2025",
  },
]

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [selectedPayment, setSelectedPayment] = useState<typeof payments[0] | null>(null)

  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0)
  const failedCount = payments.filter((p) => p.status === "failed").length
  const overdueInvoices = invoices.filter((i) => i.status === "overdue").length

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesMethod = methodFilter === "all" || payment.method === methodFilter
    return matchesSearch && matchesStatus && matchesMethod
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>
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

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "mobile_money":
        return <Smartphone className="h-4 w-4" />
      case "card":
        return <CreditCard className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments & Invoices</h1>
          <p className="text-muted-foreground">
            Monitor payments, manage invoices, and track revenue
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Generate Invoice
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue (MTD)"
          value={`GHS ${totalRevenue.toLocaleString()}`}
          changeLabel="This month"
          icon={DollarSign}
          change={18}
        />
        <StatCard
          title="Pending Payments"
          value={`GHS ${pendingAmount.toLocaleString()}`}
          changeLabel="Awaiting confirmation"
          icon={Clock}
          change={0}
        />
        <StatCard
          title="Failed Transactions"
          value={failedCount.toString()}
          changeLabel="Needs attention"
          icon={XCircle}
          change={-2}
        />
        <StatCard
          title="Overdue Invoices"
          value={overdueInvoices.toString()}
          changeLabel="Past due date"
          icon={AlertTriangle}
          change={-1}
        />
      </div>

      {/* Tabs */}
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                  <Select value={methodFilter} onValueChange={setMethodFilter}>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>School</TableHead>
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
                        <div>
                          <p className="font-medium">{payment.school}</p>
                          <p className="text-sm text-muted-foreground">{payment.plan}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        GHS {payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMethodIcon(payment.method)}
                          <span className="text-sm">{payment.provider}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-muted-foreground">{payment.date}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSelectedPayment(payment)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              View Invoice
                            </DropdownMenuItem>
                            {payment.status === "failed" && (
                              <DropdownMenuItem>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Retry Payment
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Receipt
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>View and manage all invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                      <TableCell className="font-medium">{invoice.school}</TableCell>
                      <TableCell className="font-semibold">
                        GHS {invoice.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{invoice.period}</TableCell>
                      <TableCell className="text-muted-foreground">{invoice.dueDate}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Reminder
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Detail Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              {selectedPayment?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">School</p>
                  <p className="font-medium">{selectedPayment.school}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-medium">{selectedPayment.plan}</p>
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
                    <span>{selectedPayment.provider}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{selectedPayment.date}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
                <Button>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
