"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { Difficulty, QuestionStatus, Prisma } from "@/lib/generated/prisma/client"

export type CreateQuestionInput = {
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

export async function createQuestion(input: CreateQuestionInput) {
  const session = await auth()
  if (session?.user?.role !== "content_admin") {
    throw new Error("Not authorized")
  }

  if (!input.text.trim()) throw new Error("Question text is required.")
  if (input.options.length < 2) throw new Error("At least 2 options are required.")
  if (input.options.some((o) => !o.trim())) throw new Error("All options must have text.")
  if (!input.subjectId) throw new Error("Subject is required.")
  if (!input.topicId) throw new Error("Topic is required.")

  const question = await prisma.question.create({
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
      createdById: session.user.id,
    },
  })

  return { questionId: question.id }
}
