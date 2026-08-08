import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SchoolDetailView } from "./school-detail-view"

export default async function SchoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const school = await prisma.school.findUnique({
    where: { id },
    include: {
      admins: { include: { user: true }, orderBy: { isPrimary: "desc" } },
      subscription: { include: { plan: true } },
    },
  })
  if (!school) notFound()

  const students = await prisma.student.findMany({
    where: { schoolId: id },
    include: {
      user: true,
      class: true,
      examAttempts: { include: { assessment: { include: { subject: true } } } },
    },
  })

  const classes = await prisma.class.findMany({ where: { schoolId: id }, orderBy: [{ form: "asc" }, { section: "asc" }] })

  const invoices = school.subscription
    ? await prisma.invoice.findMany({ where: { subscriptionId: school.subscription.id }, orderBy: { dueDate: "desc" } })
    : []

  const studentRows = students.map((s) => {
    const submitted = s.examAttempts.filter((a) => a.submittedAt !== null)
    const scored = submitted.filter((a) => a.score !== null && a.totalMarks)
    const avgScore =
      scored.length > 0
        ? Math.round(scored.reduce((sum, a) => sum + (a.score! / a.totalMarks!) * 100, 0) / scored.length)
        : null
    return {
      id: s.id,
      name: s.user.name,
      email: s.user.email,
      className: s.class?.displayName ?? "-",
      classId: s.classId,
      examsCompleted: submitted.length,
      avgScore,
      status: s.status,
    }
  })

  const classRows = classes.map((c) => {
    const classStudents = studentRows.filter((s) => s.classId === c.id)
    const scored = classStudents.filter((s) => s.avgScore !== null)
    const avgScore = scored.length > 0 ? Math.round(scored.reduce((sum, s) => sum + s.avgScore!, 0) / scored.length) : null
    const topStudent = scored.length > 0 ? scored.reduce((best, s) => (s.avgScore! > best.avgScore! ? s : best)) : null
    return {
      id: c.id,
      displayName: c.displayName,
      studentCount: classStudents.length,
      avgScore,
      examsCompleted: classStudents.reduce((sum, s) => sum + s.examsCompleted, 0),
      topStudentName: topStudent?.name ?? null,
    }
  })

  const questionMap = new Map<string, { subjectId: string; subjectName: string; correctAnswerIndex: number }>()
  const allSubmittedAttempts = students.flatMap((s) => s.examAttempts.filter((a) => a.submittedAt !== null))
  const attemptQuestionIds = new Set<string>()
  for (const a of allSubmittedAttempts) {
    for (const qid of Object.keys(a.answers as Record<string, number>)) attemptQuestionIds.add(qid)
  }
  const relevantQuestions =
    attemptQuestionIds.size > 0
      ? await prisma.question.findMany({
          where: { id: { in: Array.from(attemptQuestionIds) } },
          include: { subject: true },
        })
      : []
  for (const q of relevantQuestions) {
    questionMap.set(q.id, { subjectId: q.subjectId, subjectName: q.subject.name, correctAnswerIndex: q.correctAnswerIndex })
  }
  const subjectAgg = new Map<string, { correct: number; total: number }>()
  for (const a of allSubmittedAttempts) {
    const answers = a.answers as Record<string, number>
    for (const [qid, selected] of Object.entries(answers)) {
      const q = questionMap.get(qid)
      if (!q) continue
      const agg = subjectAgg.get(q.subjectName) ?? { correct: 0, total: 0 }
      agg.total += 1
      if (selected === q.correctAnswerIndex) agg.correct += 1
      subjectAgg.set(q.subjectName, agg)
    }
  }
  const subjectPerformance = Array.from(subjectAgg.entries())
    .map(([subject, agg]) => ({ subject, avgScore: Math.round((agg.correct / agg.total) * 100) }))
    .sort((a, b) => b.avgScore - a.avgScore)

  const recentAttempts = allSubmittedAttempts
    .slice()
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
    .slice(0, 10)
    .map((a) => {
      const student = students.find((s) => s.examAttempts.some((ea) => ea.id === a.id))!
      return {
        id: a.id,
        studentName: student.user.name,
        assessmentTitle: a.assessment.title,
        subjectName: a.assessment.subject.name,
        score: a.score !== null && a.totalMarks ? Math.round((a.score / a.totalMarks) * 100) : null,
        submittedAt: a.submittedAt!,
      }
    })

  const overallScored = allSubmittedAttempts.filter((a) => a.score !== null && a.totalMarks)
  const avgScore =
    overallScored.length > 0
      ? Math.round(overallScored.reduce((sum, a) => sum + (a.score! / a.totalMarks!) * 100, 0) / overallScored.length)
      : null

  const primaryAdmin = school.admins.find((a) => a.isPrimary) ?? school.admins[0] ?? null

  return (
    <SchoolDetailView
      school={school}
      primaryAdmin={primaryAdmin}
      students={studentRows}
      classes={classRows}
      invoices={invoices}
      subjectPerformance={subjectPerformance}
      recentAttempts={recentAttempts}
      stats={{
        totalStudents: studentRows.length,
        activeStudents: studentRows.filter((s) => s.status === "active").length,
        totalClasses: classRows.length,
        avgScore,
      }}
    />
  )
}
