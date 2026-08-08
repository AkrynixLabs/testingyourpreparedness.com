"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function toggleBookmark(materialId: string) {
  const session = await auth()
  const student = await prisma.student.findUnique({ where: { userId: session!.user.id } })
  if (!student) throw new Error("Not authorized")

  const existing = await prisma.studentMaterialBookmark.findUnique({
    where: { studentId_materialId: { studentId: student.id, materialId } },
  })

  if (existing) {
    await prisma.studentMaterialBookmark.delete({
      where: { studentId_materialId: { studentId: student.id, materialId } },
    })
  } else {
    await prisma.studentMaterialBookmark.create({ data: { studentId: student.id, materialId } })
  }

  revalidatePath("/student/materials")
}
