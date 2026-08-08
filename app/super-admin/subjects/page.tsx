import { prisma } from "@/lib/prisma"
import { SubjectsView } from "./subjects-view"

export default async function SubjectsPage() {
  const [subjects, programs] = await Promise.all([
    prisma.subject.findMany({
      include: {
        program: true,
        topics: { include: { _count: { select: { questions: true } } }, orderBy: { name: "asc" } },
        _count: { select: { questions: true, topics: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.program.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subjects & Topics</h1>
        <p className="text-muted-foreground">
          Manage subjects and their associated topics across all exam programs
        </p>
      </div>

      <SubjectsView subjects={subjects} programs={programs} />
    </div>
  )
}
