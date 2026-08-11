import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { submitExamAttempt } from "@/lib/student/exam-attempt"

// Grading happens entirely server-side (see lib/student/exam-attempt.ts) -
// the client only ever sent question text/options, never the correct
// answer. Idempotent: resubmitting an already-submitted attempt just
// returns the existing result instead of re-grading (matters here more than
// on web - a flaky mobile connection retrying a submit must not re-grade).
export async function POST(request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const student = await prisma.student.findUnique({ where: { userId: authUser.id } })
  if (!student) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 })
  }

  const { attemptId } = await params
  const body = await request.json().catch(() => null)
  const answers = (body?.answers && typeof body.answers === "object" ? body.answers : {}) as Record<string, number>
  const flaggedQuestionIds = Array.isArray(body?.flaggedQuestionIds) ? (body.flaggedQuestionIds as string[]) : []

  const result = await submitExamAttempt(attemptId, student.id, answers, flaggedQuestionIds)
  if (!result.ok) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  return NextResponse.json({ attemptId: result.attemptId })
}
