"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { SchoolStatus } from "@/lib/generated/prisma/client"

async function requireSuperAdmin() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") {
    throw new Error("Not authorized")
  }
}

export async function setSchoolStatus(schoolId: string, status: SchoolStatus) {
  await requireSuperAdmin()

  await prisma.school.update({
    where: { id: schoolId },
    data: { status },
  })

  revalidatePath("/super-admin/schools")
}
