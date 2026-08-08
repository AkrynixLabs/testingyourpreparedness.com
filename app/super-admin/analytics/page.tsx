import { prisma } from "@/lib/prisma"
import { AnalyticsView } from "./analytics-view"

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
// JS Date#getDay(): 0=Sun..6=Sat - remap to a Mon-first week to match DAY_LABELS.
function toMondayFirst(jsDay: number) {
  return (jsDay + 6) % 7
}

export default async function AnalyticsPage() {
  const [
    totalStudents,
    activeSchools,
    questionsInBank,
    examsCompleted,
    schools,
    students,
    questions,
    subjects,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.school.count({ where: { status: "active" } }),
    prisma.question.count({ where: { status: "approved", isActive: true } }),
    prisma.examAttempt.count({ where: { submittedAt: { not: null } } }),
    prisma.school.findMany({ include: { students: { include: { examAttempts: true } } } }),
    prisma.student.findMany({ include: { examAttempts: true } }),
    prisma.question.findMany({ select: { id: true, subjectId: true, correctAnswerIndex: true } }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ])

  const questionMap = new Map(questions.map((q) => [q.id, q]))
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]))

  // Top performing schools (real avg score from ExamAttempt), same computation as leaderboard.
  const topSchools = schools
    .map((school) => {
      const attempts = school.students.flatMap((s) => s.examAttempts).filter((a) => a.submittedAt !== null)
      const scored = attempts.filter((a) => a.score !== null && a.totalMarks)
      const avgScore =
        scored.length > 0
          ? scored.reduce((sum, a) => sum + (a.score! / a.totalMarks!) * 100, 0) / scored.length
          : null
      return { name: school.name, region: school.region, students: school.students.length, avgScore }
    })
    .filter((s) => s.avgScore !== null)
    .sort((a, b) => b.avgScore! - a.avgScore!)
    .slice(0, 5)

  // Regional distribution: real % of schools per region.
  const regionCounts = new Map<string, number>()
  for (const s of schools) {
    regionCounts.set(s.region, (regionCounts.get(s.region) ?? 0) + 1)
  }
  const regionDistribution = Array.from(regionCounts.entries())
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / schools.length) * 100) }))
    .sort((a, b) => b.count - a.count)

  // Subject performance: derived per-question, same approach as leaderboard.
  const subjectAgg = new Map<string, { correct: number; total: number }>()
  for (const student of students) {
    for (const attempt of student.examAttempts) {
      if (!attempt.submittedAt) continue
      const answers = attempt.answers as Record<string, number>
      for (const [questionId, selected] of Object.entries(answers)) {
        const q = questionMap.get(questionId)
        if (!q) continue
        const agg = subjectAgg.get(q.subjectId) ?? { correct: 0, total: 0 }
        agg.total += 1
        if (selected === q.correctAnswerIndex) agg.correct += 1
        subjectAgg.set(q.subjectId, agg)
      }
    }
  }
  const subjectPerformance = Array.from(subjectAgg.entries())
    .map(([subjectId, agg]) => ({
      subject: subjectMap.get(subjectId) ?? "Unknown",
      avgScore: Math.round((agg.correct / agg.total) * 100),
    }))
    .sort((a, b) => b.avgScore - a.avgScore)

  // Weekly activity pattern: real, from ExamAttempt.startedAt day-of-week (not simulated).
  const dayCounts = new Array(7).fill(0)
  for (const student of students) {
    for (const attempt of student.examAttempts) {
      dayCounts[toMondayFirst(attempt.startedAt.getDay())] += 1
    }
  }
  const maxDayCount = Math.max(1, ...dayCounts)
  const weeklyActivity = DAY_LABELS.map((day, i) => ({ day, count: dayCounts[i], intensity: dayCounts[i] / maxDayCount }))

  return (
    <AnalyticsView
      stats={{ totalStudents, activeSchools, questionsInBank, examsCompleted }}
      topSchools={topSchools}
      regionDistribution={regionDistribution}
      subjectPerformance={subjectPerformance}
      weeklyActivity={weeklyActivity}
    />
  )
}
