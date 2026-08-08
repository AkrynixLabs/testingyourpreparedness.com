import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ContentAdminDashboardView } from "./content-admin-dashboard-view"

export default async function ContentAdminDashboard() {
  const session = await auth()

  const [myQuestions, recentAssessments, assessmentStats] = await Promise.all([
    prisma.question.findMany({
      where: { createdById: session!.user.id },
      include: { subject: true },
    }),
    prisma.assessment.findMany({
      include: { subject: true, _count: { select: { questions: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.assessment.count(),
  ])

  const questionStatusCounts = {
    draft: myQuestions.filter((q) => q.status === "draft").length,
    pending: myQuestions.filter((q) => q.status === "pending").length,
    approved: myQuestions.filter((q) => q.status === "approved").length,
    rejected: myQuestions.filter((q) => q.status === "rejected").length,
  }

  const subjectCounts = new Map<string, number>()
  for (const q of myQuestions) {
    subjectCounts.set(q.subject.name, (subjectCounts.get(q.subject.name) ?? 0) + 1)
  }
  const maxSubjectCount = Math.max(1, ...subjectCounts.values())
  const questionsBySubject = Array.from(subjectCounts.entries())
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / maxSubjectCount) * 100) }))
    .sort((a, b) => b.count - a.count)

  const recentAssessmentRows = recentAssessments.map((a) => ({
    id: a.id,
    title: a.title,
    subjectName: a.subject.name,
    questionCount: a._count.questions,
    duration: a.duration,
    status: a.status,
  }))

  return (
    <ContentAdminDashboardView
      stats={{
        totalQuestions: myQuestions.length,
        totalAssessments: assessmentStats,
        pendingReview: questionStatusCounts.pending,
        approved: questionStatusCounts.approved,
      }}
      questionStatusCounts={questionStatusCounts}
      questionsBySubject={questionsBySubject}
      recentAssessments={recentAssessmentRows}
    />
  )
}
