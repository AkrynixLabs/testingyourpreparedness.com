"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function requireSuperAdmin() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") {
    throw new Error("Not authorized")
  }
  return session.user.id
}

export async function setQuestionActive(questionId: string, isActive: boolean) {
  const actorId = await requireSuperAdmin()

  const question = await prisma.question.update({
    where: { id: questionId },
    data: { isActive },
    include: { subject: true },
  })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "update",
      category: "content",
      description: `${isActive ? "Restored" : "Archived"} question in ${question.subject.name}`,
      details: { type: "question", questionId, isActive },
    },
  })

  revalidatePath("/super-admin/question-bank")
}
