import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CourseDetailView } from "./course-detail-view"

export default async function TutorCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const tutor = await prisma.tutorProfile.findUnique({ where: { userId: session!.user.id } })
  if (!tutor) notFound()

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      program: true,
      modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
      enrollments: { include: { student: { include: { user: true } } }, orderBy: { enrolledAt: "desc" } },
      purchases: { where: { status: "completed" } },
      reviews: { select: { rating: true } },
      virtualSessions: { where: { status: { not: "cancelled" } }, orderBy: { scheduledAt: "asc" } },
    },
  })
  if (!course || course.tutorId !== tutor.id) notFound()

  const totalRevenue = course.purchases.reduce((sum, p) => sum + p.tutorPayout, 0)
  const averageRating =
    course.reviews.length > 0 ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length : null

  return (
    <CourseDetailView
      course={{
        id: course.id,
        title: course.title,
        description: course.description,
        programName: course.program?.name ?? "Uncategorized",
        price: course.price,
        status: course.status,
        modules: course.modules.map((m) => ({
          id: m.id,
          title: m.title,
          lessons: m.lessons.map((l) => ({ id: l.id, title: l.title, type: l.type })),
        })),
        enrollments: course.enrollments.map((e) => ({
          id: e.id,
          studentName: e.student.user.name,
          enrolledAt: e.enrolledAt.toISOString(),
        })),
        totalRevenue,
        averageRating,
        reviewCount: course.reviews.length,
        virtualSessions: course.virtualSessions.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          scheduledAt: s.scheduledAt.toISOString(),
          durationMinutes: s.durationMinutes,
          mode: s.mode,
          dailyRoomUrl: s.dailyRoomUrl,
          externalMeetingUrl: s.externalMeetingUrl,
          status: s.status,
        })),
      }}
    />
  )
}
