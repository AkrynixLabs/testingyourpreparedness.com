import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { SuperAdminShell } from "./super-admin-shell"

// Nav badge counts, reusing the exact same definitions each destination page
// already computes for its own stats (see build-log.md's nav-badge entry) -
// batched in small groups rather than one big Promise.all, matching this
// project's own documented Neon-concurrency limit (review-queue's entry).
export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  const [totalSchools, totalStudents, pendingQuestions, pendingAssessments] = await Promise.all([
    prisma.school.count(),
    prisma.student.count(),
    prisma.question.count({ where: { status: "pending" } }),
    prisma.assessment.count({ where: { status: "pending" } }),
  ])
  const [approvedQuestions, totalContentAdmins, totalTutors, totalCourses] = await Promise.all([
    prisma.question.count({ where: { status: "approved" } }),
    prisma.contentAdminProfile.count(),
    prisma.tutorProfile.count(),
    prisma.course.count(),
  ])
  const [overdueInvoices, examsInProgress] = await Promise.all([
    prisma.invoice.count({ where: { status: "overdue" } }),
    prisma.examAttempt.count({ where: { submittedAt: null } }),
  ])

  return (
    <SuperAdminShell
      userName={session?.user?.name ?? "Super Admin"}
      userEmail={session?.user?.email ?? ""}
      counts={{
        schools: totalSchools,
        students: totalStudents,
        reviewQueue: pendingQuestions + pendingAssessments,
        questionBank: approvedQuestions,
        contentAdmins: totalContentAdmins,
        tutors: totalTutors,
        courses: totalCourses,
        overdueInvoices,
        examsInProgress,
      }}
    >
      {children}
    </SuperAdminShell>
  )
}
