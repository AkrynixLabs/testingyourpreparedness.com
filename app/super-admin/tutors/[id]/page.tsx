import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { TutorDetailView } from "./tutor-detail-view"

export default async function TutorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const tutor = await prisma.tutorProfile.findUnique({
    where: { id },
    include: {
      user: true,
      courses: {
        orderBy: { publishedAt: "desc" },
        include: {
          _count: { select: { enrollments: true } },
          purchases: { where: { status: "completed" } },
        },
      },
    },
  })
  if (!tutor) notFound()

  // Same tutorPayout-sum approach already used on /tutor's dashboard and
  // super-admin/tutors' list page - reused here, not reinvented.
  const courseRows = tutor.courses.map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    price: c.price,
    status: c.status,
    publishedAt: c.publishedAt,
    enrollmentCount: c._count.enrollments,
    revenue: c.purchases.reduce((sum, p) => sum + p.amount, 0),
    earnings: c.purchases.reduce((sum, p) => sum + p.tutorPayout, 0),
  }))

  const totalCourses = courseRows.length
  const totalStudents = courseRows.reduce((sum, c) => sum + c.enrollmentCount, 0)
  const totalEarnings = courseRows.reduce((sum, c) => sum + c.earnings, 0)
  const totalRevenue = courseRows.reduce((sum, c) => sum + c.revenue, 0)

  return (
    <TutorDetailView
      tutor={tutor}
      courses={courseRows}
      stats={{ totalCourses, totalStudents, totalEarnings, totalRevenue }}
    />
  )
}
