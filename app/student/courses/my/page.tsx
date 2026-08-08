import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { MyCoursesView } from "./my-courses-view"

export default async function MyCoursesPage() {
  const session = await auth()
  const student = await prisma.student.findUnique({ where: { userId: session!.user.id } })
  if (!student) notFound()

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: student.id },
    include: {
      course: {
        include: {
          tutor: { include: { user: true } },
          modules: { include: { lessons: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  })

  const rows = enrollments.map((e) => ({
    courseId: e.course.id,
    title: e.course.title,
    category: e.course.category,
    tutorName: e.course.tutor.user.name,
    enrolledAt: e.enrolledAt.toISOString(),
    lessonCount: e.course.modules.reduce((sum, m) => sum + m.lessons.length, 0),
    courseRemoved: e.course.status === "removed",
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground mt-1">Courses you&apos;ve enrolled in.</p>
      </div>
      <MyCoursesView enrollments={rows} />
    </div>
  )
}
