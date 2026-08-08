import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { SubscriptionView } from "./subscription-view"

export default async function SubscriptionPage() {
  const session = await auth()
  const schoolAdmin = await prisma.schoolAdmin.findUnique({
    where: { userId: session!.user.id },
    select: { schoolId: true },
  })
  if (!schoolAdmin) notFound()

  const [school, subscription, currentStudents, paymentMethod] = await Promise.all([
    prisma.school.findUnique({ where: { id: schoolAdmin.schoolId } }),
    prisma.subscription.findUnique({
      where: { schoolId: schoolAdmin.schoolId },
      include: { plan: true, invoices: { orderBy: { dueDate: "desc" }, take: 3 } },
    }),
    prisma.student.count({ where: { schoolId: schoolAdmin.schoolId } }),
    prisma.paymentMethod.findFirst({ where: { schoolId: schoolAdmin.schoolId, isDefault: true } }),
  ])

  if (!school) notFound()

  return (
    <SubscriptionView
      school={{ name: school.name, address: school.address, town: school.town, region: school.region }}
      subscription={
        subscription
          ? {
              planName: subscription.plan.name,
              price: subscription.billingCycle === "yearly" ? subscription.plan.yearlyPrice : subscription.plan.monthlyPrice,
              currency: subscription.plan.currency,
              billingCycle: subscription.billingCycle,
              studentLimit: subscription.plan.studentLimit,
              startDate: subscription.startDate.toISOString(),
              renewalDate: subscription.renewalDate.toISOString(),
              status: subscription.status,
              features: subscription.plan.features as string[],
            }
          : null
      }
      currentStudents={currentStudents}
      recentInvoices={subscription?.invoices.map((inv) => ({
        id: inv.id,
        date: inv.dueDate.toISOString(),
        amount: inv.amount,
        status: inv.status,
        period: inv.period,
      })) ?? []}
      paymentMethod={
        paymentMethod
          ? {
              type: paymentMethod.type,
              brand: paymentMethod.cardBrand,
              last4: paymentMethod.cardLast4,
              expiry: paymentMethod.cardExpiry,
            }
          : null
      }
    />
  )
}
