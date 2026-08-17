import { prisma } from "@/lib/prisma"
import type { Student } from "@/lib/generated/prisma/client"

// Resolves the real free-vs-paid tier for independent students, and
// enforces the limits the "student-free" SubscriptionPlan row
// (prisma/seed.ts) has always advertised - "5 practice tests/month",
// "Basic score reports", "Limited question bank" - but that were never
// actually checked anywhere in the app until now. School-provisioned
// students are always full access (their school already pays; there's no
// personal Subscription to check).
//
// An independent student who picks the free plan at signup never gets a
// Subscription row at all (see independent-signup-wizard.tsx - checkout is
// skipped entirely when price is 0), so "no active Subscription" already IS
// the free tier, not a separate flag that needs its own column. A lapsed,
// cancelled, or past-due paid subscription falls back to the free tier too
// rather than a hard lockout - softer than blocking someone outright for a
// failed renewal.

export type StudentTier = "free" | "paid"

export const FREE_TIER_MONTHLY_ATTEMPT_LIMIT = 5
const FREE_TIER_WINDOW_DAYS = 30

export async function getStudentTier(student: Pick<Student, "id" | "enrollmentType">): Promise<StudentTier> {
  if (student.enrollmentType !== "independent") return "paid"

  const subscription = await prisma.subscription.findUnique({
    where: { studentId: student.id },
    select: { status: true, renewalDate: true },
  })
  if (!subscription) return "free"
  if (subscription.status !== "active") return "free"
  if (subscription.renewalDate < new Date()) return "free"
  return "paid"
}

// Rolling 30-day window, not calendar month - avoids the edge case of a
// student getting a fresh batch of 5 on the 1st regardless of when they
// actually used their last one.
export async function getFreeTierAttemptsUsedThisMonth(studentId: string): Promise<number> {
  const windowStart = new Date()
  windowStart.setDate(windowStart.getDate() - FREE_TIER_WINDOW_DAYS)
  return prisma.examAttempt.count({
    where: { studentId, submittedAt: { gte: windowStart } },
  })
}
