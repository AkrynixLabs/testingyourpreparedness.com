import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CourseDetailPurchaseView } from "./course-detail-purchase-view"

export default async function StudentCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const student = await prisma.student.findUnique({ where: { userId: session!.user.id } })

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      tutor: { include: { user: true } },
      modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
      _count: { select: { enrollments: true } },
      reviews: { include: { student: { include: { user: true } } }, orderBy: { createdAt: "desc" } },
    },
  })
  // A flagged course is still viewable (moderation review, not a takedown);
  // removed or nonexistent is a real 404 - matches CourseStatus's own
  // "flagged = visible pending review" comment in schema.prisma.
  if (!course || course.status === "removed") notFound()

  const enrollment = student
    ? await prisma.enrollment.findUnique({ where: { courseId_studentId: { courseId: course.id, studentId: student.id } } })
    : null

  const myReview = student ? course.reviews.find((r) => r.studentId === student.id) : undefined
  const averageRating =
    course.reviews.length > 0 ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length : null

  return (
    <CourseDetailPurchaseView
      course={{
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        price: course.price,
        tutorName: course.tutor.user.name,
        tutorHeadline: course.tutor.headline,
        tutorBio: course.tutor.bio,
        studentCount: course._count.enrollments,
        modules: course.modules.map((m) => ({
          id: m.id,
          title: m.title,
          lessons: m.lessons.map((l) => ({ id: l.id, title: l.title, type: l.type })),
        })),
        isEnrolled: !!enrollment,
        averageRating,
        reviews: course.reviews.map((r) => ({
          id: r.id,
          studentName: r.student.user.name,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt.toISOString(),
          isMine: r.studentId === student?.id,
        })),
        myReview: myReview ? { rating: myReview.rating, comment: myReview.comment ?? "" } : null,
      }}
    />
  )
}
