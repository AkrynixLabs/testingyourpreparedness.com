import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { UpgradeView } from "./upgrade-view"

export default async function UpgradePage() {
  const session = await auth()
  const schoolAdmin = await prisma.schoolAdmin.findUnique({
    where: { userId: session!.user.id },
    select: { schoolId: true },
  })
  if (!schoolAdmin) notFound()

  const [plans, subscription] = await Promise.all([
    prisma.subscriptionPlan.findMany({ where: { audience: "school" }, orderBy: { monthlyPrice: "asc" } }),
    prisma.subscription.findUnique({ where: { schoolId: schoolAdmin.schoolId }, include: { plan: true } }),
  ])

  return (
    <UpgradeView
      plans={plans}
      currentPlanId={subscription?.planId ?? null}
      currentBillingCycle={subscription?.billingCycle ?? null}
    />
  )
}
