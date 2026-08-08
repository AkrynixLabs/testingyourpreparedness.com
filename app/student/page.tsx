import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { StudentDashboardView } from "./student-dashboard-view"

async function getRank(assessmentId: string, attemptId: string) {
  const allAttempts = await prisma.examAttempt.findMany({
    where: { assessmentId, submittedAt: { not: null }, score: { not: null }, totalMarks: { not: null } },
    select: { id: true, score: true, totalMarks: true },
  })
  const ranked = allAttempts
    .map((a) => ({ id: a.id, pct: a.totalMarks! > 0 ? (a.score! / a.totalMarks!) * 100 : 0 }))
    .sort((a, b) => b.pct - a.pct)
  return { rank: ranked.findIndex((a) => a.id === attemptId) + 1, totalStudents: ranked.length }
}

export default async function StudentDashboard() {
  const session = await auth()
  const student = await prisma.student.findUnique({
    where: { userId: session!.user.id },
    include: { user: true, class: true },
  })

  if (!student) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">No student profile found for this account.</p>
      </div>
    )
  }

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

  // Upcoming exams (trimmed to a handful for the dashboard) - same eligibility
  // logic as student/exams's own page, duplicated rather than shared since
  // this only needs a capped preview, not the full available/scheduled split.
  const now = new Date()
  const upcoming: {
    id: string
    title: string
    subjectName: string
    duration: number
    when: string
    isAvailable: boolean
  }[] = []

  if (student.enrollmentType === "school" && student.schoolId) {
    const assignments = await prisma.assessmentAssignment.findMany({
      where: {
        schoolId: student.schoolId,
        OR: [
          { students: { some: { studentId: student.id } } },
          ...(student.classId ? [{ classes: { some: { classId: student.classId } } }] : []),
        ],
        status: { in: ["scheduled", "active"] },
      },
      include: {
        assessment: { include: { subject: true } },
        examAttempts: { where: { studentId: student.id, submittedAt: { not: null } } },
      },
      orderBy: { startDate: "asc" },
      take: 5,
    })
    for (const assignment of assignments) {
      const withinWindow = now >= assignment.startDate && now <= assignment.endDate
      const attemptsUsed = assignment.examAttempts.length
      const canAttempt = assignment.allowRetake ? assignment.maxAttempts === null || attemptsUsed < assignment.maxAttempts : attemptsUsed === 0
      if (assignment.status === "active" && !(withinWindow && canAttempt)) continue

      upcoming.push({
        id: assignment.assessment.id,
        title: assignment.assessment.title,
        subjectName: assignment.assessment.subject.name,
        duration: assignment.assessment.duration,
        when: assignment.status === "scheduled" ? assignment.startDate.toLocaleDateString() : "Available now",
        isAvailable: assignment.status === "active" && withinWindow && canAttempt,
      })
    }
  } else {
    const published = await prisma.assessment.findMany({
      where: { status: "published" },
      include: { subject: true },
      orderBy: { title: "asc" },
      take: 3,
    })
    for (const a of published) {
      upcoming.push({
        id: a.id,
        title: a.title,
        subjectName: a.subject.name,
        duration: a.duration,
        when: "Available now",
        isAvailable: true,
      })
    }
  }

  const recentAttempts = attempts.slice(0, 3)
  const recentResults = []
  for (const attempt of recentAttempts) {
    const { rank, totalStudents } = await getRank(attempt.assessmentId, attempt.id)
    recentResults.push({
      attemptId: attempt.id,
      title: attempt.assessment.title,
      submittedAt: attempt.submittedAt!.toISOString(),
      score: attempt.score ?? 0,
      totalMarks: attempt.totalMarks ?? 0,
      rank,
      totalStudents,
    })
  }

  return (
    <StudentDashboardView
      studentName={student.user.name}
      stats={{
        examsCompleted: totalExams,
        averageScore,
        classRank,
        studyHours: Math.round((totalTimeSpentSeconds / 3600) * 10) / 10,
        currentStreak,
      }}
      performanceTrend={performanceTrend}
      subjectStrengths={subjectStrengths}
      upcoming={upcoming.slice(0, 3)}
      recentResults={recentResults}
    />
  )
}
