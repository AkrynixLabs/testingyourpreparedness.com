"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { recordTabSwitchForAttempt, submitExamAttempt } from "@/lib/student/exam-attempt"

// Anti-cheat: logs a tab-switch/focus-loss event during an in-progress
// attempt. Never blocks or interrupts the exam - purely a record for later
// review (see CLAUDE.md's "just log it" decision). Silently no-ops on an
// already-submitted or not-owned attempt rather than throwing, since this
// fires from a background visibilitychange listener the student never
// directly triggers - a thrown error here has nowhere useful to surface.
export async function recordTabSwitch(attemptId: string) {
  const session = await auth()
  if (!session?.user) return

  const student = await prisma.student.findUnique({ where: { userId: session.user.id } })
  if (!student) return

  await recordTabSwitchForAttempt(attemptId, student.id)
}

// Grading happens entirely server-side, from the assessment's real
// Question.correctAnswerIndex - the client only ever receives question text
// and options, never the correct answer. Idempotent: submitting an already-
// submitted attempt just returns the existing result instead of re-grading.
export async function submitExam(
  attemptId: string,
  answers: Record<string, number>,
  flaggedQuestionIds: string[]
) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authorized")

  const student = await prisma.student.findUnique({ where: { userId: session.user.id } })
  if (!student) throw new Error("Not authorized")

  const result = await submitExamAttempt(attemptId, student.id, answers, flaggedQuestionIds)
  if (!result.ok) throw new Error("Not authorized")

  revalidatePath("/student/exams")
  revalidatePath("/student/results")

  return { attemptId: result.attemptId }
}
