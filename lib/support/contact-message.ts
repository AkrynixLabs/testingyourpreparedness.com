import { prisma } from "@/lib/prisma"

// Extracted out of app/contact/actions.ts so the mobile Support tab
// (app/api/mobile/support/contact) can create the same real ContactMessage
// row the public web form does, instead of a second copy of this
// validation - "one function, two callers" pattern, same as
// lib/student/courses.ts/dashboard-stats.ts.
export type ContactMessageInput = {
  firstName: string
  lastName: string
  email: string
  role: string
  subject: string
  message: string
}

export async function createContactMessage(input: ContactMessageInput) {
  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()
  const email = input.email.trim().toLowerCase()
  const message = input.message.trim()

  if (!firstName || !lastName) throw new Error("Name is required.")
  if (!email) throw new Error("Email is required.")
  if (!input.role) throw new Error("Please select who you are.")
  if (!input.subject) throw new Error("Please select a subject.")
  if (!message) throw new Error("Message is required.")

  await prisma.contactMessage.create({
    data: { firstName, lastName, email, role: input.role, subject: input.subject, message },
  })
}
