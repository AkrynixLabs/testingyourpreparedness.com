import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { markLessonCompleteForStudent } from "@/lib/student/lesson-progress"

// Backs the mobile lesson viewer's "Mark as complete" action - same shared
// lib/student/lesson-progress.ts function the web Server Action calls, not
// a second copy of the enrollment check/upsert/achievement-check.
export async function POST(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const student = await prisma.student.findUnique({ where: { userId: authUser.id } })
  if (!student) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 })
  }

  const { lessonId } = await params
  try {
    const { completedAt } = await markLessonCompleteForStudent(student.id, lessonId)
    return NextResponse.json({ completedAt })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not mark lesson complete." }, { status: 400 })
  }
}
