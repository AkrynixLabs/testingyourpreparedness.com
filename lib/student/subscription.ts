import { prisma } from "@/lib/prisma"
import type { BillingCycle } from "@/lib/generated/prisma/client"
import { initializeTransaction } from "@/lib/payments/paystack"
import { generatePaymentId } from "@/lib/payments/ids"

// Extracted out of app/signup/independent/actions.ts's initializeStudentCheckout
// so a mobile caller (authenticated via bearer token, not a NextAuth session
// cookie) can start the exact same Paystack transaction the web upgrade flow
// does - one implementation, two callers, same pattern as lib/student/courses.ts.
// Deliberately does no auth check itself - the web Server Action and the mobile
// route each do their own (different) auth check before calling this.
export async function initializeSubscriptionCheckoutForStudent(
  studentId: string,
  planId: string,
  billingCycle: BillingCycle,
  callbackUrl: string
): Promise<{ authorizationUrl: string }> {
  const student = await prisma.student.findUnique({ where: { id: studentId }, include: { user: true } })
  if (!student) throw new Error("Student not found.")

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } })
  if (!plan || plan.audience !== "independent") throw new Error("Invalid plan.")

  const amountGhs =
    billingCycle === "yearly" ? plan.yearlyPrice : billingCycle === "term" ? plan.termPrice : plan.monthlyPrice
  if (!amountGhs) throw new Error(`This plan doesn't support ${billingCycle} billing.`)

  const paymentId = generatePaymentId()
  await prisma.payment.create({
    data: {
      id: paymentId,
      amount: amountGhs,
      status: "pending",
      type: "new",
      method: "card",
      paystackReference: paymentId,
    },
  })

  const { authorizationUrl } = await initializeTransaction({
    email: student.user.email,
    amountGhs,
    reference: paymentId,
    callbackUrl,
    metadata: { studentId: student.id, planId: plan.id, billingCycle },
  })

  return { authorizationUrl }
}
