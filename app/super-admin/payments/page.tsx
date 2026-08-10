import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PaymentsView } from "./payments-view"

export default async function PaymentsPage() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") notFound()

  // student.user is scoped with `select`, not `include: true` - never fetch
  // passwordHash in the first place for a value that only ever needs to
  // render a name/email. Found by a security audit 2026-08-08 (see
  // docs/build-log.md) - the previous `include: { user: true }` shape here
  // pulled every referenced student's real bcrypt hash into this page's RSC
  // payload.
  const [payments, invoices] = await Promise.all([
    prisma.payment.findMany({
      include: {
        invoice: {
          include: {
            subscription: {
              include: {
                school: true,
                student: { include: { user: { select: { id: true, name: true, email: true } } } },
                plan: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.invoice.findMany({
      include: {
        subscription: {
          include: { school: true, student: { include: { user: { select: { id: true, name: true, email: true } } } } },
        },
      },
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
