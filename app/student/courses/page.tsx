import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getCourseCatalog } from "@/lib/student/courses"
import { CourseCatalogView } from "./course-catalog-view"

export default async function StudentCoursesPage() {
  const session = await auth()
  const student = await prisma.student.findUnique({ where: { userId: session!.user.id } })

  // Always fetched in full (not derived from `rows`) so the filter shows
  // every real program - including one with zero courses right now - rather
  // than only whatever categories happened to exist among published
  // courses, per the 2026-08-18 course-taxonomy decision.
  const [rows, programs] = await Promise.all([
    getCourseCatalog(student?.id ?? null),
    prisma.program.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Browse Courses</h1>
        <p className="text-muted-foreground mt-1">Real courses from independent tutors - a la carte, no subscription needed.</p>
      </div>
      <CourseCatalogView courses={rows} programs={programs.map((p) => ({ id: p.id, name: p.name }))} />
    </div>
  )
}
