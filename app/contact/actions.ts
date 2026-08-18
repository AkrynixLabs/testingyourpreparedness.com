"use server"

import { enforceRateLimit } from "@/lib/rate-limit"
import { subscribeToNewsletter, type SubscribeToNewsletterResult } from "@/lib/newsletter/brevo"
import { createContactMessage, type ContactMessageInput } from "@/lib/support/contact-message"

export type ContactFormInput = ContactMessageInput

export async function submitContactMessage(input: ContactFormInput) {
  await enforceRateLimit("contact")
  await createContactMessage(input)
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
