import { prisma } from "@/lib/prisma"
import type { Student } from "@/lib/generated/prisma/client"

// Extracted from app/student/page.tsx (unchanged logic) so
// app/api/mobile/dashboard returns the exact same stats/trend/subject-
// strength/recent-results computation the web dashboard does - same "one
// function, two callers" pattern as the other lib/student/* modules.
// Deliberately does NOT include the web dashboard's "upcoming exams"
// preview - GET /api/mobile/exams already covers that (available/scheduled
// lists), so mobile doesn't need a second, narrower copy of the same data.

async function getRanks(
  entries: { assessmentId: string; attemptId: string }[]
): Promise<Map<string, { rank: number; totalStudents: number }>> {
  const assessmentIds = Array.from(new Set(entries.map((e) => e.assessmentId)))
  const allAttempts = await prisma.examAttempt.findMany({
    where: { assessmentId: { in: assessmentIds }, submittedAt: { not: null }, score: { not: null }, totalMarks: { not: null } },
    select: { id: true, assessmentId: true, score: true, totalMarks: true },
  })

  const byAssessment = new Map<string, { id: string; pct: number }[]>()
  for (const a of allAttempts) {
    const pct = a.totalMarks! > 0 ? (a.score! / a.totalMarks!) * 100 : 0
    const group = byAssessment.get(a.assessmentId) ?? []
    group.push({ id: a.id, pct })
    byAssessment.set(a.assessmentId, group)
  }
  for (const group of byAssessment.values()) {
    group.sort((a, b) => b.pct - a.pct)
  }

  const result = new Map<string, { rank: number; totalStudents: number }>()
  for (const { assessmentId, attemptId } of entries) {
    const ranked = byAssessment.get(assessmentId) ?? []
    result.set(attemptId, { rank: ranked.findIndex((a) => a.id === attemptId) + 1, totalStudents: ranked.length })
  }
  return result
}

export type StudentDashboard = {
  stats: {
    examsCompleted: number
    averageScore: number | null
    classRank: { rank: number; totalStudents: number } | null
    studyHours: number
    currentStreak: number
  }
  performanceTrend: { month: string; score: number }[]
  subjectStrengths: { subject: string; score: number }[]
  recentResults: {
    attemptId: string
    title: string
    submittedAt: string
    score: number
    totalMarks: number
    rank: number
    totalStudents: number
  }[]
}

export async function getStudentDashboard(student: Student): Promise<StudentDashboard> {
  const attempts = await prisma.examAttempt.findMany({
    where: { studentId: student.id, submittedAt: { not: null } },
    include: { assessment: { include: { subject: true } } },
    orderBy: { submittedAt: "desc" },
  })

  const totalExams = attempts.length
  const percentages = attempts.map((a) => ((a.score ?? 0) / (a.totalMarks || 1)) * 100)
  const averageScore = totalExams > 0 ? Math.round(percentages.reduce((s, p) => s + p, 0) / totalExams) : null
  const totalTimeSpentSeconds = attempts.reduce((sum, a) => sum + (a.timeSpentSeconds ?? 0), 0)

  // Current streak: consecutive calendar days (ending today/yesterday) with
  // at least one submitted attempt - same computation as school-admin/leaderboard.
  const attemptDays = Array.from(new Set(attempts.map((a) => a.submittedAt!.toISOString().slice(0, 10)))).sort(
    (a, b) => (a < b ? 1 : -1)
  )
  let currentStreak = 0
  if (attemptDays.length > 0) {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const mostRecent = new Date(attemptDays[0])
    const diffFromToday = Math.round((today.getTime() - mostRecent.getTime()) / (24 * 60 * 60 * 1000))
    if (diffFromToday <= 1) {
      currentStreak = 1
      for (let i = 1; i < attemptDays.length; i++) {
        const prev = new Date(attemptDays[i - 1])
        const cur = new Date(attemptDays[i])
        const diff = Math.round((prev.getTime() - cur.getTime()) / (24 * 60 * 60 * 1000))
        if (diff === 1) currentStreak++
        else break
      }
    }
  }

  // Class rank only applies to school-provisioned students with a class -
  // independent students have no classmates to rank against.
  let classRank: { rank: number; totalStudents: number } | null = null
  if (student.classId) {
    const classmates = await prisma.student.findMany({
      where: { classId: student.classId },
      select: {
        id: true,
        examAttempts: {
          where: { submittedAt: { not: null }, score: { not: null }, totalMarks: { not: null } },
          select: { score: true, totalMarks: true },
        },
      },
    })
    const ranked = classmates
      .map((s) => {
        const scored = s.examAttempts
        const avg = scored.length > 0 ? scored.reduce((sum, a) => sum + (a.score! / a.totalMarks!) * 100, 0) / scored.length : null
        return { id: s.id, avg }
      })
      .filter((s): s is { id: string; avg: number } => s.avg !== null)
      .sort((a, b) => b.avg - a.avg)
    const idx = ranked.findIndex((s) => s.id === student.id)
    if (idx !== -1) classRank = { rank: idx + 1, totalStudents: ranked.length }
  }

  // Performance trend: average score per calendar month, oldest to newest,
  // over whichever months this student actually has submitted attempts in.
  const monthly = new Map<string, { total: number; count: number }>()
  for (const a of attempts) {
    const key = a.submittedAt!.toISOString().slice(0, 7) // YYYY-MM
    const pct = ((a.score ?? 0) / (a.totalMarks || 1)) * 100
    if (!monthly.has(key)) monthly.set(key, { total: 0, count: 0 })
    const entry = monthly.get(key)!
    entry.total += pct
    entry.count++
  }
  const performanceTrend = Array.from(monthly.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-6)
    .map(([key, { total, count }]) => ({
      month: new Date(`${key}-01`).toLocaleDateString("en-US", { month: "short" }),
      score: Math.round(total / count),
    }))

  // Subject strengths: average score per subject across all this student's attempts.
  const bySubject = new Map<string, { total: number; count: number }>()
  for (const a of attempts) {
    const name = a.assessment.subject.name
    const pct = ((a.score ?? 0) / (a.totalMarks || 1)) * 100
    if (!bySubject.has(name)) bySubject.set(name, { total: 0, count: 0 })
    const entry = bySubject.get(name)!
    entry.total += pct
    entry.count++
  }
  const subjectStrengths = Array.from(bySubject.entries())
    .map(([subject, { total, count }]) => ({ subject, score: Math.round(total / count) }))
    .sort((a, b) => b.score - a.score)

  const recentAttempts = attempts.slice(0, 3)
  const recentRanks = await getRanks(recentAttempts.map((a) => ({ assessmentId: a.assessmentId, attemptId: a.id })))
  const recentResults = recentAttempts.map((attempt) => {
    const { rank, totalStudents } = recentRanks.get(attempt.id) ?? { rank: 0, totalStudents: 0 }
    return {
      attemptId: attempt.id,
      title: attempt.assessment.title,
      submittedAt: attempt.submittedAt!.toISOString(),
      score: attempt.score ?? 0,
      totalMarks: attempt.totalMarks ?? 0,
      rank,
      totalStudents,
    }
  })

  return {
    stats: {
      examsCompleted: totalExams,
      averageScore,
      classRank,
      studyHours: Math.round((totalTimeSpentSeconds / 3600) * 10) / 10,
      currentStreak,
    },
    performanceTrend,
    subjectStrengths,
    recentResults,
  }
}
