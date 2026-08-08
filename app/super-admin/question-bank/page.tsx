import { prisma } from "@/lib/prisma"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion, BookOpen, Users, Archive } from "lucide-react"
import { QuestionBankTable } from "./question-bank-table"

export default async function QuestionBankPage() {
  const questions = await prisma.question.findMany({
    where: { status: "approved" },
    include: {
      subject: true,
      topic: true,
      createdBy: true,
      reviewedBy: true,
      assessmentQuestions: {
        include: { assessment: { include: { _count: { select: { examAttempts: true } } } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  const questionsWithUsage = questions.map((q) => {
    const timesUsed = q.assessmentQuestions.reduce(
      (sum, aq) => sum + aq.assessment._count.examAttempts,
      0
    )
    return { ...q, timesUsed }
  })

  const activeQuestions = questionsWithUsage.filter((q) => q.isActive)
  const archivedCount = questionsWithUsage.length - activeQuestions.length

  const subjectCounts = new Map<string, number>()
  for (const q of activeQuestions) {
    subjectCounts.set(q.subject.name, (subjectCounts.get(q.subject.name) ?? 0) + 1)
  }
  const subjectStats = Array.from(subjectCounts.entries())
    .map(([subject, count]) => ({
      subject,
      count,
      percentage: activeQuestions.length > 0 ? Math.round((count / activeQuestions.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  const activeAuthors = new Set(activeQuestions.map((q) => q.createdById)).size

  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Question Bank</h1>
          <p className="text-muted-foreground">All approved questions available for assessments</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Questions" value={activeQuestions.length} icon={FileQuestion} />
        <StatCard title="Subjects Covered" value={subjectStats.length} icon={BookOpen} />
        <StatCard title="Active Authors" value={activeAuthors} icon={Users} />
        <StatCard title="Archived" value={archivedCount} icon={Archive} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Questions by Subject</CardTitle>
          <CardDescription>Distribution of active questions across subjects</CardDescription>
        </CardHeader>
        <CardContent>
          {subjectStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active questions yet.</p>
          ) : (
            <div className="space-y-4">
              {subjectStats.map((stat) => (
                <div key={stat.subject} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stat.subject}</span>
                    <span className="text-muted-foreground">
                      {stat.count.toLocaleString()} ({stat.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <QuestionBankTable questions={questionsWithUsage} subjects={subjects} />
    </div>
  )
}
