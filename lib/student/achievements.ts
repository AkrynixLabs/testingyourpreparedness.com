import { prisma } from "@/lib/prisma"
import { computeStreak, hasNInWindow } from "./streak"
import { getStudentClassRank, getStudentNationalRank } from "./leaderboard"

// Real achievement-awarding logic. Previously `Achievement`/`StudentAchievement`
// existed only as data - the seed script's canonical 8-entry catalog
// (prisma/seed.ts's seedAchievements) was displayed as real on
// student/progress and student/profile, but nothing ever actually awarded
// one except the seed hardcoding 5 of them onto a single demo student
// ("Kwame Asante"). Every other student's badge shelf was permanently empty
// regardless of what they did. This makes the catalog real for every
// student, matched by Achievement.name against the seed's fixed 8 names
// (no separate machine-readable "key" column exists - name is already
// @unique, so matching on it is safe and avoids a schema migration).
//
// Called from lib/student/exam-attempt.ts's submitExamAttempt (the one
// shared grading function both the web and mobile submit routes call) right
// after an attempt is graded - so a badge can be earned from either client.

export async function checkAndAwardAchievements(studentId: string): Promise<{ id: string; name: string }[]> {
  const [attempts, existing, achievements, student] = await Promise.all([
    prisma.examAttempt.findMany({
      where: { studentId, submittedAt: { not: null }, score: { not: null }, totalMarks: { not: null } },
      include: { assessment: { include: { subject: true } } },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.studentAchievement.findMany({ where: { studentId }, select: { achievementId: true } }),
    prisma.achievement.findMany(),
    prisma.student.findUnique({ where: { id: studentId }, select: { classId: true } }),
  ])

  const earnedIds = new Set(existing.map((e) => e.achievementId))
  const remaining = achievements.filter((a) => !earnedIds.has(a.id))
  if (remaining.length === 0 || attempts.length === 0) return []

  const percentages = attempts.map((a) => (a.totalMarks! > 0 ? (a.score! / a.totalMarks!) * 100 : 0))
  const submittedDates = attempts.map((a) => a.submittedAt!)

  const bySubject = new Map<string, number[]>()
  attempts.forEach((a, i) => {
    const name = a.assessment.subject.name
    if (!bySubject.has(name)) bySubject.set(name, [])
    bySubject.get(name)!.push(percentages[i])
  })
  const subjectMaster =
    bySubject.size > 0 &&
    Array.from(bySubject.values()).every((scores) => scores.reduce((s, p) => s + p, 0) / scores.length >= 90)

  // Only the criteria cheap to check purely from this student's own attempts
  // - the cross-student rank ones (Top 5, National Star) are checked
  // separately below, and only when not already earned, to avoid a
  // platform-wide query on every single exam submission once earned once.
  const criteriaMet: Record<string, boolean> = {
    "Top Performer": percentages.filter((p) => p >= 90).length >= 5,
    "Perfect Score": attempts.some((a) => a.totalMarks! > 0 && a.score === a.totalMarks),
    "Study Streak": computeStreak(submittedDates) >= 7,
    "Consistency King": attempts.length >= 20,
    "Quick Learner": hasNInWindow(submittedDates, 10, 7),
    "Subject Master": subjectMaster,
  }

  const remainingByName = new Map(remaining.map((a) => [a.name, a]))

  if (remainingByName.has("Top 5") && student?.classId) {
    const rank = await getStudentClassRank(student.classId, studentId)
    criteriaMet["Top 5"] = rank !== null && rank <= 5
  }
  if (remainingByName.has("National Star")) {
    const rank = await getStudentNationalRank(studentId)
    criteriaMet["National Star"] = rank !== null && rank <= 100
  }

  const newlyEarned = remaining.filter((a) => criteriaMet[a.name])
  if (newlyEarned.length === 0) return []

  await prisma.studentAchievement.createMany({
    data: newlyEarned.map((a) => ({ studentId, achievementId: a.id })),
    skipDuplicates: true,
  })

  return newlyEarned.map((a) => ({ id: a.id, name: a.name }))
}
