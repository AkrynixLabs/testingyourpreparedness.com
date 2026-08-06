"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function deleteQuestion(questionId: string) {
  const session = await auth()
  if (session?.user?.role !== "content_admin") {
    throw new Error("Not authorized")
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { _count: { select: { assessmentQuestions: true } } },
  })

  if (!question || question.createdById !== session.user.id) {
    throw new Error("Not authorized")
  }
  if (question.status !== "draft") {
    throw new Error("Only draft questions can be deleted — submitted/approved questions must go through review, not deletion.")
  }
  if (question._count.assessmentQuestions > 0) {
    throw new Error("Cannot delete a question that's already used in an assessment.")
  }

  await prisma.question.delete({ where: { id: questionId } })
  revalidatePath("/content-admin/questions")
}
