"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/lib/generated/prisma/client"
import { validateRow, type ParsedRow, type SubjectWithTopics } from "./validation"

export type BulkUploadResult = {
  created: number
  skipped: number
  errors: { row: number; issues: string[] }[]
}

export async function bulkCreateQuestions(
  rows: { row: number; parsed: ParsedRow }[],
  defaultSubjectId: string | null
): Promise<BulkUploadResult> {
  const session = await auth()
  if (session?.user?.role !== "content_admin") {
    throw new Error("Not authorized")
  }

  const subjects = await prisma.subject.findMany({
    include: { topics: true },
  })
  const subjectsForValidation: SubjectWithTopics[] = subjects.map((s) => ({
    id: s.id,
    name: s.name,
    topics: s.topics.map((t) => ({ id: t.id, name: t.name })),
  }))

  const errors: { row: number; issues: string[] }[] = []
  let created = 0

  for (const { row, parsed } of rows) {
    const validated = validateRow(row, parsed, subjectsForValidation, defaultSubjectId)

    if (validated.status === "error" || !validated.resolvedSubjectId || validated.correctAnswerIndex === null) {
      errors.push({ row, issues: validated.issues })
      continue
    }

    let topicId = validated.resolvedTopicId
    if (!topicId && validated.resolvedTopicName) {
      const topic = await prisma.topic.upsert({
        where: {
          subjectId_name: { subjectId: validated.resolvedSubjectId, name: validated.resolvedTopicName },
        },
        create: { subjectId: validated.resolvedSubjectId, name: validated.resolvedTopicName },
        update: {},
      })
      topicId = topic.id
    }

    if (!topicId) {
      errors.push({ row, issues: ["Could not resolve a topic for this row."] })
      continue
    }

    await prisma.question.create({
      data: {
        text: parsed.question.trim(),
        options: [parsed.option_a, parsed.option_b, parsed.option_c, parsed.option_d].map((o) =>
          o.trim()
        ) as unknown as Prisma.InputJsonValue,
        correctAnswerIndex: validated.correctAnswerIndex,
        explanation: parsed.explanation.trim() || null,
        subjectId: validated.resolvedSubjectId,
        topicId,
        difficulty: validated.difficulty,
        marks: 1,
        year: null,
        status: "pending",
        createdById: session.user.id,
      },
    })
    created++
  }

  revalidatePath("/content-admin/questions")
  return { created, skipped: errors.length, errors }
}
