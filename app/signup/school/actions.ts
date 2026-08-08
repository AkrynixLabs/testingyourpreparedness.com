"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { Role, type BillingCycle, type OwnershipType } from "@/lib/generated/prisma/client"
import { initializeTransaction } from "@/lib/payments/paystack"
import { generatePaymentId } from "@/lib/payments/ids"

export type RegisterSchoolInput = {
  schoolName: string
  ownershipType: OwnershipType
  registrationNumber: string
  yearEstablished: string
  website: string
  region: string
  district: string
  town: string
  address: string
  postalCode: string
  adminFirstName: string
  adminLastName: string
  adminEmail: string
  adminPhone: string
  adminPassword: string
}

// Creates the School (in its existing `pending` verification state) and the
// primary admin account. No Subscription/Payment row is created here - that
// only happens once checkout actually succeeds, via initializeSchoolCheckout
// below + the Paystack webhook. School verification (this `pending` status)
// and payment are two independent gates, not the same thing.
export async function registerSchool(input: RegisterSchoolInput) {
  const schoolName = input.schoolName.trim()
  const region = input.region.trim()
  const district = input.district.trim()
  const town = input.town.trim()
  const address = input.address.trim()
  const adminFirstName = input.adminFirstName.trim()
  const adminLastName = input.adminLastName.trim()
  const adminEmail = input.adminEmail.trim().toLowerCase()
  const adminPhone = input.adminPhone.trim()

  if (!schoolName) throw new Error("School name is required.")
  if (!input.ownershipType) throw new Error("Ownership type is required.")
  if (!region) throw new Error("Region is required.")
  if (!district) throw new Error("District is required.")
  if (!town) throw new Error("Town is required.")
  if (!address) throw new Error("Address is required.")
  if (!adminFirstName || !adminLastName) throw new Error("Administrator name is required.")
  if (!adminEmail) throw new Error("Administrator email is required.")
  if (!adminPhone) throw new Error("Administrator phone is required.")
  if (input.adminPassword.length < 8) throw new Error("Password must be at least 8 characters.")

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (existing) throw new Error("An account with that email already exists.")

  const code = await generateSchoolCode(schoolName)
  const passwordHash = await bcrypt.hash(input.adminPassword, 10)

  const school = await prisma.school.create({
    data: {
      code,
      name: schoolName,
      registrationNumber: input.registrationNumber.trim() || null,
      ownershipType: input.ownershipType,
      // This wizard only collects JHS student counts - BECE prep is JHS-scoped,
      // so junior_high is the only level this signup flow can honestly infer.
      educationLevel: "junior_high",
      region,
      district,
      town,
      address,
      postalCode: input.postalCode.trim() || null,
      email: adminEmail,
      phone: adminPhone,
      website: input.website.trim() || null,
      established: input.yearEstablished ? Number(input.yearEstablished) : null,
      status: "pending",
      admins: {
        create: {
          isPrimary: true,
          user: {
            create: {
              name: `${adminFirstName} ${adminLastName}`,
              email: adminEmail,
              passwordHash,
              role: Role.school_admin,
            },
          },
        },
      },
    },
  })

  return { schoolId: school.id }
}

export type InitializeCheckoutInput = {
  schoolId: string
  planId: string
  billingCycle: BillingCycle
  // "upgrade" when an active Subscription already exists and this checkout
  // is meant to change its plan/cycle, rather than create a brand new one.
  // The webhook branches on this (see app/api/webhooks/paystack/route.ts).
  paymentType?: "new" | "upgrade"
  callbackPath?: string
}

// Creates a pending Payment and starts a real Paystack transaction. The
// Subscription/Invoice don't exist yet - those are only created (or, for an
// upgrade, updated) once the webhook confirms the charge actually succeeded
// (see app/api/webhooks/paystack/route.ts). Never trust a client-reported
// "payment succeeded" - the webhook (or, as a fallback, server-side
// verifyTransaction on the callback page) is the only source of truth.
export async function initializeSchoolCheckout(input: InitializeCheckoutInput) {
  const school = await prisma.school.findUnique({ where: { id: input.schoolId } })
  if (!school) throw new Error("School not found.")

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: input.planId } })
  if (!plan || plan.audience !== "school") throw new Error("Invalid plan.")

  const amountGhs = input.billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice
  if (!amountGhs) throw new Error(`This plan doesn't support ${input.billingCycle} billing.`)

  const paymentId = generatePaymentId()
  await prisma.payment.create({
    data: {
      id: paymentId,
      amount: amountGhs,
      status: "pending",
      type: input.paymentType === "upgrade" ? "upgrade" : "new",
      method: "card",
      paystackReference: paymentId,
    },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const { authorizationUrl } = await initializeTransaction({
    email: school.email,
    amountGhs,
    reference: paymentId,
    callbackUrl: `${appUrl}${input.callbackPath ?? "/signup/school/checkout/callback"}`,
    metadata: { schoolId: school.id, planId: plan.id, billingCycle: input.billingCycle },
  })

  return { authorizationUrl }
}

async function generateSchoolCode(schoolName: string) {
  const prefix = schoolName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 4) || "SCH"

  for (let i = 0; i < 20; i++) {
    const candidate = `${prefix}-${String(Math.floor(Math.random() * 900) + 100)}`
    const exists = await prisma.school.findUnique({ where: { code: candidate } })
    if (!exists) return candidate
  }
  throw new Error("Could not generate a unique school code, please try again.")
}
