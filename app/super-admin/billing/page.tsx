import { prisma } from "@/lib/prisma"
import { BillingView } from "./billing-view"

export default async function SuperAdminBillingPage() {
  const subscriptions = await prisma.subscription.findMany({
    where: { schoolId: { not: null } },
    include: { school: { include: { _count: { select: { students: true } } } }, plan: true },
    orderBy: { startDate: "desc" },
  })

  const rows = subscriptions
    .filter((s) => s.school !== null)
    .map((s) => ({
      id: s.id,
      schoolId: s.school!.id,
      schoolName: s.school!.name,
      planName: s.plan.name,
      billingCycle: s.billingCycle,
      // Subscription.currentStudents defaults to 0 and is never written by any
      // real code path (checkout/webhook doesn't set it) - the school's real
      // enrolled count is the honest number to show, not that stale field.
      students: s.school!._count.students,
      status: s.status,
      renewalDate: s.renewalDate,
      startDate: s.startDate,
      monthlyEquivalent:
        s.billingCycle === "monthly"
          ? s.plan.monthlyPrice ?? 0
          : s.billingCycle === "yearly"
          ? Math.round((s.plan.yearlyPrice ?? 0) / 12)
          : Math.round((s.plan.termPrice ?? 0) / 4),
    }))

  const activeRows = rows.filter((r) => r.status === "active")
  const mrr = activeRows.reduce((sum, r) => sum + r.monthlyEquivalent, 0)
  const pastDueCount = rows.filter((r) => r.status === "past_due").length
  const avgRevenuePerSchool = activeRows.length > 0 ? Math.round(mrr / activeRows.length) : 0

  const planAgg = new Map<string, { activeCount: number; mrr: number }>()
  for (const r of activeRows) {
    const entry = planAgg.get(r.planName) ?? { activeCount: 0, mrr: 0 }
    entry.activeCount += 1
    entry.mrr += r.monthlyEquivalent
    planAgg.set(r.planName, entry)
  }
  const schoolPlans = await prisma.subscriptionPlan.findMany({ where: { audience: "school" }, orderBy: { monthlyPrice: "asc" } })
  const planDistribution = schoolPlans.map((p) => ({
    name: p.name,
    monthlyPrice: p.monthlyPrice,
    activeCount: planAgg.get(p.name)?.activeCount ?? 0,
    mrr: planAgg.get(p.name)?.mrr ?? 0,
  }))

  return (
    <BillingView
      subscriptions={rows}
      stats={{
        mrr,
        activeSubscriptions: activeRows.length,
        pastDueCount,
        avgRevenuePerSchool,
      }}
      planDistribution={planDistribution}
    />
  )
}
