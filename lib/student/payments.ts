import { prisma } from "@/lib/prisma"

// A student's real payment history spans two separate tables - their own
// Subscription -> Invoice -> Payment chain (subscription checkout/renewals)
// and CoursePurchase (a la carte marketplace buys, its own entity per
// CLAUDE.md's course-marketplace design, not a Payment/Invoice reuse) -
// merged here into one shape so both the mobile Payments tab and any future
// web equivalent can show a single, real chronological list instead of
// duplicating this join in two places. No web page shows this yet; this is
// the first surface for it.
export type PaymentHistoryEntry = {
  id: string
  kind: "subscription" | "course"
  description: string
  amount: number
  status: string
  date: Date
}

export async function getStudentPaymentHistory(studentId: string): Promise<PaymentHistoryEntry[]> {
  const [subscriptionPayments, coursePurchases] = await Promise.all([
    prisma.payment.findMany({
      where: { invoice: { subscription: { studentId } } },
      include: { invoice: { include: { subscription: { include: { plan: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.coursePurchase.findMany({
      where: { studentId },
      include: { course: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const entries: PaymentHistoryEntry[] = [
    ...subscriptionPayments.map((payment) => ({
      id: payment.id,
      kind: "subscription" as const,
      description: `${payment.invoice?.subscription.plan.name ?? "Subscription"} - ${payment.type}`,
      amount: payment.amount,
      status: payment.status,
      date: payment.createdAt,
    })),
    ...coursePurchases.map((purchase) => ({
      id: purchase.id,
      kind: "course" as const,
      description: purchase.course.title,
      amount: purchase.amount,
      status: purchase.status,
      date: purchase.createdAt,
    })),
  ]

  return entries.sort((a, b) => b.date.getTime() - a.date.getTime())
}
