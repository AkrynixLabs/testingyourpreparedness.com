// Same "extract for reuse, name-derived prefix + random suffix" shape as
// lib/school-code.ts, but a shorter alphanumeric code (not a school-style
// PREFIX-### code) since this is meant to be spoken/typed by a student
// sharing it with a friend, not looked up from a formal registration.

import { prisma } from "@/lib/prisma"

const SUFFIX_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no 0/O/1/I - easy to misread aloud

export async function generateReferralCode(firstName: string): Promise<string> {
  const prefix = (firstName.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 6) || "TYP").padEnd(3, "X")

  for (let i = 0; i < 20; i++) {
    let suffix = ""
    for (let j = 0; j < 4; j++) suffix += SUFFIX_CHARS[Math.floor(Math.random() * SUFFIX_CHARS.length)]
    const candidate = `${prefix}${suffix}`
    const exists = await prisma.student.findUnique({ where: { referralCode: candidate } })
    if (!exists) return candidate
  }
  throw new Error("Could not generate a unique referral code, please try again.")
}
