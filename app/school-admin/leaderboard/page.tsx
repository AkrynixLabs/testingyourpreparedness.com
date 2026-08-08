import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { LeaderboardView } from "./leaderboard-view"

export default async function SchoolLeaderboardPage() {
  const session = await auth()
  const schoolAdmin = await prisma.schoolAdmin.findUnique({
    where: { userId: session!.user.id },
    select: { schoolId: true },
  })
  if (!schoolAdmin) notFound()

  const students = await prisma.student.findMany({
    where: { schoolId: schoolAdmin.schoolId },
    include: {
      user: true,
      class: true,
      _count: { select: { achievements: true } },
      examAttempts: {
        where: { submittedAt: { not: null } },
        select: {
          score: true,
          totalMarks: true,
          submittedAt: true,
          assessment: { select: { subject: { select: { id: true, name: true } } } },
        },
      },
    },
    orderBy: { user: { name: "asc" } },
  })

  const classes = await prisma.class.findMany({
    where: { schoolId: schoolAdmin.schoolId },
    orderBy: [{ form: "asc" }, { section: "asc" }],
  })

  const rows = students.map((s) => ({
    id: s.id,
    name: s.user.name,
    classId: s.classId,
    className: s.class?.displayName ?? "No class",
    badgeCount: s._count.achievements,
    attempts: s.examAttempts
      .filter((a) => a.score !== null && a.totalMarks)
      .map((a) => ({
        score: a.score!,
        totalMarks: a.totalMarks!,
        submittedAt: a.submittedAt!.toISOString(),
        subjectId: a.assessment.subject.id,
        subjectName: a.assessment.subject.name,
      })),
  }))

  return <LeaderboardView students={rows} classes={classes} />
}
