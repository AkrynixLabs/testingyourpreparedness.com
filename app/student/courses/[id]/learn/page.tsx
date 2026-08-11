import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getLearnContent } from "@/lib/student/courses"
import { LessonViewer } from "./lesson-viewer"

// Enrollment is re-verified server-side here too (inside getLearnContent),
// independently of the detail page's own display logic - same "never trust
// that a link only appeared because a list page filtered it correctly" rule
// already applied to student/exams/[id]/start.
export default async function LearnCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const student = await prisma.student.findUnique({ where: { userId: session!.user.id } })
  if (!student) notFound()

  const course = await getLearnContent(id, student.id)
  // getLearnContent returns null for both "not enrolled" and "course
  // doesn't exist" - redirecting to the detail page is the right answer for
  // both (it 404s there for a nonexistent course, or offers enrollment for
  // a real one the student hasn't bought yet).
  if (!course) redirect(`/student/courses/${id}`)

  return <LessonViewer course={course} />
}
