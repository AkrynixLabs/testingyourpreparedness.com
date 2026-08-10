import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { StatCard } from "@/components/stat-card"
import { Users, CheckCircle2, BookOpen, Wallet } from "lucide-react"
import { TutorsView } from "./tutors-view"

export default async function TutorsPage() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") notFound()

  const profiles = await prisma.tutorProfile.findMany({
    include: {
      user: true,
      courses: {
        include: {
          _count: { select: { enrollments: true } },
          purchases: { where: { status: "completed" } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  // Same tutorPayout-sum approach already used on /tutor's own dashboard -
  // reused here, not reinvented.
  const tutors = profiles.map((profile) => {
    const courseCount = profile.courses.length
    const totalStudents = profile.courses.reduce((sum, c) => sum + c._count.enrollments, 0)
    const totalEarnings = profile.courses.reduce(
      (sum, c) => sum + c.purchases.reduce((s, p) => s + p.tutorPayout, 0),
      0
    )
    // Strip passwordHash off the nested user before crossing the RSC
    // boundary - found by a security audit 2026-08-08 (see docs/build-log.md).
    const { passwordHash: _pwHash, ...safeUser } = profile.user
    return { ...profile, user: safeUser, courseCount, totalStudents, totalEarnings }
  })

  const totalTutors = tutors.length
  const activeTutors = tutors.filter((t) => t.status === "active").length
  const totalCourses = tutors.reduce((sum, t) => sum + t.courseCount, 0)
  const totalEarnings = tutors.reduce((sum, t) => sum + t.totalEarnings, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tutors</h1>
        <p className="text-muted-foreground">Manage tutors publishing courses on the platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Tutors" value={totalTutors.toString()} changeLabel="Publishing courses" icon={Users} />
        <StatCard title="Active Tutors" value={activeTutors.toString()} changeLabel="Currently active" icon={CheckCircle2} />
        <StatCard title="Total Courses" value={totalCourses.toString()} changeLabel="Across all tutors" icon={BookOpen} />
        <StatCard title="Total Earnings" value={`GHS ${totalEarnings.toLocaleString()}`} changeLabel="Tutor payouts, all courses" icon={Wallet} />
      </div>

      <TutorsView tutors={tutors} />
    </div>
  )
}
