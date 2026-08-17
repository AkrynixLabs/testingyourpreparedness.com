import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { getNationalLeaderboard, getClassLeaderboard } from "@/lib/student/leaderboard"

// Real student-facing leaderboard, closing the gap the mobile dashboard
// route's own comment used to flag ("no student-facing leaderboard anywhere
// in the web app to mirror instead"). That's no longer true as of
// app/student/leaderboard - this mirrors it via the same shared
// lib/student/leaderboard.ts functions, not a second copy of the ranking
// logic. No Flutter screen built against this yet - backend-only for now,
// same "ship the route, hand off the client" pattern as the mobile
// account-deletion routes.
export async function GET(request: Request) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const student = await prisma.student.findUnique({ where: { userId: authUser.id } })
  if (!student) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 })
  }

  const [national, classBoard] = await Promise.all([
    getNationalLeaderboard(student.id, 50),
    student.classId ? getClassLeaderboard(student.classId, student.id, 50) : Promise.resolve(null),
  ])

  return NextResponse.json({ national, classBoard })
}
