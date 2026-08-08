import { prisma } from "@/lib/prisma"
import { LiveActivityView } from "./live-activity-view"

export default async function LiveActivityPage() {
  const attempts = await prisma.examAttempt.findMany({
    include: {
      student: { include: { user: true, school: true } },
      assessment: { include: { subject: true } },
    },
    orderBy: { startedAt: "desc" },
    take: 50,
  })

  const inProgress = attempts.filter((a) => a.submittedAt === null)

  const events = attempts.slice(0, 20).map((a) => ({
    id: a.id,
    studentName: a.student.user.name,
    schoolName: a.student.school?.name ?? "Independent",
    subject: a.assessment.subject.name,
    inProgress: a.submittedAt === null,
    score:
      a.score !== null && a.totalMarks ? Math.round((a.score / a.totalMarks) * 100) : null,
    timestamp: a.submittedAt ?? a.startedAt,
    flaggedForReview: a.flaggedForReview,
    tabSwitchCount: a.tabSwitchCount,
  }))

  const schoolCounts = new Map<string, { name: string; region: string; count: number }>()
  for (const a of inProgress) {
    if (!a.student.school) continue
    const entry = schoolCounts.get(a.student.school.id) ?? {
      name: a.student.school.name,
      region: a.student.school.region,
      count: 0,
    }
    entry.count += 1
    schoolCounts.set(a.student.school.id, entry)
  }
  const activeSchools = Array.from(schoolCounts.values()).sort((a, b) => b.count - a.count)

  const subjectCounts = new Map<string, number>()
  for (const a of inProgress) {
    subjectCounts.set(a.assessment.subject.name, (subjectCounts.get(a.assessment.subject.name) ?? 0) + 1)
  }
  const examsBySubject = Array.from(subjectCounts.entries())
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count)

  const regionCounts = new Map<string, number>()
  for (const a of inProgress) {
    if (!a.student.school) continue
    regionCounts.set(a.student.school.region, (regionCounts.get(a.student.school.region) ?? 0) + 1)
  }
  const total = inProgress.length
  const regionActivity = Array.from(regionCounts.entries())
    .map(([region, count]) => ({ region, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)

  const distinctSchoolsWithActivity = new Set(inProgress.map((a) => a.student.schoolId).filter(Boolean)).size

  return (
    <LiveActivityView
      events={events}
      activeSchools={activeSchools}
      examsBySubject={examsBySubject}
      regionActivity={regionActivity}
      stats={{
        examsInProgress: inProgress.length,
        schoolsWithActivity: distinctSchoolsWithActivity,
      }}
    />
  )
}
