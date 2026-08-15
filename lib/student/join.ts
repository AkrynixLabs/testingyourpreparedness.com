import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { Role } from "@/lib/generated/prisma/client"
import { asString } from "@/lib/validation"
import { subscribeToNewsletterBestEffort } from "@/lib/newsletter/brevo"

// Extracted from app/join/actions.ts (unchanged logic) so
// app/api/mobile/auth/join can share the exact same school-code lookup and
// account-creation logic the web join flow uses - same "one function, two
// callers" pattern as lib/student/courses.ts. Deliberately does not include
// rate limiting here: enforceRateLimit relies on next/headers()'s Server
// Action request context, which a plain Route Handler doesn't share, so
// each caller (the "use server" action, the mobile route) enforces it in
// its own way at its own entry point.

export type VerifiedSchool = { schoolId: string; name: string; town: string; region: string }

export async function lookupSchoolByCode(code: string): Promise<VerifiedSchool> {
  const normalized = asString(code).trim().toUpperCase()
  if (!normalized) throw new Error("Enter an invite code.")

  const school = await prisma.school.findUnique({ where: { code: normalized } })
  if (!school) {
    throw new Error("Invalid invite code. Please check with your school administrator.")
  }

  return { schoolId: school.id, name: school.name, town: school.town, region: school.region }
}

export type JoinedStudentInput = {
  schoolCode: string
  firstName: string
  lastName: string
  email: string
  password: string
  agreeTerms: boolean
  subscribeNewsletter: boolean
}

export async function createJoinedStudent(input: JoinedStudentInput) {
  // Re-verify the code server-side rather than trusting a client's cached
  // step-1 lookup - the same "never trust client state for a write" rule
  // applied everywhere else in this app.
  const school = await lookupSchoolByCode(input.schoolCode)

  const firstName = asString(input.firstName).trim()
  const lastName = asString(input.lastName).trim()
  const email = asString(input.email).trim().toLowerCase()
  const password = asString(input.password)

  if (!firstName || !lastName) throw new Error("Name is required.")
  if (!email) throw new Error("Email is required.")
  if (password.length < 8) throw new Error("Password must be at least 8 characters.")
  if (!input.agreeTerms) throw new Error("You must agree to the Terms of Service and Privacy Policy.")

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error("An account with that email already exists.")

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.student.create({
    data: {
      user: { create: { name: `${firstName} ${lastName}`, email, passwordHash, role: Role.student } },
      enrollmentType: "school",
      school: { connect: { id: school.schoolId } },
      // No class picker in this flow - a school admin assigns the class
      // afterwards, same as any other student added directly by a school.
      status: "active",
    },
  })

  if (input.subscribeNewsletter) {
    await subscribeToNewsletterBestEffort(email)
  }

  return { email, password, schoolName: school.name }
}
