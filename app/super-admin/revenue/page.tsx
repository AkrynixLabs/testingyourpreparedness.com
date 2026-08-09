import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RevenueView } from "./revenue-view"

export default async function RevenuePage() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") notFound()

  const payments = await prisma.payment.findMany({
    where: { status: "completed" },
    include: {
      // student.user scoped with `select` - only .name is ever read
      // (payerName below). Not an actual leak (recentTransactions already
      // only derives a plain payerName string, never passes the raw user
      // object to the client), but tightened for consistency with the fix
      // applied to super-admin/payments's identical pattern, found by a
      // security audit 2026-08-08 (see docs/build-log.md).
      invoice: {
        include: {
          subscription: {
            include: { plan: true, school: true, student: { include: { user: { select: { name: true } } } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
  const recurringRevenue = payments.filter((p) => p.type === "renewal").reduce((sum, p) => sum + p.amount, 0)
  const newRevenue = payments.filter((p) => p.type === "new").reduce((sum, p) => sum + p.amount, 0)
  const upgradeRevenue = payments.filter((p) => p.type === "upgrade").reduce((sum, p) => sum + p.amount, 0)
  const avgTransaction = payments.length > 0 ? Math.round(totalRevenue / payments.length) : 0

  const planAgg = new Map<string, { amount: number; count: number }>()
  const regionAgg = new Map<string, number>()
  const methodAgg = new Map<string, number>()
  let schoolRevenue = 0
  let independentRevenue = 0
  for (const p of payments) {
    const planName = p.invoice?.subscription.plan.name
    if (planName) {
      const entry = planAgg.get(planName) ?? { amount: 0, count: 0 }
      entry.amount += p.amount
      entry.count += 1
      planAgg.set(planName, entry)
    }
    const sub = p.invoice?.subscription
    if (sub?.school) {
      schoolRevenue += p.amount
      regionAgg.set(sub.school.region, (regionAgg.get(sub.school.region) ?? 0) + p.amount)
    } else if (sub?.student) {
      // Independent-student subscriptions have no structured region field
      // (region/town were folded into Student.address as free text at
      // signup) - only school-owned revenue can be broken down by region.
      independentRevenue += p.amount
    }
    methodAgg.set(p.method, (methodAgg.get(p.method) ?? 0) + p.amount)
  }

  const revenueByPlan = Array.from(planAgg.entries()).map(([name, v]) => ({ name, amount: v.amount, count: v.count }))
  const revenueByRegion = Array.from(regionAgg.entries())
    .map(([region, amount]) => ({ region, amount }))
    .sort((a, b) => b.amount - a.amount)
  const paymentMethods = Array.from(methodAgg.entries())
    .map(([method, amount]) => ({
      method,
      amount,
      percentage: totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  const recentTransactions = payments.slice(0, 20).map((p) => {
    const sub = p.invoice?.subscription
    const payerName = sub?.school?.name ?? sub?.student?.user.name ?? "-"
    const payerType: "school" | "independent" | null = sub?.school ? "school" : sub?.student ? "independent" : null
    return {
      id: p.id,
      payerName,
      payerType,
      planName: sub?.plan.name ?? "-",
      type: p.type,
      amount: p.amount,
      createdAt: p.createdAt,
      status: p.status,
    }
  })

  return (
    <RevenueView
      stats={{
        totalRevenue,
        recurringRevenue,
        newRevenue,
        upgradeRevenue,
        avgTransaction,
        transactionCount: payments.length,
        schoolRevenue,
        independentRevenue,
      }}
      revenueByPlan={revenueByPlan}
      revenueByRegion={revenueByRegion}
      paymentMethods={paymentMethods}
      recentTransactions={recentTransactions}
    />
  )
}
