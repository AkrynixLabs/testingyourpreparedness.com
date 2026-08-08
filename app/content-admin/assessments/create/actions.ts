"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { AssessmentStatus } from "@/lib/generated/prisma/client"

export type CreateAssessmentInput = {
  title: string
  subjectId: string
  duration: number
  questionIds: string[]
  status: Extract<AssessmentStatus, "draft" | "pending">
}

export async function createAssessment(input: CreateAssessmentInput) {
  const session = await auth()
  if (session?.user?.role !== "content_admin") {
    throw new Error("Not authorized")
  }

  if (!input.title.trim()) throw new Error("Title is required.")
  if (!input.subjectId) throw new Error("Subject is required.")
  if (!input.duration || input.duration < 5) throw new Error("Duration must be at least 5 minutes.")
  if (input.questionIds.length === 0) throw new Error("At least one question is required.")

  const assessment = await prisma.assessment.create({
    data: {
      title: input.title.trim(),
      subjectId: input.subjectId,
      duration: input.duration,
      status: input.status,
      createdById: session.user.id,
      questions: {
        create: input.questionIds.map((questionId, index) => ({
          questionId,
          order: index,
        })),
      },
    },
  })

  revalidatePath("/content-admin/assessments")
  return { assessmentId: assessment.id }
}
