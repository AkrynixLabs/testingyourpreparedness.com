import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getCourseDetail } from "@/lib/student/courses"
import { CourseDetailPurchaseView } from "./course-detail-purchase-view"

export default async function StudentCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const student = await prisma.student.findUnique({ where: { userId: session!.user.id } })

  // A flagged course is still viewable (moderation review, not a takedown);
  // removed or nonexistent is a real 404 - matches CourseStatus's own
  // "flagged = visible pending review" comment in schema.prisma, and
  // getCourseDetail's own null contract for that case.
  const course = await getCourseDetail(id, student?.id ?? null)
  if (!course) notFound()

  return (
    <CourseDetailPurchaseView
      course={{
        ...course,
        reviews: course.reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
      }}
    />
  )
}
