import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getStudentDashboard } from "@/lib/student/dashboard-stats"
import { StudentDashboardView } from "./student-dashboard-view"

export default async function StudentDashboard() {
  const session = await auth()
  const student = await prisma.student.findUnique({
    where: { userId: session!.user.id },
    include: { user: true, class: true },
  })

  if (!student) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">No student profile found for this account.</p>
      </div>
    )
  }

  const { stats, performanceTrend, subjectStrengths, recentResults } = await getStudentDashboard(student)

  // Upcoming exams (trimmed to a handful for the dashboard) - same eligibility
  // logic as student/exams's own page, duplicated rather than shared since
  // this only needs a capped preview, not the full available/scheduled split.
  const now = new Date()
  const upcoming: {
    id: string
    title: string
    subjectName: string
    duration: number
    when: string
    isAvailable: boolean
  }[] = []

  if (student.enrollmentType === "school" && student.schoolId) {
    const assignments = await prisma.assessmentAssignment.findMany({
      where: {
        schoolId: student.schoolId,
        OR: [
          { students: { some: { studentId: student.id } } },
          ...(student.classId ? [{ classes: { some: { classId: student.classId } } }] : []),
        ],
        status: { in: ["scheduled", "active"] },
      },
      include: {
        assessment: { include: { subject: true } },
        examAttempts: { where: { studentId: student.id, submittedAt: { not: null } } },
      },
      orderBy: { startDate: "asc" },
      take: 5,
    })
    for (const assignment of assignments) {
      const withinWindow = now >= assignment.startDate && now <= assignment.endDate
      const attemptsUsed = assignment.examAttempts.length
      const canAttempt = assignment.allowRetake ? assignment.maxAttempts === null || attemptsUsed < assignment.maxAttempts : attemptsUsed === 0
      if (assignment.status === "active" && !(withinWindow && canAttempt)) continue

      upcoming.push({
        id: assignment.assessment.id,
        title: assignment.assessment.title,
        subjectName: assignment.assessment.subject.name,
        duration: assignment.assessment.duration,
        when: assignment.status === "scheduled" ? assignment.startDate.toLocaleDateString() : "Available now",
        isAvailable: assignment.status === "active" && withinWindow && canAttempt,
      })
    }
  } else {
    const published = await prisma.assessment.findMany({
      where: { status: "published" },
      include: { subject: true },
      orderBy: { title: "asc" },
      take: 3,
    })
    for (const a of published) {
      upcoming.push({
        id: a.id,
        title: a.title,
        subjectName: a.subject.name,
        duration: a.duration,
        when: "Available now",
        isAvailable: true,
      })
    }
  }

  return (
    <StudentDashboardView
      studentName={student.user.name}
      stats={stats}
      performanceTrend={performanceTrend}
      subjectStrengths={subjectStrengths}
      upcoming={upcoming.slice(0, 3)}
      recentResults={recentResults}
    />
  )
}
