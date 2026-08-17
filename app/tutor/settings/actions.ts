"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { listBanks, resolveAccountNumber, createSubaccount, type Bank } from "@/lib/payments/paystack"
import { getPlatformFeePercent } from "@/lib/platform-settings"
import { sendEmailBestEffort } from "@/lib/email/resend"
import { passwordChangedEmail } from "@/lib/email/templates"
import { requestAccountDeletion, cancelAccountDeletion } from "@/lib/account-deletion"

async function requireTutorSession() {
  const session = await auth()
  if (!session?.user || session.user.role !== "tutor") throw new Error("Not authorized")
  return session.user
}

export async function updateProfile(input: { name: string; email: string }) {
  const user = await requireTutorSession()

  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  if (!name) throw new Error("Name is required.")
  if (!email) throw new Error("Email is required.")

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing && existing.id !== user.id) throw new Error("That email is already in use.")

  await prisma.user.update({ where: { id: user.id }, data: { name, email } })
  revalidatePath("/tutor/settings")
}

export async function updateTutorProfile(input: { headline: string; bio: string; expertiseAreas: string[] }) {
  const user = await requireTutorSession()

  await prisma.tutorProfile.update({
    where: { userId: user.id },
    data: {
      headline: input.headline.trim() || null,
      bio: input.bio.trim() || null,
      expertiseAreas: input.expertiseAreas.map((a) => a.trim()).filter(Boolean),
    },
  })
  revalidatePath("/tutor/settings")
}

export async function updatePassword(input: { currentPassword: string; newPassword: string }) {
  const user = await requireTutorSession()

  if (input.newPassword.length < 8) throw new Error("New password must be at least 8 characters.")

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) throw new Error("Not authorized")

  const currentMatches = await bcrypt.compare(input.currentPassword, dbUser.passwordHash)
  if (!currentMatches) throw new Error("Current password is incorrect.")

  const passwordHash = await bcrypt.hash(input.newPassword, 10)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })

  const { subject, html } = passwordChangedEmail({ name: dbUser.name })
  await sendEmailBestEffort({ to: dbUser.email, subject, html })
}

export async function deleteAccount() {
  const user = await requireTutorSession()
  const { scheduledDeletionAt } = await requestAccountDeletion(user.id)
  revalidatePath("/tutor/settings")
  return { scheduledDeletionAt }
}

export async function cancelDeleteAccount() {
  const user = await requireTutorSession()
  await cancelAccountDeletion(user.id)
  revalidatePath("/tutor/settings")
}

// Populates the bank picker on the Payouts tab. Paystack owns the canonical
// bank/code list, so this is never hardcoded/kept in sync by hand.
export async function getBankList(): Promise<Bank[]> {
  await requireTutorSession()
  return listBanks()
}

// Lets the tutor confirm they've entered the right account before
// connecting it - resolves the real account holder's name from Paystack.
export async function resolvePayoutAccount(input: { accountNumber: string; bankCode: string }) {
  await requireTutorSession()
  if (!input.accountNumber.trim() || !input.bankCode) {
    throw new Error("Select a bank and enter an account number.")
  }
  return resolveAccountNumber(input.accountNumber.trim(), input.bankCode)
}

// Creates the real Paystack subaccount and stores its code on TutorProfile -
// this is the one thing that actually turns on Split Payments for this
// tutor's future course purchases (see initializeCoursePurchase in
// app/student/courses/actions.ts, which only sets subaccountCode/
// transactionChargeGhs when this field is populated).
export async function connectPaystackSubaccount(input: { accountNumber: string; bankCode: string }) {
  const user = await requireTutorSession()
  if (!input.accountNumber.trim() || !input.bankCode) {
    throw new Error("Select a bank and enter an account number.")
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  const tutor = await prisma.tutorProfile.findUnique({ where: { userId: user.id } })
  if (!dbUser || !tutor) throw new Error("Not authorized")
  if (tutor.paystackSubaccountCode) throw new Error("A payout account is already connected.")

  // Re-resolve server-side rather than trusting a client-cached name from
  // the earlier resolvePayoutAccount call - same "never trust client-cached
  // state for a write" rule used everywhere else in this app.
  await resolveAccountNumber(input.accountNumber.trim(), input.bankCode)

  const platformFeePercent = await getPlatformFeePercent()
  const { subaccountCode } = await createSubaccount({
    businessName: dbUser.name,
    bankCode: input.bankCode,
    accountNumber: input.accountNumber.trim(),
    percentageCharge: platformFeePercent,
  })

  await prisma.tutorProfile.update({
    where: { userId: user.id },
    data: { paystackSubaccountCode: subaccountCode },
  })
  revalidatePath("/tutor/settings")
}

// Clears the connected payout account so the tutor can reconnect a
// different one (e.g. they picked the wrong bank, or want to change
// accounts). Doesn't call Paystack to delete the subaccount itself -
// Paystack subaccounts aren't meant to be deleted via the API, only
// deactivated/superseded - clearing our own reference is enough: future
// course purchases (initializeCoursePurchase) only use
// paystackSubaccountCode when it's set, so once cleared, charges simply go
// to the platform's main account again until a new subaccount is connected.
export async function disconnectPaystackSubaccount() {
  const user = await requireTutorSession()

  const tutor = await prisma.tutorProfile.findUnique({ where: { userId: user.id } })
  if (!tutor) throw new Error("Not authorized")
  if (!tutor.paystackSubaccountCode) throw new Error("No payout account is connected.")

  await prisma.tutorProfile.update({
    where: { userId: user.id },
    data: { paystackSubaccountCode: null },
  })
  revalidatePath("/tutor/settings")
}
