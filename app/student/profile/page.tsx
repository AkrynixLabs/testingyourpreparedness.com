import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { StudentProfileView } from "./profile-view"

export default async function StudentProfilePage() {
  const session = await auth()
  const student = await prisma.student.findUnique({
    where: { userId: session!.user.id },
    include: { user: true, class: true, school: true, guardian: true },
  })

  if (!student) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">No learner profile found for this account.</p>
      </div>
    )
  }

  const [attempts, achievements, earned] = await Promise.all([
    prisma.examAttempt.findMany({
      where: { studentId: student.id, submittedAt: { not: null } },
      include: { assessment: { include: { subject: true } } },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.achievement.findMany({ orderBy: { name: "asc" } }),
    prisma.studentAchievement.findMany({ where: { studentId: student.id }, orderBy: { earnedAt: "desc" } }),
  ])

  const totalExams = attempts.length
  const percentages = attempts.map((a) => ((a.score ?? 0) / (a.totalMarks || 1)) * 100)
  const averageScore = totalExams > 0 ? Math.round(percentages.reduce((s, p) => s + p, 0) / totalExams) : null

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

  // Subject performance + per-subject rank, computed against every other
  // student who has taken an assessment in that same subject.
  const bySubject = new Map<string, number[]>()
  for (const a of attempts) {
    const name = a.assessment.subject.name
    const pct = ((a.score ?? 0) / (a.totalMarks || 1)) * 100
    if (!bySubject.has(name)) bySubject.set(name, [])
    bySubject.get(name)!.push(pct)
  }
  const subjectPerformance = Array.from(bySubject.entries())
    .map(([subject, scores]) => ({
      subject,
      score: Math.round(scores.reduce((s, p) => s + p, 0) / scores.length),
      exams: scores.length,
    }))
    .sort((a, b) => b.score - a.score)

  const earnedIds = new Set(earned.map((e) => e.achievementId))
  const earnedDates = new Map(earned.map((e) => [e.achievementId, e.earnedAt]))
  const achievementRows = achievements.map((a) => ({
    id: a.id,
    name: a.name,
    criteria: a.criteria,
    earned: earnedIds.has(a.id),
    earnedAt: earnedDates.get(a.id)?.toISOString() ?? null,
  }))

  // Recent activity: real submitted attempts + real earned achievements,
  // merged and sorted by date - no fabricated "material completed" events,
  // since nothing tracks per-student material progress in this schema.
  const activity = [
    ...attempts.slice(0, 5).map((a) => ({
      type: "exam" as const,
      title: a.assessment.title,
      result: `${Math.round(((a.score ?? 0) / (a.totalMarks || 1)) * 100)}%`,
      date: a.submittedAt!.toISOString(),
    })),
    ...earned.slice(0, 5).map((e) => ({
      type: "achievement" as const,
      title: achievements.find((a) => a.id === e.achievementId)?.name ?? "Achievement",
      result: null,
      date: e.earnedAt.toISOString(),
    })),
  ]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6)

  return (
    <StudentProfileView
      user={{ name: student.user.name, email: student.user.email }}
      studentStatus={student.status}
      enrollmentType={student.enrollmentType}
      schoolName={student.school?.name ?? null}
      className={student.class?.displayName ?? null}
      address={student.address}
      createdAt={student.createdAt.toISOString()}
      guardian={
        student.guardian
          ? { name: student.guardian.name, relation: student.guardian.relation, phone: student.guardian.phone, email: student.guardian.email }
          : null
      }
      stats={{ examsTaken: totalExams, averageScore, classRank, currentStreak }}
      subjectPerformance={subjectPerformance}
      achievements={achievementRows}
      activity={activity}
    />
  )
}
