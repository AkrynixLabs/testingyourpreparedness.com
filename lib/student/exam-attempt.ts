import { prisma } from "@/lib/prisma"
import type { Student } from "@/lib/generated/prisma/client"
import { checkAndAwardAchievements } from "./achievements"
import { sendPushToStudentBestEffort } from "@/lib/push/fcm"
import { getStudentTier, getFreeTierAttemptsUsedThisMonth, FREE_TIER_MONTHLY_ATTEMPT_LIMIT } from "./entitlement"

// Extracted from app/student/exams/[id]/start/{page,actions}.tsx (unchanged
// logic) so the mobile exam-taking flow (app/api/mobile/exams/[id]/start,
// .../attempts/[attemptId]/submit) calls the exact same eligibility,
// resume, grading, and anti-cheat logic the web app does - same "one
// function, two callers" pattern as lib/student/exams.ts and
// lib/reports/generate.ts. The web page/action were refactored to call
// these too; their behavior is unchanged.

export type EligibilityResult =
  | { eligible: true; assignmentId: string | null }
  | { eligible: false; reason?: "free_tier_limit" }

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

  // Independent student: open access to every published assessment, matches
  // ExamAttempt.assignmentId's own schema comment. What IS gated - for the
  // first time - is submission volume for a free-tier student, per the
  // "student-free" SubscriptionPlan's own long-standing "5 practice
  // tests/month" promise (see lib/student/entitlement.ts).
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { status: true },
  })
  if (!assessment || assessment.status !== "published") return { eligible: false }

  const tier = await getStudentTier(student)
  if (tier === "paid") return { eligible: true, assignmentId: null }

  // Resuming an already-started, not-yet-submitted attempt never consumes a
  // new slot - only a fresh submission counts against the monthly cap.
  const inProgress = await prisma.examAttempt.findFirst({
    where: { studentId: student.id, assessmentId, assignmentId: null, submittedAt: null },
  })
  if (inProgress) return { eligible: true, assignmentId: null }

  const usedThisMonth = await getFreeTierAttemptsUsedThisMonth(student.id)
  if (usedThisMonth >= FREE_TIER_MONTHLY_ATTEMPT_LIMIT) return { eligible: false, reason: "free_tier_limit" }

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
  | { ok: false; reason?: "free_tier_limit" }

// Finds or creates an in-progress attempt (never resets the clock or counts
// as a new attempt against maxAttempts on a page refresh / app relaunch),
// and returns either the exam to render or a signal that the clock already
// ran out server-side before the caller ever asked again.
export async function startOrResumeExam(student: Student, assessmentId: string): Promise<ExamStartResult> {
  const eligibility = await resolveExamEligibility(student, assessmentId)
  if (!eligibility.eligible) {
    // Conversion nudge at the exact moment the free-tier wall actually
    // blocks a real attempt (not on every page view) - same best-effort,
    // exam-related push scope confirmed 2026-08-16 for the other two exam
    // push triggers (assignment/results-ready) in this same file. Not
    // deduplicated across repeat attempts within the same window - a
    // free-tier student retrying after being blocked is a low-frequency,
    // user-initiated action, not worth extra state to suppress.
    if (eligibility.reason === "free_tier_limit") {
      await sendPushToStudentBestEffort(student.id, {
        title: "You've used all your free practice tests this month",
        body: "Upgrade to Premium for unlimited practice tests and full score reports.",
        data: { type: "free_tier_limit_reached" },
      })
    }
    return { ok: false, reason: eligibility.reason }
  }

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

  // Fire-and-forget from the caller's perspective (return value discarded) -
  // newly-earned badges surface next time the student visits Progress/
  // Profile/Leaderboard, not as an immediate toast on submit. Surfacing a
  // "badge unlocked!" moment right at submit time is a natural fast-follow,
  // not built here to avoid touching the web + mobile result UIs in this pass.
  await checkAndAwardAchievements(studentId)

  // Mobile push - "results ready," the other half of the exam-related push
  // scope confirmed with the user 2026-08-16 (see the assignment-notification
  // push for the first half). Grading is synchronous/instant here, so this
  // mostly matters for a student who isn't actively in the app right when
  // they submit; a no-op for anyone with no registered device token.
  await sendPushToStudentBestEffort(studentId, {
    title: "Your results are ready",
    body: `You scored ${Math.round(percentage)}% on ${attempt.assessment.title}.`,
    data: { type: "results_ready", attemptId: attempt.id },
  })

  return { ok: true, attemptId: attempt.id }
}
