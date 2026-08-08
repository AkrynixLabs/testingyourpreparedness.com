import { prisma } from "@/lib/prisma"
import { ReportsView } from "./reports-view"

export default async function ReportsPage() {
  const [schools, subscriptions, students, questions, subjects] = await Promise.all([
    prisma.school.findMany({ select: { region: true } }),
    prisma.subscription.findMany({ where: { schoolId: { not: null } }, include: { plan: true } }),
    prisma.student.findMany({ include: { examAttempts: true } }),
    prisma.question.findMany({ select: { id: true, subjectId: true, correctAnswerIndex: true } }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ])

  const regionCounts = new Map<string, number>()
  for (const s of schools) {
    regionCounts.set(s.region, (regionCounts.get(s.region) ?? 0) + 1)
  }
  const regionDistribution = Array.from(regionCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const planCounts = new Map<string, number>()
  for (const sub of subscriptions) {
    planCounts.set(sub.plan.name, (planCounts.get(sub.plan.name) ?? 0) + 1)
  }
  const planDistribution = Array.from(planCounts.entries()).map(([name, count]) => ({ name, count }))

  const questionMap = new Map(questions.map((q) => [q.id, q]))
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]))
  const subjectAgg = new Map<string, { correct: number; total: number; exams: number }>()
  for (const student of students) {
    for (const attempt of student.examAttempts) {
      if (!attempt.submittedAt) continue
      const answers = attempt.answers as Record<string, number>
      const touchedSubjects = new Set<string>()
      for (const [questionId, selected] of Object.entries(answers)) {
        const q = questionMap.get(questionId)
        if (!q) continue
        const agg = subjectAgg.get(q.subjectId) ?? { correct: 0, total: 0, exams: 0 }
        agg.total += 1
        if (selected === q.correctAnswerIndex) agg.correct += 1
        touchedSubjects.add(q.subjectId)
        subjectAgg.set(q.subjectId, agg)
      }
      for (const subjectId of touchedSubjects) {
        subjectAgg.get(subjectId)!.exams += 1
      }
    }
  }
  const subjectPerformance = Array.from(subjectAgg.entries())
    .map(([subjectId, agg]) => ({
      subject: subjectMap.get(subjectId) ?? "Unknown",
      avgScore: Math.round((agg.correct / agg.total) * 100),
      examsTaken: agg.exams,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)

  return (
    <ReportsView regionDistribution={regionDistribution} planDistribution={planDistribution} subjectPerformance={subjectPerformance} />
  )
}
