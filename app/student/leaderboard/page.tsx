import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getNationalLeaderboard, getClassLeaderboard } from "@/lib/student/leaderboard"
import { LeaderboardView } from "./leaderboard-view"

export default async function StudentLeaderboardPage() {
  const session = await auth()
  const student = await prisma.student.findUnique({
    where: { userId: session!.user.id },
    include: { class: true },
  })

  if (!student) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">No student profile found for this account.</p>
      </div>
    )
  }

  const [national, classBoard] = await Promise.all([
    getNationalLeaderboard(student.id, 50),
    student.classId ? getClassLeaderboard(student.classId, student.id, 50) : Promise.resolve(null),
  ])

  return <LeaderboardView national={national} classBoard={classBoard} className={student.class?.displayName ?? null} />
}
