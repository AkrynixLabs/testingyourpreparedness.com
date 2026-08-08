import { notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Wallet, PlusCircle } from "lucide-react"

export default async function TutorDashboardPage() {
  const session = await auth()
  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId: session!.user.id },
    include: { user: true },
  })
  if (!tutor) notFound()

  const courses = await prisma.course.findMany({
    where: { tutorId: tutor.id },
    include: {
      _count: { select: { enrollments: true } },
      purchases: { where: { status: "completed" } },
    },
    orderBy: { publishedAt: "desc" },
  })

  const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0)
  const totalRevenue = courses.reduce(
    (sum, c) => sum + c.purchases.reduce((s, p) => s + p.tutorPayout, 0),
    0
  )

  const recentEnrollments = await prisma.enrollment.findMany({
    where: { course: { tutorId: tutor.id } },
    include: { student: { include: { user: true } }, course: true },
    orderBy: { enrolledAt: "desc" },
    take: 5,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {tutor.user.name}</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s how your courses are doing.</p>
        </div>
        <Button asChild>
          <Link href="/tutor/courses/create">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Course
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Earnings</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {totalRevenue}</div>
            <p className="text-xs text-muted-foreground mt-1">Your share after platform fees</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              You haven&apos;t created any courses yet.{" "}
              <Link href="/tutor/courses/create" className="text-primary hover:underline">
                Create your first course
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/tutor/courses/${course.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {course._count.enrollments} students · GHS {course.price}
                    </p>
                  </div>
                  <Badge variant={course.status === "published" ? "default" : course.status === "flagged" ? "destructive" : "secondary"}>
                    {course.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEnrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No enrollments yet.</p>
          ) : (
            <div className="space-y-3">
              {recentEnrollments.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <span>
                    <span className="font-medium">{e.student.user.name}</span> enrolled in {e.course.title}
                  </span>
                  <span className="text-muted-foreground">{e.enrolledAt.toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
