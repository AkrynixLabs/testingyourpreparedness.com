import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { recordTabSwitchForAttempt } from "@/lib/student/exam-attempt"

// Anti-cheat: logs an app-backgrounding event during an in-progress attempt
// (mobile's equivalent of the web app's tab-switch/visibilitychange
// listener - see CLAUDE.md's "just log it" decision). Never blocks or
// interrupts the exam. Deliberately always 200s even on a bad/stale
// attemptId - this fires from a background lifecycle listener with no
// meaningful way to surface an error to the student mid-exam.
export async function POST(request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const student = await prisma.student.findUnique({ where: { userId: authUser.id } })
  if (!student) {
    return NextResponse.json({ ok: true })
  }

  const { attemptId } = await params
  await recordTabSwitchForAttempt(attemptId, student.id)

  return NextResponse.json({ ok: true })
}
