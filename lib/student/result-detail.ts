import { prisma } from "@/lib/prisma"
import type { StudentTier } from "./entitlement"

// Extracted from app/student/results/[id]/page.tsx (unchanged logic) so
// app/api/mobile/results/[attemptId] returns the exact same score/grade/
// rank/topic-breakdown/question-review computation the web result page
// does, rather than a second copy.
//
// detailedReportsLocked (added alongside lib/student/entitlement.ts): the
// "student-free" SubscriptionPlan has always advertised "Basic score
// reports" for free vs "Detailed analytics" for paid - rank/percentile/
// class-comparison/topic-breakdown are the "detailed" half, withheld (not
// computed at all, to skip the extra query) for a free-tier student. Score,
// grade, and the student's own question-by-question review stay available
// to both tiers - reviewing your own mistakes is core learning value, not
// "detailed analytics."

function getGrade(percentage: number) {
  if (percentage >= 80) return "A"
  if (percentage >= 70) return "B"
  if (percentage >= 60) return "C"
  if (percentage >= 50) return "D"
  return "F"
}

export type ResultDetail = {
  attemptId: string
  title: string
  subjectName: string
  submittedAt: Date
  percentage: number
  grade: string
  correctAnswers: number
  incorrectAnswers: number
  timeSpentSeconds: number | null
  detailedReportsLocked: boolean
  rank: number | null
  totalStudents: number | null
  percentile: number | null
  classAverage: number | null
  highestScore: number | null
  lowestScore: number | null
  topicBreakdown: { topic: string; correct: number; total: number; percentage: number }[]
  questions: {
    id: string
    text: string
    topic: string
    yourAnswer: string
    correctAnswer: string
    isCorrect: boolean
    explanation: string | null
  }[]
}

// Ownership must be checked by the caller (never trust a route param alone)
// - this returns null for "not found", the caller decides 404 vs. throw.
export async function getResultDetail(attemptId: string, studentId: string, tier: StudentTier): Promise<ResultDetail | null> {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: {
        include: {
          subject: true,
          questions: {
            include: { question: { include: { topic: true } } },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  })

  if (!attempt || attempt.studentId !== studentId || !attempt.submittedAt) {
    return null
  }

  const score = attempt.score ?? 0
  const totalMarks = attempt.totalMarks ?? 0
  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0
  const grade = attempt.grade ?? getGrade(percentage)
  const answers = (attempt.answers ?? {}) as Record<string, number>

  const questionRows = attempt.assessment.questions.map(({ question: q }) => {
    const options = q.options as string[]
    const selectedIndex = answers[q.id]
    const isCorrect = selectedIndex !== undefined && selectedIndex === q.correctAnswerIndex
    return {
      id: q.id,
      text: q.text,
      topic: q.topic.name,
      yourAnswer: selectedIndex !== undefined ? options[selectedIndex] : "No answer",
      correctAnswer: options[q.correctAnswerIndex],
      isCorrect,
      explanation: q.explanation,
    }
  })

  const correctAnswers = questionRows.filter((q) => q.isCorrect).length
  const incorrectAnswers = questionRows.length - correctAnswers

  const detailedReportsLocked = tier === "free"

  let topicBreakdown: ResultDetail["topicBreakdown"] = []
  let rank: number | null = null
  let totalStudents: number | null = null
  let percentile: number | null = null
  let classAverage: number | null = null
  let highestScore: number | null = null
  let lowestScore: number | null = null

  if (!detailedReportsLocked) {
    const topicMap = new Map<string, { correct: number; total: number }>()
    for (const q of questionRows) {
      const entry = topicMap.get(q.topic) ?? { correct: 0, total: 0 }
      entry.total += 1
      if (q.isCorrect) entry.correct += 1
      topicMap.set(q.topic, entry)
    }
    topicBreakdown = Array.from(topicMap.entries()).map(([topic, { correct, total }]) => ({
      topic,
      correct,
      total,
      percentage: total > 0 ? (correct / total) * 100 : 0,
    }))

    const allAttempts = await prisma.examAttempt.findMany({
      where: { assessmentId: attempt.assessmentId, submittedAt: { not: null }, score: { not: null }, totalMarks: { not: null } },
      select: { id: true, score: true, totalMarks: true },
    })
    const ranked = allAttempts
      .map((a) => ({ id: a.id, pct: a.totalMarks! > 0 ? (a.score! / a.totalMarks!) * 100 : 0 }))
      .sort((a, b) => b.pct - a.pct)
    rank = ranked.findIndex((a) => a.id === attempt.id) + 1
    totalStudents = ranked.length
    percentile = totalStudents > 1 ? Math.round(((totalStudents - rank) / (totalStudents - 1)) * 100) : 100
    classAverage = totalStudents > 0 ? Math.round(ranked.reduce((acc, a) => acc + a.pct, 0) / totalStudents) : 0
    highestScore = totalStudents > 0 ? Math.round(ranked[0].pct) : 0
    lowestScore = totalStudents > 0 ? Math.round(ranked[ranked.length - 1].pct) : 0
  }

  return {
    attemptId: attempt.id,
    title: attempt.assessment.title,
    subjectName: attempt.assessment.subject.name,
    submittedAt: attempt.submittedAt,
    percentage,
    grade,
    correctAnswers,
    incorrectAnswers,
    timeSpentSeconds: attempt.timeSpentSeconds,
    detailedReportsLocked,
    rank,
    totalStudents,
    percentile,
    classAverage,
    highestScore,
    lowestScore,
    topicBreakdown,
    questions: questionRows,
  }
}
