import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyWebhookSignature } from "@/lib/payments/paystack"
import { generateInvoiceId } from "@/lib/payments/ids"
import type { BillingCycle } from "@/lib/generated/prisma/client"

// Paystack calls this after a transaction completes. This is the source of
// truth for "did the charge actually succeed" - never trust a client-side
// redirect alone (a user closing the tab after paying, or a network blip on
// the callback page, shouldn't lose a real payment). The callback pages
// (app/signup/school/checkout/callback, app/signup/independent/checkout/callback)
// each do their own independent verifyTransaction call as a synchronous
// fallback for the user's own UX, but this webhook is what actually creates
// or updates the Subscription/Invoice/PaymentMethod.
export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get("x-paystack-signature")

  let validSignature: boolean
  try {
    validSignature = verifyWebhookSignature(rawBody, signature)
  } catch {
    // Paystack not configured (no secret key) - can't verify anything.
    return NextResponse.json({ error: "Not configured" }, { status: 503 })
  }

  if (!validSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(rawBody)

  if (event.event === "charge.success") {
    if (event.data?.metadata?.courseId) {
      await handleCoursePurchaseSuccess(event.data)
    } else {
      await handleChargeSuccess(event.data)
    }
  }

  // Ack fast regardless of event type - Paystack retries on non-2xx.
  return NextResponse.json({ received: true })
}

type ChargeMetadata = {
  schoolId?: string
  studentId?: string
  planId?: string
  billingCycle?: BillingCycle
}

type ChargeAuthorization = {
  channel?: string
  card_type?: string
  last4?: string
  exp_month?: string
  exp_year?: string
}

function renewalDateFor(billingCycle: BillingCycle): Date {
  const renewalDate = new Date()
  if (billingCycle === "yearly") renewalDate.setFullYear(renewalDate.getFullYear() + 1)
  else if (billingCycle === "term") renewalDate.setMonth(renewalDate.getMonth() + 4) // no stored "term length" elsewhere to reference
  else renewalDate.setMonth(renewalDate.getMonth() + 1)
  return renewalDate
}

// Captures card details Paystack returns on a successful charge into a real
// PaymentMethod row - only for the "card" channel, since Paystack's mobile
// money authorization payload doesn't map cleanly onto MomoProvider/momoNumber
// without more channel-specific handling than this slice covers.
async function savePaymentMethodIfCard(
  authorization: ChargeAuthorization | undefined,
  owner: { schoolId?: string; studentId?: string }
) {
  if (!authorization || authorization.channel !== "card") return
  if (!authorization.last4 || !authorization.exp_month || !authorization.exp_year) return

  const existingDefault = await prisma.paymentMethod.findFirst({
    where: { schoolId: owner.schoolId ?? undefined, studentId: owner.studentId ?? undefined, isDefault: true },
  })

  await prisma.paymentMethod.create({
    data: {
      type: "card",
      schoolId: owner.schoolId ?? null,
      studentId: owner.studentId ?? null,
      isDefault: !existingDefault,
      cardBrand: authorization.card_type ?? null,
      cardLast4: authorization.last4,
      cardExpiry: `${authorization.exp_month}/${authorization.exp_year.slice(-2)}`,
    },
  })
}

// CoursePurchase is deliberately not a Payment/Invoice (see CLAUDE.md's
// "course marketplace" entry - a one-time split transaction is a different
// shape from subscription billing) - a separate, simpler branch: mark the
// purchase completed and create the Enrollment. Idempotent the same way as
// handleChargeSuccess: no-ops on an unknown reference or an already-completed
// purchase, since Paystack retries webhook deliveries.
async function handleCoursePurchaseSuccess(data: { reference: string; metadata?: { courseId?: string; studentId?: string } }) {
  const purchase = await prisma.coursePurchase.findUnique({ where: { id: data.reference } })
  if (!purchase) return
  if (purchase.status === "completed") return

  await prisma.coursePurchase.update({ where: { id: purchase.id }, data: { status: "completed" } })

  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId: purchase.courseId, studentId: purchase.studentId } },
  })
  if (!existingEnrollment) {
    await prisma.enrollment.create({ data: { courseId: purchase.courseId, studentId: purchase.studentId } })
  }
}

async function handleChargeSuccess(data: {
  reference: string
  metadata?: ChargeMetadata
  authorization?: ChargeAuthorization
}) {
  const payment = await prisma.payment.findUnique({ where: { id: data.reference } })
  if (!payment) return // unknown reference - nothing to reconcile
  if (payment.status === "completed") return // already processed, idempotent no-op

  const { schoolId, studentId, planId, billingCycle } = data.metadata ?? {}
  if ((!schoolId && !studentId) || !planId || !billingCycle) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "completed" } })
    return
  }

  // schoolId/studentId are mutually exclusive - exactly one owner type per
  // Subscription, matching Subscription's own schema comment.
  const existingSubscription = schoolId
    ? await prisma.subscription.findUnique({ where: { schoolId } })
    : await prisma.subscription.findUnique({ where: { studentId } })

  const now = new Date()

  if (existingSubscription) {
    if (payment.type === "upgrade") {
      // Real plan/cycle change, backed by a real successful charge - update
      // the existing Subscription rather than creating a second one
      // (schoolId/studentId are each unique on Subscription).
      const invoiceId = await generateInvoiceId(now.getFullYear())
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: { planId, billingCycle, status: "active", renewalDate: renewalDateFor(billingCycle) },
      })
      await prisma.invoice.create({
        data: {
          id: invoiceId,
          subscriptionId: existingSubscription.id,
          amount: payment.amount,
          status: "paid",
          period: now.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          dueDate: now,
          paidDate: now,
        },
      })
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "completed", invoiceId } })
      await savePaymentMethodIfCard(data.authorization, { schoolId, studentId })
      return
    }

    // A subscription already exists but this wasn't an upgrade payment
    // (e.g. the webhook fired twice for the original purchase) - just mark
    // the payment completed, don't touch the existing Subscription.
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "completed" } })
    return
  }

  const invoiceId = await generateInvoiceId(now.getFullYear())

  const subscription = await prisma.subscription.create({
    data: {
      planId,
      schoolId: schoolId ?? null,
      studentId: studentId ?? null,
      billingCycle,
      status: "active",
      renewalDate: renewalDateFor(billingCycle),
    },
  })

  await prisma.invoice.create({
    data: {
      id: invoiceId,
      subscriptionId: subscription.id,
      amount: payment.amount,
      status: "paid",
      period: now.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      dueDate: now,
      paidDate: now,
    },
  })

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "completed", invoiceId },
  })

  await savePaymentMethodIfCard(data.authorization, { schoolId, studentId })
}
