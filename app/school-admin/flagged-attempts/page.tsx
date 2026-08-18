import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { FlaggedAttemptsView } from "./flagged-attempts-view"

// Closes a real gap found during an anti-cheat audit (2026-08-18): tab-switch
// logging/flaggedForReview (lib/student/exam-attempt.ts's recordTabSwitchForAttempt)
// was only ever surfaced to a super admin, via app/super-admin/live-activity's
// most-recent-50-platform-wide snapshot - a school admin had no way to see or
// filter which of their OWN school's attempts got flagged. Same tenant-scoping
// pattern as every other school-admin page (never trust a client-supplied
// schoolId, resolve it server-side from the session).
export default async function FlaggedAttemptsPage() {
  const session = await auth()
  const schoolAdmin = await prisma.schoolAdmin.findUnique({
    where: { userId: session!.user.id },
    select: { schoolId: true },
  })
  if (!schoolAdmin) notFound()

  const [attempts, classes] = await Promise.all([
    prisma.examAttempt.findMany({
      where: {
        student: { schoolId: schoolAdmin.schoolId },
        OR: [{ flaggedForReview: true }, { tabSwitchCount: { gt: 0 } }],
      },
      include: {
        student: { include: { user: true, class: true } },
        assessment: { include: { subject: true } },
      },
      orderBy: { startedAt: "desc" },
    }),
    prisma.class.findMany({ where: { schoolId: schoolAdmin.schoolId }, orderBy: [{ form: "asc" }, { section: "asc" }] }),
  ])

  const rows = attempts.map((a) => ({
    id: a.id,
    studentName: a.student.user.name,
    className: a.student.class?.displayName ?? "Unassigned",
    classId: a.student.classId,
    subjectName: a.assessment.subject.name,
    assessmentTitle: a.assessment.title,
    tabSwitchCount: a.tabSwitchCount,
    flaggedForReview: a.flaggedForReview,
    inProgress: a.submittedAt === null,
    score: a.score !== null && a.totalMarks ? Math.round((a.score / a.totalMarks) * 100) : null,
    startedAt: a.startedAt,
    submittedAt: a.submittedAt,
  }))

  return (
    <FlaggedAttemptsView
      attempts={rows}
      classes={classes.map((c) => ({ id: c.id, displayName: c.displayName }))}
      stats={{
        totalFlagged: rows.filter((r) => r.flaggedForReview).length,
        totalWithSwitches: rows.length,
      }}
    />
  )
}
