"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { BillingCycle } from "@/lib/generated/prisma/client"
import { initializeSubscriptionCheckoutForStudent } from "@/lib/student/subscription"
import {
  registerIndependentStudent as registerIndependentStudentCore,
  type RegisterIndependentStudentInput,
} from "@/lib/student/independent-registration"
import { enforceRateLimit } from "@/lib/rate-limit"
import { stripTrailingSlash } from "@/lib/utils"

export type { RegisterIndependentStudentInput } from "@/lib/student/independent-registration"

// Creates the account only - no Subscription/Payment row here. Checkout
// (initializeStudentCheckout below) is a separate step the wizard calls
// after this succeeds, same "registration and payment are independent
// steps" split as signup/school. Doesn't block anything currently wired:
// independent students get open access to every published Assessment
// regardless of subscription (see student/exams's own documented decision).
export async function registerIndependentStudent(input: RegisterIndependentStudentInput) {
  await enforceRateLimit("signup")
  return registerIndependentStudentCore(input)
}

export type InitializeStudentCheckoutInput = {
  studentId: string
  planId: string
  billingCycle: BillingCycle
}

// Same split as initializeSchoolCheckout in signup/school/actions.ts: only
// creates a pending Payment and starts the Paystack transaction. The
// Subscription/Invoice only get created once the webhook confirms the
// charge actually succeeded. The free plan never reaches this function -
// the wizard skips checkout entirely when price is 0.
//
// A security audit 2026-08-08 (see docs/build-log.md) found this action
// never verified the caller owns input.studentId - fixed by requiring a
// real session for exactly this student. Extended 2026-08-17 (email
// verification): a freshly-registered independent student can no longer
// sign in immediately after registerIndependentStudent (their account
// starts unverified), so the wizard no longer attempts signIn() before
// calling this - it must now work unauthenticated too, for a genuinely new
// student who has no Subscription yet. Same allowance
// initializeSchoolCheckout already has, applied consistently rather than
// loosening security further.
export async function initializeStudentCheckout(input: InitializeStudentCheckoutInput) {
  await enforceRateLimit("signup")

  const session = await auth()
  const student = await prisma.student.findUnique({ where: { id: input.studentId }, include: { subscription: true } })
  if (!student) throw new Error("Student not found.")

  if (session?.user) {
    if (session.user.role !== "student") throw new Error("Not authorized")
    if (student.userId !== session.user.id) throw new Error("Not authorized")
  } else if (student.subscription) {
    throw new Error("Not authorized")
  }

  const appUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  return initializeSubscriptionCheckoutForStudent(
    input.studentId,
    input.planId,
    input.billingCycle,
    `${appUrl}/signup/independent/checkout/callback`
  )
}
