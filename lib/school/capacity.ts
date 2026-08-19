import { prisma } from "@/lib/prisma"

// A school's SubscriptionPlan.studentLimit was only ever displayed (school-admin
// subscription page's usage bar) - never actually enforced anywhere a Student
// row gets created, so a school on a cheaper/lower-limit plan could add
// students past what they're paying for indefinitely. This is the shared
// enforcement point for all 3 places a Student row is created for a school
// (single add, bulk import, self-service school-code join).
export async function getSchoolStudentCapacity(schoolId: string) {
  const [subscription, current] = await Promise.all([
    prisma.subscription.findUnique({ where: { schoolId }, select: { plan: { select: { studentLimit: true } } } }),
    prisma.student.count({ where: { schoolId } }),
  ])
  const limit = subscription?.plan.studentLimit ?? null // null = unlimited (matches SubscriptionPlan.studentLimit's own convention)
  return { current, limit }
}

// Thrown message is admin-facing (single add / bulk import, both school-admin
// actions) - points at upgrading the plan, the actual fix.
export async function assertStudentCapacityAvailable(schoolId: string, additional = 1) {
  const { current, limit } = await getSchoolStudentCapacity(schoolId)
  if (limit !== null && current + additional > limit) {
    const remaining = Math.max(0, limit - current)
    throw new Error(
      remaining > 0
        ? `Your plan allows up to ${limit} learners (${current} already added, ${remaining} slot${remaining === 1 ? "" : "s"} left). Upgrade your subscription plan to add more.`
        : `Your plan's learner limit (${limit}) has been reached. Upgrade your subscription plan to add more learners.`
    )
  }
}
