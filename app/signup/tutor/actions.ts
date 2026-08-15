"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { Role } from "@/lib/generated/prisma/client"
import { enforceRateLimit } from "@/lib/rate-limit"
import { asString, asStringArray } from "@/lib/validation"
import { subscribeToNewsletterBestEffort } from "@/lib/newsletter/brevo"
import { sendEmailBestEffort } from "@/lib/email/resend"
import { welcomeEmail } from "@/lib/email/templates"

export type RegisterTutorInput = {
  name: string
  email: string
  password: string
  headline: string
  bio: string
  expertiseAreas: string[]
  agreeTerms: boolean
  subscribeNewsletter: boolean
}

// Tutor onboarding is genuinely self-service, no admin-approval gate -
// matches the locked "publish-first, moderate-after" trust model, a real
// difference from Content Admin (internal, pre-vetted). Creates the account
// and drops the tutor straight into /tutor via the client's own signIn()
// call after this resolves, same auto-sign-in pattern as
// registerIndependentStudent/registerJoinedStudent.
export async function registerTutor(input: RegisterTutorInput) {
  await enforceRateLimit("signup")

  const name = asString(input.name).trim()
  const email = asString(input.email).trim().toLowerCase()
  const headline = asString(input.headline).trim()
  const bio = asString(input.bio).trim()
  const password = asString(input.password)
  const expertiseAreas = asStringArray(input.expertiseAreas).map((a) => a.trim()).filter(Boolean)

  if (!name) throw new Error("Name is required.")
  if (!email) throw new Error("Email is required.")
  if (password.length < 8) throw new Error("Password must be at least 8 characters.")
  if (!input.agreeTerms) throw new Error("You must agree to the Terms of Service and Privacy Policy.")

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error("An account with that email already exists.")

  const passwordHash = await bcrypt.hash(password, 10)

  const tutor = await prisma.tutorProfile.create({
    data: {
      bio: bio || null,
      headline: headline || null,
      expertiseAreas,
      user: {
        create: { name, email, passwordHash, role: Role.tutor },
      },
    },
  })

  if (input.subscribeNewsletter) {
    await subscribeToNewsletterBestEffort(email)
  }

  const { subject, html } = welcomeEmail({ name, roleLabel: "tutor", dashboardPath: "/tutor" })
  await sendEmailBestEffort({ to: email, subject, html })

  return { tutorId: tutor.id, email }
}
