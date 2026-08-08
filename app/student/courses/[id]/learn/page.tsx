import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { LessonViewer } from "./lesson-viewer"

// Enrollment is re-verified server-side here too, independently of the
// detail page's own display logic - same "never trust that a link only
// appeared because a list page filtered it correctly" rule already applied
// to student/exams/[id]/start.
export default async function LearnCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const student = await prisma.student.findUnique({ where: { userId: session!.user.id } })
  if (!student) notFound()

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId: id, studentId: student.id } },
  })
  if (!enrollment) redirect(`/student/courses/${id}`)

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
    },
  })
  if (!course) notFound()

  return (
    <LessonViewer
      course={{
        id: course.id,
        title: course.title,
        modules: course.modules.map((m) => ({
          id: m.id,
          title: m.title,
          lessons: m.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            type: l.type,
            videoUrl: l.videoUrl,
            content: l.content,
          })),
        })),
      }}
    />
  )
}
