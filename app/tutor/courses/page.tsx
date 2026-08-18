import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CoursesTable } from "./courses-table"

export default async function TutorCoursesPage() {
  const session = await auth()
  const tutor = await prisma.tutorProfile.findUnique({ where: { userId: session!.user.id } })
  if (!tutor) notFound()

  const courses = await prisma.course.findMany({
    where: { tutorId: tutor.id },
    include: { program: true, _count: { select: { enrollments: true, modules: true } } },
    orderBy: { publishedAt: "desc" },
  })

  const rows = courses.map((c) => ({
    id: c.id,
    title: c.title,
    programName: c.program?.name ?? "Uncategorized",
    price: c.price,
    status: c.status,
    students: c._count.enrollments,
    modules: c._count.modules,
    publishedAt: c.publishedAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground mt-1">Manage the courses you&apos;ve published.</p>
      </div>
      <CoursesTable courses={rows} />
    </div>
  )
}
