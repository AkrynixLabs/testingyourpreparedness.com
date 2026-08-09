import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { AssessmentsTable } from "./assessments-table"

export default async function AssessmentsPage() {
  const [assessments, subjects] = await Promise.all([
    // createdBy is scoped with `select`, not `include: true` - the spread
    // below (`{...a, ...}`) would otherwise carry the full nested User
    // (including passwordHash) into this page's RSC payload even though only
    // createdByName is ever actually used. Found by a security audit
    // 2026-08-08 (see docs/build-log.md).
    prisma.assessment.findMany({
      include: {
        subject: true,
        createdBy: { select: { id: true, name: true } },
        _count: { select: { questions: true, assignments: true } },
        examAttempts: {
          where: { submittedAt: { not: null } },
          select: { score: true, totalMarks: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ])

  const rows = assessments.map((a) => {
    const scored = a.examAttempts.filter((e) => e.score !== null && e.totalMarks)
    const avgScore =
      scored.length > 0
        ? Math.round(
            scored.reduce((sum, e) => sum + (e.score! / e.totalMarks!) * 100, 0) / scored.length
          )
        : null

    return {
      ...a,
      subjectName: a.subject.name,
      createdByName: a.createdBy.name,
      questionCount: a._count.questions,
      timesAssigned: a._count.assignments,
      avgScore,
    }
  })

  const stats = {
    total: rows.length,
    published: rows.filter((a) => a.status === "published").length,
    draft: rows.filter((a) => a.status === "draft").length,
    pending: rows.filter((a) => a.status === "pending").length,
    totalQuestions: rows.reduce((sum, a) => sum + a.questionCount, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Assessments</h1>
          <p className="text-muted-foreground">Manage and organize your assessment library</p>
        </div>
        <Button asChild>
          <Link href="/content-admin/assessments/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Assessment
          </Link>
        </Button>
      </div>

      <AssessmentsTable assessments={rows} subjects={subjects} stats={stats} />
    </div>
  )
}
