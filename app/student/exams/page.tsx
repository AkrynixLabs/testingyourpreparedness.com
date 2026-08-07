import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ExamsTabs, type AvailableExam, type ScheduledExam, type CompletedExam } from "./exams-tabs"

export default async function StudentExamsPage() {
  const session = await auth()

  const student = await prisma.student.findUnique({
    where: { userId: session!.user.id },
  })

  if (!student) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
        <p className="text-muted-foreground">No student profile found for this account.</p>
      </div>
    )
  }

  const now = new Date()
  const available: AvailableExam[] = []
  const scheduled: ScheduledExam[] = []

  if (student.enrollmentType === "school" && student.schoolId) {
    // School-provisioned: exams come from AssessmentAssignment, targeted
    // either at this student directly or at their class.
    const assignments = await prisma.assessmentAssignment.findMany({
      where: {
        schoolId: student.schoolId,
        OR: [
          { students: { some: { studentId: student.id } } },
          ...(student.classId ? [{ classes: { some: { classId: student.classId } } }] : []),
        ],
      },
      include: {
        assessment: { include: { subject: true, _count: { select: { questions: true } } } },
        examAttempts: { where: { studentId: student.id, submittedAt: { not: null } } },
      },
      orderBy: { startDate: "asc" },
    })

    for (const assignment of assignments) {
      if (assignment.status === "scheduled") {
        scheduled.push({
          assignmentId: assignment.id,
          title: assignment.assessment.title,
          subjectName: assignment.assessment.subject.name,
          duration: assignment.assessment.duration,
          questionCount: assignment.assessment._count.questions,
          difficulty: assignment.assessment.difficulty,
          startDate: assignment.startDate,
        })
        continue
      }
      if (assignment.status !== "active") continue

      const withinWindow = now >= assignment.startDate && now <= assignment.endDate
      const attemptsUsed = assignment.examAttempts.length
      const canAttempt = assignment.allowRetake
        ? assignment.maxAttempts === null || attemptsUsed < assignment.maxAttempts
        : attemptsUsed === 0

      if (withinWindow && canAttempt) {
        available.push({
          assessmentId: assignment.assessment.id,
          title: assignment.assessment.title,
          subjectName: assignment.assessment.subject.name,
          duration: assignment.assessment.duration,
          questionCount: assignment.assessment._count.questions,
          difficulty: assignment.assessment.difficulty,
          deadline: assignment.endDate,
          attempts: attemptsUsed,
          maxAttempts: assignment.maxAttempts,
        })
      }
    }
  } else {
    // Independent student: "open access" per ExamAttempt.assignmentId's own
    // schema comment - no AssessmentAssignment applies, so every published
    // assessment is directly available, repeatably (no attempt-limit policy
    // exists for this path in the schema today).
    const publishedAssessments = await prisma.assessment.findMany({
      where: { status: "published" },
      include: { subject: true, _count: { select: { questions: true } } },
      orderBy: { title: "asc" },
    })
    for (const assessment of publishedAssessments) {
      available.push({
        assessmentId: assessment.id,
        title: assessment.title,
        subjectName: assessment.subject.name,
        duration: assessment.duration,
        questionCount: assessment._count.questions,
        difficulty: assessment.difficulty,
        deadline: null,
        attempts: 0,
        maxAttempts: null,
      })
    }
  }

  const completedAttempts = await prisma.examAttempt.findMany({
    where: { studentId: student.id, submittedAt: { not: null } },
    include: { assessment: { include: { subject: true } } },
    orderBy: { submittedAt: "desc" },
  })

  const completed: CompletedExam[] = completedAttempts.map((attempt) => ({
    attemptId: attempt.id,
    title: attempt.assessment.title,
    subjectName: attempt.assessment.subject.name,
    score: attempt.score ?? 0,
    totalMarks: attempt.totalMarks ?? 0,
    submittedAt: attempt.submittedAt!,
    timeSpentSeconds: attempt.timeSpentSeconds,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
        <p className="text-muted-foreground mt-1">
          View and take your available assessments
        </p>
      </div>

      <ExamsTabs available={available} scheduled={scheduled} completed={completed} />
    </div>
  )
}
