"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function requireSuperAdmin() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") {
    throw new Error("Not authorized")
  }
}

export async function markMessageRead(id: string) {
  await requireSuperAdmin()

  await prisma.contactMessage.update({
    where: { id },
    data: { status: "read" },
  })

  revalidatePath("/super-admin/messages")
}
