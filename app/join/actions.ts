"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { Role } from "@/lib/generated/prisma/client"

export type VerifiedSchool = { schoolId: string; name: string; town: string; region: string }

export async function verifySchoolCode(code: string): Promise<VerifiedSchool> {
  const normalized = code.trim().toUpperCase()
  if (!normalized) throw new Error("Enter an invite code.")

  const school = await prisma.school.findUnique({ where: { code: normalized } })
  if (!school) {
    throw new Error("Invalid invite code. Please check with your school administrator.")
  }

  return { schoolId: school.id, name: school.name, town: school.town, region: school.region }
}

export type RegisterJoinedStudentInput = {
  schoolCode: string
  firstName: string
  lastName: string
  email: string
  password: string
}

export async function registerJoinedStudent(input: RegisterJoinedStudentInput) {
  // Re-verify the code server-side rather than trusting the client's cached
  // step-1 lookup - the same "never trust client state for a write" rule
  // applied everywhere else in this app.
  const school = await verifySchoolCode(input.schoolCode)

  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()
  const email = input.email.trim().toLowerCase()

  if (!firstName || !lastName) throw new Error("Name is required.")
  if (!email) throw new Error("Email is required.")
  if (input.password.length < 8) throw new Error("Password must be at least 8 characters.")

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error("An account with that email already exists.")

  const passwordHash = await bcrypt.hash(input.password, 10)

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

  return { email, password: input.password, schoolName: school.name }
}
