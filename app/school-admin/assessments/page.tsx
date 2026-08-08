import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { AssignedAssessmentsView } from "./assigned-assessments-view"

export default async function AssessmentsPage() {
  const session = await auth()
  const schoolAdmin = await prisma.schoolAdmin.findUnique({
    where: { userId: session!.user.id },
    select: { schoolId: true },
  })
  if (!schoolAdmin) notFound()

  const assignments = await prisma.assessmentAssignment.findMany({
    where: { schoolId: schoolAdmin.schoolId },
    include: {
      assessment: { include: { subject: true, _count: { select: { questions: true } } } },
      classes: { include: { class: { select: { displayName: true, _count: { select: { students: true } } } } } },
      students: { select: { studentId: true } },
      examAttempts: { select: { studentId: true, submittedAt: true, score: true, totalMarks: true } },
    },
    orderBy: { startDate: "desc" },
  })

  const rows = assignments.map((a) => {
    // We only have per-class student counts here, not ids, so total targeted
    // students for class-based assignments is the sum of class sizes at
    // query time - individually-targeted students are tracked exactly.
    const classSizeSum = a.classes.reduce((sum, c) => sum + c.class._count.students, 0)
    const individualCount = a.students.length

    const attemptedStudentIds = new Set(a.examAttempts.map((e) => e.studentId))
    const submittedStudentIds = new Set(a.examAttempts.filter((e) => e.submittedAt).map((e) => e.studentId))
    const totalStudents = classSizeSum + individualCount
    const completed = submittedStudentIds.size
    const inProgress = Array.from(attemptedStudentIds).filter((id) => !submittedStudentIds.has(id)).length
    const notStarted = Math.max(totalStudents - completed - inProgress, 0)

    const scored = a.examAttempts.filter((e) => e.submittedAt && e.score !== null && e.totalMarks)
    const avgScore = scored.length > 0 ? Math.round(scored.reduce((sum, e) => sum + (e.score! / e.totalMarks!) * 100, 0) / scored.length) : 0

    const assignedTo =
      a.classes.length > 0
        ? a.classes.map((c) => c.class.displayName).join(", ")
        : individualCount > 0
        ? `${individualCount} student${individualCount !== 1 ? "s" : ""}`
        : "No one assigned"

    return {
      id: a.id,
      title: a.assessment.title,
      subject: a.assessment.subject.name,
      assignedTo,
      totalStudents,
      completed,
      inProgress,
      notStarted,
      avgScore,
      startDate: a.startDate.toISOString(),
      endDate: a.endDate.toISOString(),
      status: a.status,
      duration: a.assessment.duration,
      questions: a.assessment._count.questions,
    }
  })

  const subjectNames = Array.from(new Set(rows.map((r) => r.subject))).sort()

  return <AssignedAssessmentsView assignments={rows} subjects={subjectNames} />
}
