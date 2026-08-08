"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { Role, type BillingCycle } from "@/lib/generated/prisma/client"
import { initializeTransaction } from "@/lib/payments/paystack"
import { generatePaymentId } from "@/lib/payments/ids"

export type RegisterIndependentStudentInput = {
  firstName: string
  lastName: string
  email: string
  password: string
  region: string
  town: string
  guardianName: string
  guardianPhone: string
  guardianEmail: string
  guardianApproved: boolean
}

// Creates the account only - no Subscription/Payment row here. Checkout
// (initializeStudentCheckout below) is a separate step the wizard calls
// after this succeeds, same "registration and payment are independent
// steps" split as signup/school. Doesn't block anything currently wired:
// independent students get open access to every published Assessment
// regardless of subscription (see student/exams's own documented decision).
export async function registerIndependentStudent(input: RegisterIndependentStudentInput) {
  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()
  const email = input.email.trim().toLowerCase()
  const region = input.region.trim()
  const town = input.town.trim()
  const guardianName = input.guardianName.trim()
  const guardianPhone = input.guardianPhone.trim()

  if (!firstName || !lastName) throw new Error("Name is required.")
  if (!email) throw new Error("Email is required.")
  if (input.password.length < 8) throw new Error("Password must be at least 8 characters.")
  if (!region) throw new Error("Region is required.")
  if (!town) throw new Error("Town is required.")
  if (!guardianName) throw new Error("Guardian name is required.")
  if (!guardianPhone) throw new Error("Guardian phone is required.")
  if (!input.guardianApproved) throw new Error("Guardian approval acknowledgment is required.")

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error("An account with that email already exists.")

  const passwordHash = await bcrypt.hash(input.password, 10)

  const student = await prisma.student.create({
    data: {
      user: {
        create: { name: `${firstName} ${lastName}`, email, passwordHash, role: Role.student },
      },
      enrollmentType: "independent",
      status: "active",
      address: [town, region].filter(Boolean).join(", ") || null,
      guardian: {
        create: {
          name: guardianName,
          phone: guardianPhone,
          email: input.guardianEmail.trim() || null,
          relation: "guardian",
          // No external verification channel exists (no email/SMS service) -
          // the signup form's own checkbox ("I confirm my guardian has
          // approved this registration") is the only approval mechanism
          // available right now, so checking it stands in for approvedAt.
          approvedAt: new Date(),
        },
      },
    },
  })

  return { studentId: student.id, email, password: input.password }
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
export async function initializeStudentCheckout(input: InitializeStudentCheckoutInput) {
  const student = await prisma.student.findUnique({ where: { id: input.studentId }, include: { user: true } })
  if (!student) throw new Error("Student not found.")

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: input.planId } })
  if (!plan || plan.audience !== "independent") throw new Error("Invalid plan.")

  const amountGhs =
    input.billingCycle === "yearly" ? plan.yearlyPrice : input.billingCycle === "term" ? plan.termPrice : plan.monthlyPrice
  if (!amountGhs) throw new Error(`This plan doesn't support ${input.billingCycle} billing.`)

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const { authorizationUrl } = await initializeTransaction({
    email: student.user.email,
    amountGhs,
    reference: paymentId,
    callbackUrl: `${appUrl}/signup/independent/checkout/callback`,
    metadata: { studentId: student.id, planId: plan.id, billingCycle: input.billingCycle },
  })

  return { authorizationUrl }
}
