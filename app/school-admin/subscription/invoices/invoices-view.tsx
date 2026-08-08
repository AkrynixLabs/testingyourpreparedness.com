"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, FileText, Search, Receipt, CheckCircle2, Clock, AlertTriangle, Calendar, ExternalLink } from "lucide-react"
import type { InvoiceStatus } from "@/lib/generated/prisma/client"

type InvoiceRow = {
  id: string
  date: string
  paidDate: string | null
  amount: number
  status: InvoiceStatus
  period: string
  plan: string
  paymentReference: string | null
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  if (status === "paid") {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Paid
      </Badge>
    )
  }
  if (status === "pending") {
    return (
      <Badge className="bg-amber-500/10 text-amber-600">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    )
  }
  return (
    <Badge className="bg-red-500/10 text-red-600">
      <AlertTriangle className="h-3 w-3 mr-1" />
      Overdue
    </Badge>
  )
}

export function InvoicesView({ invoices }: { invoices: InvoiceRow[] }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(null)

  const years = Array.from(new Set(invoices.map((inv) => new Date(inv.date).getFullYear()))).sort((a, b) => b - a)

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(search.toLowerCase()) || invoice.period.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    const matchesYear = yearFilter === "all" || new Date(invoice.date).getFullYear().toString() === yearFilter
    return matchesSearch && matchesStatus && matchesYear
  })

  const summaryStats = {
    totalPaid: invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0),
    currentYear: invoices
      .filter((i) => new Date(i.date).getFullYear() === new Date().getFullYear())
      .reduce((sum, i) => sum + i.amount, 0),
    invoiceCount: invoices.length,
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
          <h1 className="text-3xl font-bold tracking-tight">Invoice History</h1>
          <p className="text-muted-foreground mt-1">View all your billing statements</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid (All Time)</p>
                <p className="text-2xl font-bold">GHS {summaryStats.totalPaid.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-emerald-500/10 p-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{new Date().getFullYear()} Payments</p>
                <p className="text-2xl font-bold">GHS {summaryStats.currentYear.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{summaryStats.invoiceCount}</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Invoices
          </CardTitle>
          <CardDescription>
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-muted p-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{invoice.period}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{invoice.plan}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">GHS {invoice.amount}</TableCell>
                  <TableCell>
                    <StatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell>{invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No invoices found</p>
              <p className="text-muted-foreground">
                {invoices.length === 0 ? "Invoices appear here once your subscription is active." : "Try adjusting your search or filters"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>{selectedInvoice?.id}</DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Number</span>
                  <span className="font-medium">{selectedInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className="font-medium">{new Date(selectedInvoice.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing Period</span>
                  <span className="font-medium">{selectedInvoice.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{selectedInvoice.plan}</span>
                </div>
                {selectedInvoice.paymentReference && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Reference</span>
                    <span className="font-mono text-xs">{selectedInvoice.paymentReference}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
                {selectedInvoice.paidDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid Date</span>
                    <span className="font-medium">{new Date(selectedInvoice.paidDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <div className="rounded-lg bg-muted/50 p-4 flex justify-between items-center">
                <span className="font-semibold">Total Amount</span>
                <span className="text-2xl font-bold">GHS {selectedInvoice.amount}</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                PDF export isn&apos;t wired up yet - this is the full record on file.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
