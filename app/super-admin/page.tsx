import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { SuperAdminDashboardView } from "./super-admin-dashboard-view"

export default async function SuperAdminDashboard() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") notFound()

  const [totalSchools, totalStudents, assessmentsTaken] = await Promise.all([
    prisma.school.count(),
    prisma.student.count(),
    prisma.examAttempt.count({ where: { submittedAt: { not: null } } }),
  ])

  const [totalQuestions, activeSubscriptions] = await Promise.all([
    prisma.question.count(),
    prisma.subscription.count({ where: { status: "active" } }),
  ])

  const [pendingQuestions, pendingAssessments] = await Promise.all([
    prisma.question.count({ where: { status: "pending" } }),
    prisma.assessment.count({ where: { status: "pending" } }),
  ])

  const completedPayments = await prisma.payment.findMany({ where: { status: "completed" }, select: { amount: true } })
  const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0)

  const schools = await prisma.school.findMany({
    where: { status: "active" },
    include: { students: { include: { examAttempts: true } } },
  })
  const topSchools = schools
    .map((school) => {
      const attempts = school.students.flatMap((s) => s.examAttempts).filter((a) => a.submittedAt !== null)
      const scored = attempts.filter((a) => a.score !== null && a.totalMarks)
      const avgScore =
        scored.length > 0
          ? scored.reduce((sum, a) => sum + (a.score! / a.totalMarks!) * 100, 0) / scored.length
          : null
      return { id: school.id, name: school.name, region: school.region, students: school.students.length, avgScore }
    })
    .filter((s) => s.avgScore !== null)
    .sort((a, b) => b.avgScore! - a.avgScore!)
    .slice(0, 5)

  const allScored = schools
    .flatMap((s) => s.students.flatMap((st) => st.examAttempts))
    .filter((a) => a.submittedAt !== null && a.score !== null && a.totalMarks)
  const averagePlatformScore =
    allScored.length > 0
      ? Math.round(allScored.reduce((sum, a) => sum + (a.score! / a.totalMarks!) * 100, 0) / allScored.length)
      : null

  const [questions, subjects] = await Promise.all([
    prisma.question.findMany({ select: { id: true, subjectId: true, correctAnswerIndex: true } }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ])
  const students = await prisma.student.findMany({ include: { examAttempts: true } })
  const questionMap = new Map(questions.map((q) => [q.id, q]))
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]))
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
    .map(([subjectId, agg]) => ({ subject: subjectMap.get(subjectId) ?? "Unknown", avgScore: Math.round((agg.correct / agg.total) * 100) }))
    .sort((a, b) => b.avgScore - a.avgScore)

  const recentActivity = await prisma.auditLog.findMany({
    // actor scoped with `select`, not `include: true` - only .name is
    // rendered here. Found by a security audit 2026-08-08 (see docs/build-log.md).
    include: { actor: { select: { id: true, name: true } } },
    orderBy: { timestamp: "desc" },
    take: 5,
  })

  return (
    <SuperAdminDashboardView
      stats={{
        totalSchools,
        totalStudents,
        assessmentsTaken,
        totalRevenue,
        activeSubscriptions,
        averagePlatformScore,
        totalQuestions,
        pendingApprovals: pendingQuestions + pendingAssessments,
      }}
      subjectPerformance={subjectPerformance}
      topSchools={topSchools}
      recentActivity={recentActivity}
    />
  )
}
