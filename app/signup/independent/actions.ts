"use server"

import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role, type BillingCycle } from "@/lib/generated/prisma/client"
import { initializeTransaction } from "@/lib/payments/paystack"
import { generatePaymentId } from "@/lib/payments/ids"
import { enforceRateLimit } from "@/lib/rate-limit"
import { asString } from "@/lib/validation"
import { subscribeToNewsletterBestEffort } from "@/lib/newsletter/brevo"
import { stripTrailingSlash } from "@/lib/utils"
import { sendEmailBestEffort } from "@/lib/email/resend"
import { welcomeEmail } from "@/lib/email/templates"
import { generateReferralCode } from "@/lib/referral-code"
import { sendVerificationEmailBestEffort } from "@/lib/email-verification"

export type RegisterIndependentStudentInput = {
  firstName: string
  lastName: string
  email: string
  password: string
  region: string
  town: string
  subscribeNewsletter: boolean
  referralCode?: string
}

// Creates the account only - no Subscription/Payment row here. Checkout
// (initializeStudentCheckout below) is a separate step the wizard calls
// after this succeeds, same "registration and payment are independent
// steps" split as signup/school. Doesn't block anything currently wired:
// independent students get open access to every published Assessment
// regardless of subscription (see student/exams's own documented decision).
export async function registerIndependentStudent(input: RegisterIndependentStudentInput) {
  await enforceRateLimit("signup")

  const firstName = asString(input.firstName).trim()
  const lastName = asString(input.lastName).trim()
  const email = asString(input.email).trim().toLowerCase()
  const region = asString(input.region).trim()
  const town = asString(input.town).trim()
  const password = asString(input.password)

  if (!firstName || !lastName) throw new Error("Name is required.")
  if (!email) throw new Error("Email is required.")
  if (password.length < 8) throw new Error("Password must be at least 8 characters.")
  if (!region) throw new Error("Region is required.")
  if (!town) throw new Error("Town is required.")

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error("An account with that email already exists.")

  const passwordHash = await bcrypt.hash(password, 10)
  const studentName = `${firstName} ${lastName}`

  // Invalid/unrecognized codes are silently ignored rather than blocking
  // signup - a typo in an optional field shouldn't stop someone creating an
  // account. Only independent students have referral codes at all (they're
  // the ones with a personal subscription the reward can extend) - a code
  // belonging to a school-provisioned student's own account (none exists,
  // referralCode is only ever set here) or a bad code both resolve to null.
  let referredByStudentId: string | undefined = undefined
  const enteredCode = asString(input.referralCode ?? "").trim().toUpperCase()
  if (enteredCode) {
    const referrer = await prisma.student.findUnique({ where: { referralCode: enteredCode } })
    if (referrer) referredByStudentId = referrer.id
  }

  const referralCode = await generateReferralCode(firstName)

  const student = await prisma.student.create({
    data: {
      user: {
        create: {
          name: studentName,
          email,
          passwordHash,
          role: Role.student,
          // Self-signup - real email verification required before this
          // account can log in (see prisma/schema.prisma's User model).
          emailVerified: false,
        },
      },
      enrollmentType: "independent",
      status: "active",
      address: [town, region].filter(Boolean).join(", ") || null,
      referralCode,
      referredByStudent: referredByStudentId ? { connect: { id: referredByStudentId } } : undefined,
    },
    select: { id: true, userId: true },
  })

  if (input.subscribeNewsletter) {
    await subscribeToNewsletterBestEffort(email)
  }

  const { subject, html } = welcomeEmail({ name: studentName, roleLabel: "student", dashboardPath: "/student" })
  await sendEmailBestEffort({ to: email, subject, html })

  await sendVerificationEmailBestEffort(student.userId, email, studentName)

  return { studentId: student.id, email, password }
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
  const student = await prisma.student.findUnique({ where: { id: input.studentId }, include: { user: true, subscription: true } })
  if (!student) throw new Error("Student not found.")

  if (session?.user) {
    if (session.user.role !== "student") throw new Error("Not authorized")
    if (student.userId !== session.user.id) throw new Error("Not authorized")
  } else if (student.subscription) {
    throw new Error("Not authorized")
  }

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

  const appUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  const { authorizationUrl } = await initializeTransaction({
    email: student.user.email,
    amountGhs,
    reference: paymentId,
    callbackUrl: `${appUrl}/signup/independent/checkout/callback`,
    metadata: { studentId: student.id, planId: plan.id, billingCycle: input.billingCycle },
  })

  return { authorizationUrl }
}
