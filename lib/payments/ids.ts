import crypto from "node:crypto"
import { prisma } from "@/lib/prisma"

// Payment/Invoice ids are app-assigned strings (see Payment.id / Invoice.id
// comments in schema.prisma: "assigned in the DAL"), not cuid defaults.

export function generatePaymentId(): string {
  return `PAY-${crypto.randomBytes(4).toString("hex").toUpperCase()}`
}

// CoursePurchase gets its own prefix (distinct from Payment's PAY- ids) even
// though it's used the same way as the Paystack reference - keeps the two
// transaction types visually distinguishable in logs/support without
// conflating a one-time course sale with subscription billing.
export function generateCoursePurchaseId(): string {
  return `CP-${crypto.randomBytes(4).toString("hex").toUpperCase()}`
}

// "INV-YYYY-NNN", sequential per year - NNN is a count of invoices already
// issued this year + 1, zero-padded to 3 digits.
export async function generateInvoiceId(year: number): Promise<string> {
  const count = await prisma.invoice.count({
    where: { id: { startsWith: `INV-${year}-` } },
  })
  const sequence = String(count + 1).padStart(3, "0")
  return `INV-${year}-${sequence}`
}
