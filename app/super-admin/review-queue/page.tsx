import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { Clock, CheckCircle2, XCircle } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileQuestion } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { QuestionsPanel } from "./questions-panel"
import { AssessmentsPanel } from "./assessments-panel"

export default async function ReviewQueuePage() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") notFound()

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  // Deliberately sequential, not one big Promise.all - Neon's free tier runs
  // this project on its smallest compute (0.25 CU), which was observed to
  // fail under 9 fully-concurrent queries from a single request even though
  // every query is individually correct (reproduced/ruled out via a
  // standalone script - see CLAUDE.md). Small batches keep this reliable.
  const pendingQuestions = await prisma.question.findMany({
    where: { status: "pending" },
    include: { subject: true, topic: true, createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  })
  const pendingAssessments = await prisma.assessment.findMany({
    where: { status: "pending" },
    include: {
      subject: true,
      createdBy: { select: { name: true } },
      _count: { select: { questions: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } })
  const [questionAuditLogs, assessmentAuditLogs] = await Promise.all([
    prisma.auditLog.findMany({
      where: { category: "content", action: { in: ["approve", "reject"] }, details: { path: ["type"], equals: "question" } },
      include: { actor: { select: { name: true } } },
      orderBy: { timestamp: "desc" },
      take: 20,
    }),
    prisma.auditLog.findMany({
      where: { category: "content", action: { in: ["approve", "reject"] }, details: { path: ["type"], equals: "assessment" } },
      include: { actor: { select: { name: true } } },
      orderBy: { timestamp: "desc" },
      take: 20,
    }),
  ])
  const [approvedToday, rejectedToday] = await Promise.all([
    prisma.auditLog.count({
      where: { category: "content", action: "approve", timestamp: { gte: startOfToday } },
    }),
    prisma.auditLog.count({
      where: { category: "content", action: "reject", timestamp: { gte: startOfToday } },
    }),
  ])
  const reviewedQuestions = await prisma.question.findMany({
    where: { status: { in: ["approved", "rejected"] } },
    select: { createdAt: true, updatedAt: true },
  })
  const reviewedAssessments = await prisma.assessment.findMany({
    where: { status: { in: ["published", "archived"] } },
    select: { createdAt: true, updatedAt: true },
  })

  // Avg review time = time between submission (createdAt) and the review
  // that changed its status (updatedAt) - a real proxy, not hardcoded, though
  // it covers all-time reviewed items rather than just "today" (matching that
  // precisely would mean cross-referencing AuditLog timestamps item-by-item).
  const reviewedItems = [...reviewedQuestions, ...reviewedAssessments]
  const avgReviewHours =
    reviewedItems.length > 0
      ? reviewedItems.reduce((acc, item) => acc + (item.updatedAt.getTime() - item.createdAt.getTime()), 0) /
        reviewedItems.length /
        (1000 * 60 * 60)
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Review Queue</h1>
        <p className="text-muted-foreground">
          Review and approve content submitted by Content Administrators
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Review"
          value={String(pendingQuestions.length + pendingAssessments.length)}
          changeLabel="Awaiting approval"
          icon={Clock}
          change={0}
        />
        <StatCard
          title="Approved Today"
          value={String(approvedToday)}
          changeLabel="Items approved"
          icon={CheckCircle2}
          change={0}
        />
        <StatCard
          title="Rejected Today"
          value={String(rejectedToday)}
          changeLabel="Sent back for revision"
          icon={XCircle}
          change={0}
        />
        <StatCard
          title="Avg Review Time"
          value={avgReviewHours > 0 ? `${avgReviewHours.toFixed(1)}h` : "-"}
          changeLabel="Per item"
          icon={Clock}
          change={0}
        />
      </div>

      {/* Content type tabs: Questions vs Assessments */}
      <Tabs defaultValue="questions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="questions" className="gap-2">
            <FileQuestion className="h-4 w-4" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="assessments" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Assessments ({pendingAssessments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          <QuestionsPanel
            pendingQuestions={pendingQuestions}
            history={questionAuditLogs}
            subjects={subjects}
          />
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <AssessmentsPanel
            pendingAssessments={pendingAssessments}
            history={assessmentAuditLogs}
            subjects={subjects}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
