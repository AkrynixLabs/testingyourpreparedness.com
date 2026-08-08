import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ClassesView } from "./classes-view"

export default async function ClassesPage() {
  const session = await auth()
  const schoolAdmin = await prisma.schoolAdmin.findUnique({
    where: { userId: session!.user.id },
    select: { schoolId: true },
  })
  if (!schoolAdmin) notFound()

  const classes = await prisma.class.findMany({
    where: { schoolId: schoolAdmin.schoolId },
    include: {
      students: {
        select: { examAttempts: { where: { submittedAt: { not: null } }, select: { score: true, totalMarks: true } } },
      },
    },
    orderBy: [{ form: "asc" }, { section: "asc" }],
  })

  const rows = classes.map((cls) => {
    const attempts = cls.students.flatMap((s) => s.examAttempts).filter((a) => a.score !== null && a.totalMarks)
    const avgPerformance =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + (a.score! / a.totalMarks!) * 100, 0) / attempts.length)
        : null

    return {
      id: cls.id,
      displayName: cls.displayName,
      form: cls.form,
      section: cls.section,
      teacherName: cls.teacherName,
      academicYear: cls.academicYear,
      studentCount: cls.students.length,
      avgPerformance,
    }
  })

  const forms = Array.from(new Set(rows.map((c) => c.form))).sort((a, b) => a - b)
  const formSummary = forms.map((form) => {
    const formClasses = rows.filter((c) => c.form === form)
    const totalStudents = formClasses.reduce((sum, c) => sum + c.studentCount, 0)
    const scored = formClasses.filter((c) => c.avgPerformance !== null)
    const avgPerformance =
      scored.length > 0 ? Math.round(scored.reduce((sum, c) => sum + c.avgPerformance!, 0) / scored.length) : null
    return { form, classCount: formClasses.length, totalStudents, avgPerformance }
  })

  return <ClassesView classes={rows} formSummary={formSummary} />
}
