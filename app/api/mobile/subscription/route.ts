import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { getStudentTier, FREE_TIER_MONTHLY_ATTEMPT_LIMIT, getFreeTierAttemptsUsedThisMonth } from "@/lib/student/entitlement"

// Mirrors app/student/settings/page.tsx's subscriptionInfo shape - same
// getStudentTier() call, same plan list query - so mobile's upgrade screen
// shows exactly what the web Settings "Plan" tab shows. Independent
// students only; school-provisioned students have no personal billing.
export async function GET(request: Request) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const student = await prisma.student.findUnique({
    where: { userId: authUser.id },
    include: { subscription: { include: { plan: true } } },
  })
  if (!student) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 })
  }
  if (student.enrollmentType !== "independent") {
    return NextResponse.json({ error: "Only independent students have a personal subscription." }, { status: 400 })
  }

  const [tier, attemptsUsed, plans] = await Promise.all([
    getStudentTier(student),
    getFreeTierAttemptsUsedThisMonth(student.id),
    prisma.subscriptionPlan.findMany({
      where: { audience: "independent", id: { not: "student-free" } },
      orderBy: { monthlyPrice: "asc" },
    }),
  ])

  return NextResponse.json({
    tier,
    planName: student.subscription?.plan.name ?? "Free",
    renewalDate: student.subscription?.renewalDate ?? null,
    freeTierAttemptsUsed: attemptsUsed,
    freeTierAttemptLimit: FREE_TIER_MONTHLY_ATTEMPT_LIMIT,
    plans: plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      monthlyPrice: plan.monthlyPrice,
      termPrice: plan.termPrice,
      yearlyPrice: plan.yearlyPrice,
      features: plan.features,
      popular: plan.popular,
    })),
  })
}
