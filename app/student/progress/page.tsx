import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { StudentProgressView } from "./progress-view"

export default async function StudentProgressPage() {
  const session = await auth()
  const student = await prisma.student.findUnique({ where: { userId: session!.user.id } })

  if (!student) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Progress</h1>
        <p className="text-muted-foreground">No learner profile found for this account.</p>
      </div>
    )
  }

  const [attempts, studyGoals, achievements, earned] = await Promise.all([
    prisma.examAttempt.findMany({
      where: { studentId: student.id, submittedAt: { not: null } },
      include: { assessment: { include: { subject: true } } },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.studyGoal.findMany({ where: { studentId: student.id }, orderBy: { dueDate: "asc" } }),
    prisma.achievement.findMany({ orderBy: { name: "asc" } }),
    prisma.studentAchievement.findMany({ where: { studentId: student.id } }),
  ])

  const totalExams = attempts.length
  const percentages = attempts.map((a) => ((a.score ?? 0) / (a.totalMarks || 1)) * 100)
  const overallProgress = totalExams > 0 ? Math.round(percentages.reduce((s, p) => s + p, 0) / totalExams) : null

  // Improvement: average of the most recent 3 attempts vs. average of the
  // earliest 3 - a real, derived trend, not a fabricated "+18%" like the demo.
  let improvement: number | null = null
  if (totalExams >= 2) {
    const early = percentages.slice(0, Math.min(3, totalExams))
    const recent = percentages.slice(-Math.min(3, totalExams))
    const earlyAvg = early.reduce((s, p) => s + p, 0) / early.length
    const recentAvg = recent.reduce((s, p) => s + p, 0) / recent.length
    improvement = Math.round(recentAvg - earlyAvg)
  }

  const attemptDays = Array.from(new Set(attempts.map((a) => a.submittedAt!.toISOString().slice(0, 10)))).sort(
    (a, b) => (a < b ? 1 : -1)
  )
  let currentStreak = 0
  if (attemptDays.length > 0) {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const diffFromToday = Math.round((today.getTime() - new Date(attemptDays[0]).getTime()) / (24 * 60 * 60 * 1000))
    if (diffFromToday <= 1) {
      currentStreak = 1
      for (let i = 1; i < attemptDays.length; i++) {
        const diff = Math.round(
          (new Date(attemptDays[i - 1]).getTime() - new Date(attemptDays[i]).getTime()) / (24 * 60 * 60 * 1000)
        )
        if (diff === 1) currentStreak++
        else break
      }
    }
  }

  // Weekly performance: average % per ISO week, oldest to newest, capped to
  // the most recent 8 weeks with data - real weeks, not fixed "W1..W8" labels.
  const weekly = new Map<string, { total: number; count: number; label: string }>()
  for (const a of attempts) {
    const date = a.submittedAt!
    const key = isoWeekKey(date)
    const pct = ((a.score ?? 0) / (a.totalMarks || 1)) * 100
    if (!weekly.has(key)) weekly.set(key, { total: 0, count: 0, label: key })
    const entry = weekly.get(key)!
    entry.total += pct
    entry.count++
  }
  const weeklyProgress = Array.from(weekly.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-8)
    .map(([, { total, count, label }]) => ({ week: label, score: Math.round(total / count) }))

  // Subject progress: initial = first attempt's %, current = average of all
  // attempts in that subject - both real, no fabricated "target".
  const bySubject = new Map<string, { first: number; scores: number[] }>()
  for (const a of attempts) {
    const name = a.assessment.subject.name
    const pct = ((a.score ?? 0) / (a.totalMarks || 1)) * 100
    if (!bySubject.has(name)) bySubject.set(name, { first: pct, scores: [] })
    bySubject.get(name)!.scores.push(pct)
  }
  const subjectProgress = Array.from(bySubject.entries()).map(([subject, { first, scores }]) => ({
    subject,
    initial: Math.round(first),
    current: Math.round(scores.reduce((s, p) => s + p, 0) / scores.length),
    exams: scores.length,
  }))

  const earnedIds = new Set(earned.map((e) => e.achievementId))
  const earnedDates = new Map(earned.map((e) => [e.achievementId, e.earnedAt]))
  const achievementRows = achievements.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    criteria: a.criteria,
    earned: earnedIds.has(a.id),
    earnedAt: earnedDates.get(a.id)?.toISOString() ?? null,
  }))

  return (
    <StudentProgressView
      stats={{ overallProgress, improvement, currentStreak, examsCompleted: totalExams }}
      weeklyProgress={weeklyProgress}
      subjectProgress={subjectProgress}
      studyGoals={studyGoals.map((g) => ({
        id: g.id,
        goal: g.goal,
        unit: g.unit,
        progress: g.progress,
        total: g.total,
        dueDate: g.dueDate?.toISOString() ?? null,
      }))}
      achievements={achievementRows}
    />
  )
}

function isoWeekKey(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`
}
