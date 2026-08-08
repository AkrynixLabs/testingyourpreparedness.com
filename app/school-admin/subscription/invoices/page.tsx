import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { InvoicesView } from "./invoices-view"

export default async function InvoicesPage() {
  const session = await auth()
  const schoolAdmin = await prisma.schoolAdmin.findUnique({
    where: { userId: session!.user.id },
    select: { schoolId: true },
  })
  if (!schoolAdmin) notFound()

  const subscription = await prisma.subscription.findUnique({
    where: { schoolId: schoolAdmin.schoolId },
    include: {
      plan: true,
      invoices: { orderBy: { dueDate: "desc" }, include: { payments: true } },
    },
  })

  const invoices =
    subscription?.invoices.map((inv) => ({
      id: inv.id,
      date: inv.dueDate.toISOString(),
      paidDate: inv.paidDate?.toISOString() ?? null,
      amount: inv.amount,
      status: inv.status,
      period: inv.period,
      plan: subscription.plan.name,
      paymentReference: inv.payments[0]?.paystackReference ?? null,
    })) ?? []

  return <InvoicesView invoices={invoices} />
}
