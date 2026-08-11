import { prisma } from "@/lib/prisma"
import type { Difficulty } from "@/lib/generated/prisma/client"

export type AvailableExam = {
  assessmentId: string
  title: string
  subjectName: string
  duration: number
  questionCount: number
  difficulty: Difficulty | null
  deadline: Date | null
  attempts: number
  maxAttempts: number | null
}

export type ScheduledExam = {
  assignmentId: string
  title: string
  subjectName: string
  duration: number
  questionCount: number
  difficulty: Difficulty | null
  startDate: Date
}

export type CompletedExam = {
  attemptId: string
  title: string
  subjectName: string
  score: number
  totalMarks: number
  submittedAt: Date
  timeSpentSeconds: number | null
}

// Extracted from app/student/exams/page.tsx (unchanged logic) so the new
// mobile API (app/api/mobile/exams) can return the exact same eligibility
// computation instead of a second, driftable copy - same "one function, two
// callers" pattern already used for lib/reports/generate.ts.
export async function getStudentExams(studentId: string): Promise<{
  available: AvailableExam[]
  scheduled: ScheduledExam[]
  completed: CompletedExam[]
}> {
  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) return { available: [], scheduled: [], completed: [] }

  const now = new Date()
  const available: AvailableExam[] = []
  const scheduled: ScheduledExam[] = []

  if (student.enrollmentType === "school" && student.schoolId) {
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

  return { available, scheduled, completed }
}
