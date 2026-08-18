import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CourseDetailView } from "./course-detail-view"

export default async function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "super_admin") notFound()

  const { id } = await params

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      tutor: { include: { user: true } },
      program: true,
      modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
      enrollments: { include: { student: { include: { user: true } } }, orderBy: { enrolledAt: "desc" } },
      purchases: { where: { status: "completed" }, orderBy: { createdAt: "desc" } },
    },
  })
  if (!course) notFound()

  const totalRevenue = course.purchases.reduce((sum, p) => sum + p.amount, 0)
  const totalPlatformFee = course.purchases.reduce((sum, p) => sum + p.platformFee, 0)
  const totalTutorPayout = course.purchases.reduce((sum, p) => sum + p.tutorPayout, 0)

  // Strip passwordHash before crossing the RSC boundary - found by a
  // security audit 2026-08-08 (see docs/build-log.md), never rendered but
  // must never reach the client bundle's props at all, even unrendered.
  const { passwordHash: _tutorPwHash, ...safeTutorUser } = course.tutor.user
  const safeCourse = {
    ...course,
    tutor: { ...course.tutor, user: safeTutorUser },
    enrollments: course.enrollments.map((e) => {
      const { passwordHash: _studentPwHash, ...safeStudentUser } = e.student.user
      return { ...e, student: { ...e.student, user: safeStudentUser } }
    }),
  }

  return (
    <CourseDetailView
      course={safeCourse}
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
