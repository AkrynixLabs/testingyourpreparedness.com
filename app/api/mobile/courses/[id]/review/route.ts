import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { submitCourseReviewForStudent } from "@/lib/student/courses"

// Mirrors app/student/courses/actions.ts's submitCourseReview - the mobile
// half of the review-submission fast-follow flagged when the course
// marketplace first landed on the Flutter client. Same upsert-by-enrollment
// rule as web: a student can revise their own review later, and can only
// review a course they're actually enrolled in (enforced inside
// submitCourseReviewForStudent, not duplicated here).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const student = await prisma.student.findUnique({ where: { userId: authUser.id } })
  if (!student) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 })
  }

  const { id } = await params
  const body = await request.json().catch(() => null)
  const rating = typeof body?.rating === "number" ? body.rating : null
  const comment = typeof body?.comment === "string" ? body.comment : ""
  if (rating === null) {
    return NextResponse.json({ error: "Rating is required." }, { status: 400 })
  }

  try {
    await submitCourseReviewForStudent(student.id, { courseId: id, rating, comment })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to submit review." }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
