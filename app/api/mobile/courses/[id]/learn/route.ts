import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { getLearnContent } from "@/lib/student/courses"

// Enrollment is re-verified server-side inside getLearnContent, independent
// of the catalog/detail endpoints' own isEnrolled display flags - same
// "never trust that a screen only offered this because a list filtered
// correctly" rule the exam-attempt endpoints already follow.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const student = await prisma.student.findUnique({ where: { userId: authUser.id } })
  if (!student) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 })
  }

  const { id } = await params
  const course = await getLearnContent(id, student.id)
  if (!course) {
    return NextResponse.json({ error: "You're not enrolled in this course." }, { status: 403 })
  }

  return NextResponse.json(course)
}
