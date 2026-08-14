"use server"

import { prisma } from "@/lib/prisma"
import { enforceRateLimit } from "@/lib/rate-limit"
import { subscribeToNewsletter, type SubscribeToNewsletterResult } from "@/lib/newsletter/brevo"

export type ContactFormInput = {
  firstName: string
  lastName: string
  email: string
  role: string
  subject: string
  message: string
}

export async function submitContactMessage(input: ContactFormInput) {
  await enforceRateLimit("contact")

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

export type NewsletterSubscribeInput = { email: string }

export async function subscribeNewsletter(input: NewsletterSubscribeInput): Promise<SubscribeToNewsletterResult> {
  await enforceRateLimit("newsletter")

  const email = input.email.trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Please enter a valid email address.")
  }

  return subscribeToNewsletter(email)
}
