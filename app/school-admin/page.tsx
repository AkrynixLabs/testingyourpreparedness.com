import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { SchoolAdminDashboardView } from "./dashboard-view"

export default async function SchoolAdminDashboard() {
  const session = await auth()
  const schoolAdmin = await prisma.schoolAdmin.findUnique({
    where: { userId: session!.user.id },
    select: { schoolId: true },
  })
  if (!schoolAdmin) notFound()

  const [school, students, assignments] = await Promise.all([
    prisma.school.findUnique({ where: { id: schoolAdmin.schoolId } }),
    prisma.student.findMany({
      where: { schoolId: schoolAdmin.schoolId },
      include: {
        user: true,
        class: true,
        examAttempts: {
          where: { submittedAt: { not: null } },
          select: {
            score: true,
            totalMarks: true,
            submittedAt: true,
            answers: true,
            assessment: {
              select: {
                subject: { select: { name: true } },
                questions: {
                  select: { question: { select: { id: true, correctAnswerIndex: true, topic: { select: { name: true } } } } },
                },
              },
            },
          },
        },
      },
    }),
    prisma.assessmentAssignment.findMany({
      where: { schoolId: schoolAdmin.schoolId },
      include: {
        assessment: { include: { subject: true, _count: { select: { questions: true } } } },
        examAttempts: { where: { submittedAt: { not: null } }, select: { score: true, totalMarks: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ])

  if (!school) notFound()

  const pct = (score: number | null, totalMarks: number | null) => ((score ?? 0) / (totalMarks || 1)) * 100

  const allAttempts = students.flatMap((s) => s.examAttempts)
  const totalStudents = students.length
  const activeAssessments = assignments.filter((a) => a.status === "active").length
  const averageScore = allAttempts.length > 0 ? Math.round(allAttempts.reduce((sum, a) => sum + pct(a.score, a.totalMarks), 0) / allAttempts.length) : null
  const studentsWithAttempts = students.filter((s) => s.examAttempts.length > 0).length
  const completionRate = totalStudents > 0 ? Math.round((studentsWithAttempts / totalStudents) * 100) : null

  const classMap = new Map<string, { className: string; total: number; count: number }>()
  for (const s of students) {
    const key = s.classId ?? "none"
    const className = s.class?.displayName ?? "No class"
    if (!classMap.has(key)) classMap.set(key, { className, total: 0, count: 0 })
    const entry = classMap.get(key)!
    for (const a of s.examAttempts) {
      entry.total += pct(a.score, a.totalMarks)
      entry.count++
    }
  }
  const classPerformance = Array.from(classMap.values())
    .filter((c) => c.count > 0)
    .map((c) => ({ class: c.className, avgScore: Math.round(c.total / c.count) }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 6)

  const monthly = new Map<string, { total: number; count: number }>()
  for (const a of allAttempts) {
    const key = a.submittedAt!.toISOString().slice(0, 7)
    if (!monthly.has(key)) monthly.set(key, { total: 0, count: 0 })
    const entry = monthly.get(key)!
    entry.total += pct(a.score, a.totalMarks)
    entry.count++
  }
  const monthlyProgress = Array.from(monthly.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-6)
    .map(([key, { total, count }]) => ({
      month: new Date(`${key}-01`).toLocaleDateString("en-US", { month: "short" }),
      score: Math.round(total / count),
    }))

  const topStudents = students
    .map((s) => {
      const scores = s.examAttempts.map((a) => pct(a.score, a.totalMarks))
      const avg = scores.length > 0 ? scores.reduce((sum, p) => sum + p, 0) / scores.length : null
      return { id: s.id, name: s.user.name, className: s.class?.displayName ?? "No class", avgScore: avg, assessmentsTaken: scores.length }
    })
    .filter((s): s is typeof s & { avgScore: number } => s.avgScore !== null)
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5)
    .map((s) => ({ ...s, avgScore: Math.round(s.avgScore) }))

  const topicMap = new Map<string, { correct: number; total: number; subjectName: string }>()
  for (const s of students) {
    for (const a of s.examAttempts) {
      const answers = a.answers as Record<string, number>
      for (const aq of a.assessment.questions) {
        const key = aq.question.topic.name
        if (!topicMap.has(key)) topicMap.set(key, { correct: 0, total: 0, subjectName: a.assessment.subject.name })
        const entry = topicMap.get(key)!
        entry.total++
        if (answers[aq.question.id] === aq.question.correctAnswerIndex) entry.correct++
      }
    }
  }
  const weakTopics = Array.from(topicMap.entries())
    .map(([topic, { correct, total, subjectName }]) => ({ topic, subject: subjectName, avgScore: Math.round((correct / total) * 100) }))
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 4)

  const recentAssessments = assignments.map((a) => {
    const attempts = a.examAttempts.filter((e) => e.score !== null && e.totalMarks)
    const avg = attempts.length > 0 ? Math.round(attempts.reduce((sum, e) => sum + pct(e.score, e.totalMarks), 0) / attempts.length) : null
    return {
      id: a.id,
      title: a.assessment.title,
      questionCount: a.assessment._count.questions,
      duration: a.assessment.duration,
      avgScore: avg,
      attempts: attempts.length,
    }
  })

  return (
    <SchoolAdminDashboardView
      schoolName={school.name}
      stats={{ totalStudents, activeAssessments, averageScore, completionRate }}
      classPerformance={classPerformance}
      monthlyProgress={monthlyProgress}
      topStudents={topStudents}
      weakTopics={weakTopics}
      recentAssessments={recentAssessments}
    />
  )
}
