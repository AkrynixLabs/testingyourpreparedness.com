"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { initializeSchoolCheckout } from "@/app/signup/school/actions"
import type { BillingCycle } from "@/lib/generated/prisma/client"

async function resolveSchoolId() {
  const session = await auth()
  if (session?.user?.role !== "school_admin") throw new Error("Not authorized")
  const schoolAdmin = await prisma.schoolAdmin.findUnique({ where: { userId: session.user.id }, select: { schoolId: true } })
  if (!schoolAdmin) throw new Error("Not authorized")
  return schoolAdmin.schoolId
}

export async function cancelSubscription() {
  const schoolId = await resolveSchoolId()

  const subscription = await prisma.subscription.findUnique({ where: { schoolId } })
  if (!subscription) throw new Error("No active subscription to cancel.")
  if (subscription.status === "cancelled") throw new Error("Subscription is already cancelled.")

  await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "cancelled" } })
  revalidatePath("/school-admin/subscription")
}

export async function initiateUpgradeCheckout(planId: string, billingCycle: BillingCycle) {
  const schoolId = await resolveSchoolId()

  const subscription = await prisma.subscription.findUnique({ where: { schoolId } })
  const { authorizationUrl } = await initializeSchoolCheckout({
    schoolId,
    planId,
    billingCycle,
    paymentType: subscription ? "upgrade" : "new",
    callbackPath: "/school-admin/subscription/checkout/callback",
  })

  return { authorizationUrl }
}
