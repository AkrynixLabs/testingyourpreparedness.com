import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getCourseCatalog } from "@/lib/student/courses"
import { CourseCatalogView } from "./course-catalog-view"

export default async function StudentCoursesPage() {
  const session = await auth()
  const student = await prisma.student.findUnique({ where: { userId: session!.user.id } })

  const rows = await getCourseCatalog(student?.id ?? null)

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
