import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CourseDetailView } from "./course-detail-view"

export default async function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      tutor: { include: { user: true } },
      modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
      enrollments: { include: { student: { include: { user: true } } }, orderBy: { enrolledAt: "desc" } },
      purchases: { where: { status: "completed" }, orderBy: { createdAt: "desc" } },
    },
  })
  if (!course) notFound()

  const totalRevenue = course.purchases.reduce((sum, p) => sum + p.amount, 0)
  const totalPlatformFee = course.purchases.reduce((sum, p) => sum + p.platformFee, 0)
  const totalTutorPayout = course.purchases.reduce((sum, p) => sum + p.tutorPayout, 0)

  return (
    <CourseDetailView
      course={course}
      stats={{
        totalRevenue,
        totalPlatformFee,
        totalTutorPayout,
        enrollmentCount: course.enrollments.length,
        moduleCount: course.modules.length,
        lessonCount: course.modules.reduce((sum, m) => sum + m.lessons.length, 0),
      }}
    />
  )
}
