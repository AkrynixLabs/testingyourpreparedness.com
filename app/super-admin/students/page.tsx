import { prisma } from "@/lib/prisma"
import { StudentsView } from "./students-view"

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    include: {
      user: true,
      school: true,
      class: true,
      examAttempts: { select: { score: true, totalMarks: true, submittedAt: true, startedAt: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const rows = students.map((s) => {
    const submitted = s.examAttempts.filter((a) => a.submittedAt !== null)
    const scored = submitted.filter((a) => a.score !== null && a.totalMarks)
    const avgScore =
      scored.length > 0
        ? Math.round(
            scored.reduce((sum, a) => sum + (a.score! / a.totalMarks!) * 100, 0) / scored.length
          )
        : null
    const lastActive =
      s.examAttempts.length > 0
        ? s.examAttempts.reduce((latest, a) => (a.startedAt > latest ? a.startedAt : latest), s.examAttempts[0].startedAt)
        : null

    return {
      id: s.id,
      name: s.user.name,
      email: s.user.email,
      enrollmentType: s.enrollmentType,
      schoolName: s.school?.name ?? null,
      className: s.class?.displayName ?? null,
      registeredAt: s.user.createdAt,
      lastActive,
      examsCompleted: submitted.length,
      avgScore,
      status: s.status,
    }
  })

  const schoolRows = rows.filter((r) => r.enrollmentType === "school")
  const independentRows = rows.filter((r) => r.enrollmentType === "independent")
  const activeCount = rows.filter((r) => r.status === "active").length

  const formCounts = new Map<string, number>()
  for (const r of schoolRows) {
    if (r.className) formCounts.set(r.className, (formCounts.get(r.className) ?? 0) + 1)
  }
  const formDistribution = Array.from(formCounts.entries())
    .map(([form, count]) => ({
      form,
      count,
      percentage: schoolRows.length > 0 ? Math.round((count / schoolRows.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  const schoolsWithStudents = await prisma.school.findMany({
    where: { students: { some: {} } },
    select: { region: true, _count: { select: { students: true } } },
  })
  const regionCounts = new Map<string, number>()
  for (const s of schoolsWithStudents) {
    regionCounts.set(s.region, (regionCounts.get(s.region) ?? 0) + s._count.students)
  }
  const regionDistribution = Array.from(regionCounts.entries())
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count)

  return (
    <StudentsView
      students={rows}
      schoolStudents={schoolRows}
      independentStudents={independentRows}
      stats={{
        total: rows.length,
        school: schoolRows.length,
        independent: independentRows.length,
        active: activeCount,
      }}
      formDistribution={formDistribution}
      regionDistribution={regionDistribution}
    />
  )
}
