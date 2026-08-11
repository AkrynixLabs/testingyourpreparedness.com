import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getMyCourses } from "@/lib/student/courses"
import { MyCoursesView } from "./my-courses-view"

export default async function MyCoursesPage() {
  const session = await auth()
  const student = await prisma.student.findUnique({ where: { userId: session!.user.id } })
  if (!student) notFound()

  const enrollments = await getMyCourses(student.id)
  const rows = enrollments.map((e) => ({ ...e, enrolledAt: e.enrolledAt.toISOString() }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground mt-1">Courses you&apos;ve enrolled in.</p>
      </div>
      <MyCoursesView enrollments={rows} />
    </div>
  )
}
