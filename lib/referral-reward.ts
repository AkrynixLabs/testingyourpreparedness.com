import { prisma } from "@/lib/prisma"

// 7 free days for both sides, confirmed with the user (2026-08-16) - chosen
// as a modest, low-cost nudge over the 14/30-day alternatives offered.
export const REFERRAL_REWARD_DAYS = 7

// Called from the Paystack webhook (app/api/webhooks/paystack/route.ts)
// right after a brand-new student Subscription is created - i.e. the
// referee's *first* paid subscription, not a later upgrade/renewal, and
// only ever once per referee since Subscription.studentId is unique (a
// second charge for the same student hits the "already has a subscription"
// branch instead, which never calls this).
export async function grantReferralRewardIfEligible(newSubscription: {
  id: string
  studentId: string | null
  renewalDate: Date
}): Promise<void> {
  if (!newSubscription.studentId) return

  const student = await prisma.student.findUnique({
    where: { id: newSubscription.studentId },
    select: { referredByStudentId: true },
  })
  if (!student?.referredByStudentId) return

  const referrerSubscription = await prisma.subscription.findUnique({
    where: { studentId: student.referredByStudentId },
  })

  const extendedReferee = new Date(newSubscription.renewalDate)
  extendedReferee.setDate(extendedReferee.getDate() + REFERRAL_REWARD_DAYS)
  await prisma.subscription.update({
    where: { id: newSubscription.id },
    data: { renewalDate: extendedReferee },
  })

  // Skip silently if the referrer has no subscription of their own yet
  // (e.g. still on the free plan) - a known limitation of this first pass,
  // not retroactively fixed if they subscribe later.
  if (referrerSubscription) {
    const extendedReferrer = new Date(referrerSubscription.renewalDate)
    extendedReferrer.setDate(extendedReferrer.getDate() + REFERRAL_REWARD_DAYS)
    await prisma.subscription.update({
      where: { id: referrerSubscription.id },
      data: { renewalDate: extendedReferrer },
    })
  }
}
