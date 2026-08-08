import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { submitExam } from "./actions"
import { ExamTakingClient } from "./exam-taking-client"
import type { Student } from "@/lib/generated/prisma/client"

// Re-verified server-side, independent of what the exams list page already
// filtered client-side to - a student navigating directly to this URL must
// not be able to start an exam they aren't actually eligible for. Mirrors
// the eligibility logic in app/student/exams/page.tsx; kept separate rather
// than shared since this only ever checks one assessment for one student.
async function resolveEligibility(student: Student, assessmentId: string) {
  if (student.enrollmentType === "school" && student.schoolId) {
    const assignment = await prisma.assessmentAssignment.findFirst({
      where: {
        assessmentId,
        schoolId: student.schoolId,
        status: "active",
        OR: [
          { students: { some: { studentId: student.id } } },
          ...(student.classId ? [{ classes: { some: { classId: student.classId } } }] : []),
        ],
      },
      include: {
        examAttempts: { where: { studentId: student.id, submittedAt: { not: null } } },
      },
    })
    if (!assignment) return { eligible: false as const }

    const now = new Date()
    const withinWindow = now >= assignment.startDate && now <= assignment.endDate
    const attemptsUsed = assignment.examAttempts.length
    const canAttempt = assignment.allowRetake
      ? assignment.maxAttempts === null || attemptsUsed < assignment.maxAttempts
      : attemptsUsed === 0

    if (!withinWindow || !canAttempt) return { eligible: false as const }
    return { eligible: true as const, assignmentId: assignment.id }
  }

  // Independent student: open access, matches ExamAttempt.assignmentId's
  // own schema comment.
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { status: true },
  })
  if (!assessment || assessment.status !== "published") return { eligible: false as const }
  return { eligible: true as const, assignmentId: null }
}

export default async function ExamStartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: assessmentId } = await params
  const session = await auth()

  const student = await prisma.student.findUnique({ where: { userId: session!.user.id } })
  if (!student) notFound()

  const eligibility = await resolveEligibility(student, assessmentId)
  if (!eligibility.eligible) {
    redirect("/student/exams")
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      subject: true,
      questions: {
        include: { question: true },
        orderBy: { order: "asc" },
      },
    },
  })
  if (!assessment) notFound()

  // Find or resume an in-progress attempt rather than always creating a new
  // one - refreshing this page must not reset the clock or count as a new
  // attempt against maxAttempts.
  let attempt = await prisma.examAttempt.findFirst({
    where: {
      studentId: student.id,
      assessmentId,
      assignmentId: eligibility.assignmentId,
      submittedAt: null,
    },
  })
  if (!attempt) {
    attempt = await prisma.examAttempt.create({
      data: {
        studentId: student.id,
        assessmentId,
        assignmentId: eligibility.assignmentId,
        answers: {},
        flaggedQuestionIds: [],
        startedAt: new Date(),
      },
    })
  }

  const elapsedSeconds = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000)
  const totalSeconds = assessment.duration * 60
  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds)

  // The clock already ran out before the student ever loaded this page again
  // (e.g. they closed the tab mid-exam) - grade and redirect immediately
  // rather than showing an exam UI with 00:00 on it. Client-side timeout is
  // not trustworthy on its own; this is the server-side backstop.
  if (remainingSeconds <= 0) {
    const result = await submitExam(attempt.id, {}, [])
    redirect(`/student/results/${result.attemptId}`)
  }

  const questions = assessment.questions.map(({ question: q }) => ({
    id: q.id,
    text: q.text,
    options: q.options as string[],
  }))

  return (
    <ExamTakingClient
      attemptId={attempt.id}
      title={assessment.title}
      subjectName={assessment.subject.name}
      questions={questions}
      remainingSeconds={remainingSeconds}
    />
  )
}
