"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { Difficulty, QuestionStatus, Prisma } from "@/lib/generated/prisma/client"

export type UpdateQuestionInput = {
  text: string
  options: string[]
  correctAnswerIndex: number
  explanation: string
  subjectId: string
  topicId: string
  difficulty: Difficulty
  marks: number
  year: number | null
  status: Extract<QuestionStatus, "draft" | "pending">
}

export async function updateQuestion(questionId: string, input: UpdateQuestionInput) {
  const session = await auth()
  if (session?.user?.role !== "content_admin") {
    throw new Error("Not authorized")
  }

  // Same scoping as deleteQuestion (app/content-admin/questions/actions.ts) -
  // never trust the UI hiding the edit link, re-check ownership and status
  // server-side every time.
  const existing = await prisma.question.findUnique({ where: { id: questionId } })
  if (!existing || existing.createdById !== session.user.id) {
    throw new Error("Not authorized")
  }
  if (existing.status !== "draft" && existing.status !== "rejected") {
    throw new Error("Only draft or rejected questions can be edited.")
  }

  if (!input.text.trim()) throw new Error("Question text is required.")
  if (input.options.length < 2) throw new Error("At least 2 options are required.")
  if (input.options.some((o) => !o.trim())) throw new Error("All options must have text.")
  if (!input.subjectId) throw new Error("Subject is required.")
  if (!input.topicId) throw new Error("Topic is required.")

  await prisma.question.update({
    where: { id: questionId },
    data: {
      text: input.text.trim(),
      options: input.options as unknown as Prisma.InputJsonValue,
      correctAnswerIndex: input.correctAnswerIndex,
      explanation: input.explanation.trim() || null,
      subjectId: input.subjectId,
      topicId: input.topicId,
      difficulty: input.difficulty,
      marks: input.marks,
      year: input.year,
      status: input.status,
      // A resubmission (or a re-save as draft) is a fresh start - the old
      // rejection reason/reviewer no longer describes the current content,
      // so it's cleared rather than left stale for the next review cycle.
      rejectionReason: null,
      reviewedById: null,
    },
  })

  revalidatePath("/content-admin/questions")
  revalidatePath("/content-admin/questions/pending")
}
