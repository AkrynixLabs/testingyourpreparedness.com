"use server"

import crypto from "node:crypto"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role, type BillingCycle } from "@/lib/generated/prisma/client"
import { initializeTransaction } from "@/lib/payments/paystack"
import { generatePaymentId } from "@/lib/payments/ids"
import { sendEmailBestEffort } from "@/lib/email/resend"
import { guardianApprovalEmail } from "@/lib/email/templates"
import { enforceRateLimit } from "@/lib/rate-limit"

const GUARDIAN_APPROVAL_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days, same as Invitation

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
  // Renamed from guardianApproved (2026-08-08) - this is no longer an
  // attestation that approval already happened (it never really was one),
  // it's the student's consent to their guardian being contacted for real
  // approval via email.
  consentToContactGuardian: boolean
}

// Creates the account only - no Subscription/Payment row here. Checkout
// (initializeStudentCheckout below) is a separate step the wizard calls
// after this succeeds, same "registration and payment are independent
// steps" split as signup/school. Doesn't block anything currently wired:
// independent students get open access to every published Assessment
// regardless of subscription (see student/exams's own documented decision).
export async function registerIndependentStudent(input: RegisterIndependentStudentInput) {
  await enforceRateLimit("signup")

  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()
  const email = input.email.trim().toLowerCase()
  const region = input.region.trim()
  const town = input.town.trim()
  const guardianName = input.guardianName.trim()
  const guardianPhone = input.guardianPhone.trim()
  const guardianEmail = input.guardianEmail.trim().toLowerCase()

  if (!firstName || !lastName) throw new Error("Name is required.")
  if (!email) throw new Error("Email is required.")
  if (input.password.length < 8) throw new Error("Password must be at least 8 characters.")
  if (!region) throw new Error("Region is required.")
  if (!town) throw new Error("Town is required.")
  if (!guardianName) throw new Error("Guardian name is required.")
  if (!guardianPhone) throw new Error("Guardian phone is required.")
  // Guardian email is now required (decided 2026-08-08) - a real approval
  // flow can't exist without an address to send it to.
  if (!guardianEmail) throw new Error("Guardian email is required.")
  if (!input.consentToContactGuardian) throw new Error("Consent to contact your guardian is required.")

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error("An account with that email already exists.")

  const passwordHash = await bcrypt.hash(input.password, 10)
  const approvalToken = crypto.randomBytes(32).toString("hex")
  const approvalTokenExpiresAt = new Date(Date.now() + GUARDIAN_APPROVAL_EXPIRY_MS)
  const studentName = `${firstName} ${lastName}`

  const student = await prisma.student.create({
    data: {
      user: {
        create: { name: studentName, email, passwordHash, role: Role.student },
      },
      enrollmentType: "independent",
      status: "active",
      address: [town, region].filter(Boolean).join(", ") || null,
      guardian: {
        create: {
          name: guardianName,
          phone: guardianPhone,
          email: guardianEmail,
          relation: "guardian",
          // Not set here anymore - only app/guardian/approve's acceptInvitation-
          // style flow sets this for real, once the guardian actually clicks
          // through. The account itself still isn't gated on it (matches this
          // app's existing "no gate blocks account creation" pattern).
          approvalToken,
          approvalTokenExpiresAt,
        },
      },
    },
  })

  const { subject, html } = guardianApprovalEmail({ guardianName, studentName, token: approvalToken })
  await sendEmailBestEffort({ to: guardianEmail, subject, html })

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
//
// Unlike initializeSchoolCheckout, there's no legitimate anonymous caller
// here - independent-student signup auto-signs-in *before* calling this
// (see independent-signup-wizard.tsx: signIn() happens, then checkout, with
// an early return if sign-in fails), so a real session always exists by the
// time this runs. A security audit 2026-08-08 (see docs/build-log.md) found
// this action never verified the caller owns input.studentId - fixed by
// requiring a real session for exactly this student.
export async function initializeStudentCheckout(input: InitializeStudentCheckoutInput) {
  await enforceRateLimit("signup")

  const session = await auth()
  if (session?.user?.role !== "student") throw new Error("Not authorized")

  const student = await prisma.student.findUnique({ where: { id: input.studentId }, include: { user: true } })
  if (!student) throw new Error("Student not found.")
  if (student.userId !== session.user.id) throw new Error("Not authorized")

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
