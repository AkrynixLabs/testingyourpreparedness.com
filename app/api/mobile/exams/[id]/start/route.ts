import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { startOrResumeExam } from "@/lib/student/exam-attempt"

// Starts a new attempt or resumes an in-progress one (mirrors the web app's
// app/student/exams/[id]/start/page.tsx - same shared lib/student/exam-
// attempt.ts function, so re-opening this on the phone after a refresh/app
// relaunch behaves identically: no clock reset, no extra attempt burned).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const student = await prisma.student.findUnique({ where: { userId: authUser.id } })
  if (!student) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 })
  }

  const { id: assessmentId } = await params
  const result = await startOrResumeExam(student, assessmentId)
  if (!result.ok) {
    return NextResponse.json({ error: "This exam isn't available to you right now." }, { status: 403 })
  }

  if (result.timedOut) {
    return NextResponse.json({ timedOut: true, attemptId: result.attemptId })
  }

  return NextResponse.json({
    timedOut: false,
    attemptId: result.attemptId,
    title: result.title,
    subjectName: result.subjectName,
    questions: result.questions,
    remainingSeconds: result.remainingSeconds,
  })
}
