import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { Role } from "@/lib/generated/prisma/client"
import { asString } from "@/lib/validation"
import { subscribeToNewsletterBestEffort } from "@/lib/newsletter/brevo"
import { sendEmailBestEffort } from "@/lib/email/resend"
import { welcomeEmail } from "@/lib/email/templates"
import { generateReferralCode } from "@/lib/referral-code"
import { sendVerificationEmailBestEffort } from "@/lib/email-verification"

// Extracted out of app/signup/independent/actions.ts's registerIndependentStudent
// so a mobile caller (app/api/mobile/auth/register) can create the exact same
// account the web wizard does - one implementation, two callers, same pattern
// as lib/student/join.ts's createJoinedStudent. Deliberately does no rate
// limiting itself - enforceRateLimit relies on next/headers()'s Server Action
// request context, which a plain Route Handler doesn't share, so each caller
// enforces it in its own way at its own entry point (same note as join.ts).
//
// Creates the account only - no Subscription/Payment row here, on either
// caller. Web's wizard follows up with a separate initializeStudentCheckout
// call for plan selection + Paystack checkout; mobile deliberately does NOT
// (confirmed with the user 2026-08-18) - a freshly-registered account has no
// auth token yet (email verification blocks login first, so mobile's
// existing checkout route, which requires a bearer token, can't be reused
// in-flow), and a new independent student already defaults to the free tier
// with no Subscription row at all (see lib/student/entitlement.ts's
// getStudentTier). Mobile signup is account-creation only; upgrading to a
// paid plan happens afterward via the already-built Upgrade Plan screen.

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

export async function registerIndependentStudent(input: RegisterIndependentStudentInput) {
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

  const { subject, html } = welcomeEmail({ name: studentName, roleLabel: "learner", dashboardPath: "/student" })
  await sendEmailBestEffort({ to: email, subject, html })

  await sendVerificationEmailBestEffort(student.userId, email, studentName)

  return { studentId: student.id, email, password }
}
