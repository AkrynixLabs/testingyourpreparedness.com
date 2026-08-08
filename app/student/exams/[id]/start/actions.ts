"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// A student switching tabs a couple of times (checking a notification, alt-
// tabbing briefly) is normal and shouldn't flag anything. This threshold is
// deliberately loose - it's a signal for a reviewer to look closer, not an
// accusation.
const TAB_SWITCH_FLAG_THRESHOLD = 3

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

  const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } })
  if (!attempt || attempt.studentId !== student.id || attempt.submittedAt) return

  const tabSwitchCount = attempt.tabSwitchCount + 1
  await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      tabSwitchCount,
      flaggedForReview: attempt.flaggedForReview || tabSwitchCount >= TAB_SWITCH_FLAG_THRESHOLD,
    },
  })
}

function computeGrade(percentage: number) {
  if (percentage >= 80) return "A"
  if (percentage >= 70) return "B"
  if (percentage >= 60) return "C"
  if (percentage >= 50) return "D"
  return "F"
}

// Grading happens entirely here, server-side, from the assessment's real
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

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: {
        include: { questions: { include: { question: true } } },
      },
    },
  })

  if (!attempt || attempt.studentId !== student.id) {
    throw new Error("Not authorized")
  }
  if (attempt.submittedAt) {
    return { attemptId: attempt.id }
  }

  let score = 0
  let totalMarks = 0
  for (const { question: q } of attempt.assessment.questions) {
    totalMarks += q.marks
    const selectedIndex = answers[q.id]
    if (selectedIndex !== undefined && selectedIndex === q.correctAnswerIndex) {
      score += q.marks
    }
  }
  const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0
  const grade = computeGrade(percentage)
  const timeSpentSeconds = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000)

  await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      answers,
      flaggedQuestionIds,
      submittedAt: new Date(),
      score,
      totalMarks,
      grade,
      timeSpentSeconds,
    },
  })

  revalidatePath("/student/exams")
  revalidatePath("/student/results")

  return { attemptId: attempt.id }
}
