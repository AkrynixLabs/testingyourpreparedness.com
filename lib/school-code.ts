// Extracted from app/signup/school/actions.ts (unchanged logic) 2026-08-16
// so app/super-admin/schools/add/actions.ts can generate a code the exact
// same way - a name-derived prefix + a random 3-digit suffix - rather than
// a second, possibly-inconsistent implementation.

import { prisma } from "@/lib/prisma"

export async function generateSchoolCode(schoolName: string): Promise<string> {
  const prefix =
    schoolName
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 4) || "SCH"

  for (let i = 0; i < 20; i++) {
    const candidate = `${prefix}-${String(Math.floor(Math.random() * 900) + 100)}`
    const exists = await prisma.school.findUnique({ where: { code: candidate } })
    if (!exists) return candidate
  }
  throw new Error("Could not generate a unique school code, please try again.")
}
