import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/lib/generated/prisma/client"

// Real student-facing leaderboards (national + class) - previously this
// project only had admin-facing ones (school-admin/leaderboard,
// super-admin/leaderboard); students only ever saw a single "class rank"
// number on their own dashboard (dashboard-stats.ts), never a ranked list of
// peers. Shared by the web page (app/student/leaderboard), the mobile route
// (app/api/mobile/leaderboard), and the achievement checker
// (lib/student/achievements.ts - "Top 5" and "National Star" both need a
// real rank, not just a count).

export type LeaderboardEntry = {
  studentId: string
  name: string
  schoolName: string | null
  avgScore: number
  examCount: number
  badgeCount: number
}

export type LeaderboardResult = {
  entries: LeaderboardEntry[]
  ownRank: { rank: number; totalStudents: number; entry: LeaderboardEntry } | null
}

async function rankStudents(
  where: Prisma.StudentWhereInput,
  studentId: string,
  limit: number
): Promise<LeaderboardResult> {
  // Fetches every matching student's full attempt list to average in memory
  // - same approach dashboard-stats.ts already uses for class rank. Fine at
  // this project's current (test/seed) scale; worth revisiting (e.g. a
  // materialized/cached ranking) if the active student count grows large,
  // since this runs on every leaderboard page view AND on every exam
  // submission via the achievement checker below.
  const students = await prisma.student.findMany({
    where: { ...where, status: "active" },
    select: {
      id: true,
      user: { select: { name: true } },
      school: { select: { name: true } },
      examAttempts: {
        where: { submittedAt: { not: null }, score: { not: null }, totalMarks: { not: null } },
        select: { score: true, totalMarks: true },
      },
      achievements: { select: { achievementId: true } },
    },
  })

  const ranked = students
    .map((s): LeaderboardEntry | null => {
      const scored = s.examAttempts
      if (scored.length === 0) return null
      const avgScore =
        Math.round((scored.reduce((sum, a) => sum + (a.score! / a.totalMarks!) * 100, 0) / scored.length) * 10) / 10
      return {
        studentId: s.id,
        name: s.user.name,
        schoolName: s.school?.name ?? null,
        avgScore,
        examCount: scored.length,
        badgeCount: s.achievements.length,
      }
    })
    .filter((e): e is LeaderboardEntry => e !== null)
    .sort((a, b) => b.avgScore - a.avgScore)

  const ownIndex = ranked.findIndex((e) => e.studentId === studentId)
  const ownRank = ownIndex !== -1 ? { rank: ownIndex + 1, totalStudents: ranked.length, entry: ranked[ownIndex] } : null

  return { entries: ranked.slice(0, limit), ownRank }
}

export async function getNationalLeaderboard(studentId: string, limit = 50): Promise<LeaderboardResult> {
  return rankStudents({}, studentId, limit)
}

export async function getClassLeaderboard(classId: string, studentId: string, limit = 50): Promise<LeaderboardResult> {
  return rankStudents({ classId }, studentId, limit)
}

// Rank-only helpers for the achievement checker - avoids building the full
// entries list when only the number is needed.
export async function getStudentNationalRank(studentId: string): Promise<number | null> {
  const { ownRank } = await rankStudents({}, studentId, 0)
  return ownRank?.rank ?? null
}

export async function getStudentClassRank(classId: string, studentId: string): Promise<number | null> {
  const { ownRank } = await rankStudents({ classId }, studentId, 0)
  return ownRank?.rank ?? null
}
