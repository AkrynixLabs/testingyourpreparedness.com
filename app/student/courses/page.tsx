import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CourseCatalogView } from "./course-catalog-view"

export default async function StudentCoursesPage() {
  const session = await auth()
  const student = await prisma.student.findUnique({ where: { userId: session!.user.id } })

  const [courses, myEnrollments] = await Promise.all([
    prisma.course.findMany({
      where: { status: "published" },
      include: {
        tutor: { include: { user: true } },
        _count: { select: { enrollments: true, modules: true, reviews: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { publishedAt: "desc" },
    }),
    student
      ? prisma.enrollment.findMany({ where: { studentId: student.id }, select: { courseId: true } })
      : Promise.resolve([]),
  ])

  const enrolledIds = new Set(myEnrollments.map((e) => e.courseId))

  const rows = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    price: c.price,
    thumbnailUrl: c.thumbnailUrl,
    tutorName: c.tutor.user.name,
    studentCount: c._count.enrollments,
    moduleCount: c._count.modules,
    isEnrolled: enrolledIds.has(c.id),
    reviewCount: c._count.reviews,
    averageRating: c.reviews.length > 0 ? c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length : null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Browse Courses</h1>
        <p className="text-muted-foreground mt-1">Real courses from independent tutors - a la carte, no subscription needed.</p>
      </div>
      <CourseCatalogView courses={rows} />
    </div>
  )
}
