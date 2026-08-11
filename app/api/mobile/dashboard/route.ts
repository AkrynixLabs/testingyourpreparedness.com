import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { getStudentDashboard } from "@/lib/student/dashboard-stats"

// Mirrors the web app's student dashboard stats (app/student/page.tsx) via
// the shared lib/student/dashboard-stats.ts function - average score, study
// streak, class rank (school students only), a 6-month performance trend,
// per-subject strengths, and the 3 most recent results. Deliberately does
// NOT include the web dashboard's "upcoming exams" preview - GET
// /api/mobile/exams already covers available/scheduled exams in full, so
// this isn't a second, narrower copy of the same data.
//
// Note: there is no student-facing "leaderboard" anywhere in the web app
// (only school-admin/super-admin see a full ranked list) - `classRank` here
// is the same single-number rank-among-classmates stat the web dashboard
// shows, not a leaderboard. Not building a mobile leaderboard endpoint
// without a real web equivalent to mirror, per this project's "the frontend
// is the source of truth for product behavior" rule.
export async function GET(request: Request) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const student = await prisma.student.findUnique({ where: { userId: authUser.id } })
  if (!student) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 })
  }

  const dashboard = await getStudentDashboard(student)
  return NextResponse.json(dashboard)
}
