import { prisma } from "@/lib/prisma"
import { PlansView } from "./plans-view"

export default async function SubscriptionPlansPage() {
  const [plans, recentSubscriptions] = await Promise.all([
    prisma.subscriptionPlan.findMany({
      where: { audience: "school" },
      include: { _count: { select: { subscriptions: true } } },
      orderBy: { monthlyPrice: "asc" },
    }),
    prisma.subscription.findMany({
      where: { schoolId: { not: null } },
      include: { plan: true, school: true },
      orderBy: { startDate: "desc" },
      take: 10,
    }),
  ])

  // MRR approximation: monthly subscriptions counted at face value; yearly/term
  // subscriptions divided into an even monthly share (12 / 3 terms per year).
  // Flagged as an approximation, not exact revenue - real revenue accounting
  // belongs to super-admin/revenue once Payment/Invoice data is wired there.
  const totalMRR = recentSubscriptions.reduce((sum, sub) => {
    if (sub.billingCycle === "monthly") return sum + (sub.plan.monthlyPrice ?? 0)
    if (sub.billingCycle === "yearly") return sum + (sub.plan.yearlyPrice ?? 0) / 12
    if (sub.billingCycle === "term") return sum + (sub.plan.termPrice ?? 0) / 4
    return sum
  }, 0)

  const totalSubscribers = plans.reduce((sum, p) => sum + p._count.subscriptions, 0)
  const avgRevenuePerSchool = totalSubscribers > 0 ? Math.round(totalMRR / totalSubscribers) : 0

  return (
    <PlansView
      plans={plans}
      recentSubscriptions={recentSubscriptions}
      stats={{
        totalMRR: Math.round(totalMRR),
        totalSubscribers,
        avgRevenuePerSchool,
        activePlans: plans.length,
      }}
    />
  )
}
