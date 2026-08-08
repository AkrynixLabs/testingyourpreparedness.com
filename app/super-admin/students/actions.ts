"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { StudentStatus } from "@/lib/generated/prisma/client"

async function requireSuperAdmin() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") {
    throw new Error("Not authorized")
  }
  return session.user.id
}

export async function setStudentStatus(studentId: string, status: StudentStatus) {
  const actorId = await requireSuperAdmin()

  const student = await prisma.student.update({
    where: { id: studentId },
    data: { status },
    include: { user: true },
  })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "update",
      category: "user",
      description: `Set student ${student.user.name} to ${status}`,
      details: { type: "student", studentId, status },
    },
  })

  revalidatePath("/super-admin/students")
}
