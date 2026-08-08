import { prisma } from "@/lib/prisma"
import { PaymentsView } from "./payments-view"

export default async function PaymentsPage() {
  const [payments, invoices] = await Promise.all([
    prisma.payment.findMany({
      include: {
        invoice: { include: { subscription: { include: { school: true, student: { include: { user: true } }, plan: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.invoice.findMany({
      include: { subscription: { include: { school: true, student: { include: { user: true } } } } },
      orderBy: { dueDate: "desc" },
    }),
  ])

  const totalRevenue = payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0)
  const failedCount = payments.filter((p) => p.status === "failed").length
  const overdueInvoices = invoices.filter((i) => i.status === "overdue").length

  return (
    <PaymentsView
      payments={payments}
      invoices={invoices}
      stats={{ totalRevenue, pendingAmount, failedCount, overdueInvoices }}
    />
  )
}
