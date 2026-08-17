"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { SchoolStatus } from "@/lib/generated/prisma/client"
import { sendEmailBestEffort } from "@/lib/email/resend"
import { schoolStatusChangedEmail } from "@/lib/email/templates"

async function requireSuperAdmin() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") {
    throw new Error("Not authorized")
  }
}

export async function setSchoolStatus(schoolId: string, status: SchoolStatus) {
  await requireSuperAdmin()

  const school = await prisma.school.update({
    where: { id: schoolId },
    data: { status },
  })

  // "pending" (initial verification state) is deliberately not emailed here -
  // only the two states an admin actually toggles between after that.
  if (status === "active" || status === "suspended") {
    const { subject, html } = schoolStatusChangedEmail({ schoolName: school.name, status })
    await sendEmailBestEffort({ to: school.email, subject, html })
  }

  revalidatePath("/super-admin/schools")
}
