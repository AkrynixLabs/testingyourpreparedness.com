import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { startOrResumeExam } from "@/lib/student/exam-attempt"
import { submitExam } from "./actions"
import { ExamTakingClient } from "./exam-taking-client"

export default async function ExamStartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: assessmentId } = await params
  const session = await auth()

  const student = await prisma.student.findUnique({ where: { userId: session!.user.id } })
  if (!student) notFound()

  const result = await startOrResumeExam(student, assessmentId)
  if (!result.ok) {
    redirect(result.reason === "free_tier_limit" ? "/student/exams?blocked=free_tier_limit" : "/student/exams")
  }

  // The clock already ran out before the student ever loaded this page again
  // (e.g. they closed the tab mid-exam) - grade and redirect immediately
  // rather than showing an exam UI with 00:00 on it. Client-side timeout is
  // not trustworthy on its own; this is the server-side backstop.
  if (result.timedOut) {
    const submitted = await submitExam(result.attemptId, {}, [])
    redirect(`/student/results/${submitted.attemptId}`)
  }

  return (
    <ExamTakingClient
      attemptId={result.attemptId}
      title={result.title}
      subjectName={result.subjectName}
      questions={result.questions}
      remainingSeconds={result.remainingSeconds}
    />
  )
}
