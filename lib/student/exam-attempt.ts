import { prisma } from "@/lib/prisma"
import type { Student } from "@/lib/generated/prisma/client"

// Extracted from app/student/exams/[id]/start/{page,actions}.tsx (unchanged
// logic) so the mobile exam-taking flow (app/api/mobile/exams/[id]/start,
// .../attempts/[attemptId]/submit) calls the exact same eligibility,
// resume, grading, and anti-cheat logic the web app does - same "one
// function, two callers" pattern as lib/student/exams.ts and
// lib/reports/generate.ts. The web page/action were refactored to call
// these too; their behavior is unchanged.

export type EligibilityResult = { eligible: true; assignmentId: string | null } | { eligible: false }

// Re-verified independent of what the exams list already filtered to - a
// student navigating (or a mobile client calling) directly must not be able
// to start an exam they aren't actually eligible for.
export async function resolveExamEligibility(student: Student, assessmentId: string): Promise<EligibilityResult> {
  if (student.enrollmentType === "school" && student.schoolId) {
    const assignment = await prisma.assessmentAssignment.findFirst({
      where: {
        assessmentId,
        schoolId: student.schoolId,
        status: "active",
        OR: [
          { students: { some: { studentId: student.id } } },
          ...(student.classId ? [{ classes: { some: { classId: student.classId } } }] : []),
        ],
      },
      include: {
        examAttempts: { where: { studentId: student.id, submittedAt: { not: null } } },
      },
    })
    if (!assignment) return { eligible: false }

    const now = new Date()
    const withinWindow = now >= assignment.startDate && now <= assignment.endDate
    const attemptsUsed = assignment.examAttempts.length
    const canAttempt = assignment.allowRetake
      ? assignment.maxAttempts === null || attemptsUsed < assignment.maxAttempts
      : attemptsUsed === 0

    if (!withinWindow || !canAttempt) return { eligible: false }
    return { eligible: true, assignmentId: assignment.id }
  }

  // Independent student: open access, matches ExamAttempt.assignmentId's
  // own schema comment.
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { status: true },
  })
  if (!assessment || assessment.status !== "published") return { eligible: false }
  return { eligible: true, assignmentId: null }
}

export type ExamStartResult =
  | {
      ok: true
      attemptId: string
      title: string
      subjectName: string
      questions: { id: string; text: string; options: string[] }[]
      remainingSeconds: number
      timedOut: false
    }
  | { ok: true; timedOut: true; attemptId: string }
  | { ok: false }

// Finds or creates an in-progress attempt (never resets the clock or counts
// as a new attempt against maxAttempts on a page refresh / app relaunch),
// and returns either the exam to render or a signal that the clock already
// ran out server-side before the caller ever asked again.
export async function startOrResumeExam(student: Student, assessmentId: string): Promise<ExamStartResult> {
  const eligibility = await resolveExamEligibility(student, assessmentId)
  if (!eligibility.eligible) return { ok: false }

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      subject: true,
      questions: { include: { question: true }, orderBy: { order: "asc" } },
    },
  })
  if (!assessment) return { ok: false }

  let attempt = await prisma.examAttempt.findFirst({
    where: {
      studentId: student.id,
      assessmentId,
      assignmentId: eligibility.assignmentId,
      submittedAt: null,
    },
  })
  if (!attempt) {
    attempt = await prisma.examAttempt.create({
      data: {
        studentId: student.id,
        assessmentId,
        assignmentId: eligibility.assignmentId,
        answers: {},
        flaggedQuestionIds: [],
        startedAt: new Date(),
      },
    })
  }

  const elapsedSeconds = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000)
  const totalSeconds = assessment.duration * 60
  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds)

  if (remainingSeconds <= 0) {
    return { ok: true, timedOut: true, attemptId: attempt.id }
  }

  const questions = assessment.questions.map(({ question: q }) => ({
    id: q.id,
    text: q.text,
    options: q.options as string[],
  }))

  return {
    ok: true,
    timedOut: false,
    attemptId: attempt.id,
    title: assessment.title,
    subjectName: assessment.subject.name,
    questions,
    remainingSeconds,
  }
}

const TAB_SWITCH_FLAG_THRESHOLD = 3

// Anti-cheat: logs a tab-switch/focus-loss event during an in-progress
// attempt. Never blocks or interrupts the exam - purely a record for later
// review (see CLAUDE.md's "just log it" decision). Silently no-ops on an
// already-submitted or not-owned attempt rather than throwing.
export async function recordTabSwitchForAttempt(attemptId: string, studentId: string): Promise<void> {
  const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } })
  if (!attempt || attempt.studentId !== studentId || attempt.submittedAt) return

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
// Question.correctAnswerIndex - callers only ever pass question text/options
// to the client, never the correct answer. Idempotent: submitting an
// already-submitted attempt just returns the existing result instead of
// re-grading.
export async function submitExamAttempt(
  attemptId: string,
  studentId: string,
  answers: Record<string, number>,
  flaggedQuestionIds: string[]
): Promise<{ ok: true; attemptId: string } | { ok: false }> {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: { include: { questions: { include: { question: true } } } },
    },
  })

  if (!attempt || attempt.studentId !== studentId) {
    return { ok: false }
  }
  if (attempt.submittedAt) {
    return { ok: true, attemptId: attempt.id }
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

  return { ok: true, attemptId: attempt.id }
}
