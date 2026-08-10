import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { getResultDetail } from "@/lib/student/result-detail"

// Full result detail (score, grade, rank/percentile, topic breakdown,
// per-question review) - mirrors the web app's app/student/results/[id]
// page via the same shared lib/student/result-detail.ts function. The
// lighter-weight completed-exam summary list already lives in
// GET /api/mobile/exams's `completed` array; this is the drill-down.
export async function GET(request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const student = await prisma.student.findUnique({ where: { userId: authUser.id } })
  if (!student) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 })
  }

  const { attemptId } = await params
  const result = await getResultDetail(attemptId, student.id)
  if (!result) {
    return NextResponse.json({ error: "Result not found." }, { status: 404 })
  }

  return NextResponse.json(result)
}
