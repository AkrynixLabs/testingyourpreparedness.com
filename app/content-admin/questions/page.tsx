import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { QuestionsTable } from "./questions-table"

export default async function MyQuestionsPage() {
  const session = await auth()

  // "My Questions" per the nav label and the Content Admin role definition
  // in CLAUDE.md - scoped to the logged-in content admin's own submissions,
  // not a platform-wide question bank (that's super-admin/question-bank,
  // the *approved* pool, a different page/entity distinction entirely).
  const [questions, subjects] = await Promise.all([
    prisma.question.findMany({
      where: { createdById: session!.user.id },
      include: { subject: true, topic: true, _count: { select: { assessmentQuestions: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ])

  const rows = questions.map((q) => ({
    ...q,
    subjectName: q.subject.name,
    topicName: q.topic.name,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Questions</h1>
          <p className="text-muted-foreground">
            Manage your submitted questions
          </p>
        </div>
        <Button asChild>
          <Link href="/content-admin/questions/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Question
          </Link>
        </Button>
      </div>

      <QuestionsTable questions={rows} subjects={subjects} />
    </div>
  )
}
