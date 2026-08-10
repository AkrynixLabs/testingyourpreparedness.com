import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { CoursesTable } from "./courses-table"

export default async function CoursesPage() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") notFound()

  const courses = await prisma.course.findMany({
    orderBy: { publishedAt: "desc" },
    include: {
      tutor: { include: { user: true } },
      _count: { select: { enrollments: true } },
    },
  })

  const totalCourses = courses.length
  const publishedCount = courses.filter((c) => c.status === "published").length
  const flaggedCount = courses.filter((c) => c.status === "flagged").length
  const removedCount = courses.filter((c) => c.status === "removed").length

  // Strip passwordHash off each course's tutor.user before crossing the RSC
  // boundary - found by a security audit 2026-08-08 (see docs/build-log.md).
  const safeCourses = courses.map((c) => {
    const { passwordHash: _pwHash, ...safeUser } = c.tutor.user
    return { ...c, tutor: { ...c.tutor, user: safeUser } }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">
            Moderate courses across all tutors - publish-first, moderate-after
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Courses</p>
            <p className="text-2xl font-bold">{totalCourses}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Published</p>
            <p className="text-2xl font-bold text-emerald-600">{publishedCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Flagged</p>
            <p className="text-2xl font-bold text-amber-600">{flaggedCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Removed</p>
            <p className="text-2xl font-bold text-red-600">{removedCount}</p>
          </CardContent>
        </Card>
      </div>

      <CoursesTable courses={safeCourses} />
    </div>
  )
}
