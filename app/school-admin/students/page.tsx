import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { StudentsTable } from "./students-table"
import { PendingJoinRequests } from "./pending-join-requests"

export default async function StudentsPage() {
  const session = await auth()

  // Tenant scoping: a School Admin only ever sees their own school's
  // students, resolved server-side from their SchoolAdmin record - never
  // from a client-supplied schoolId. See CLAUDE.md / NFR-SEC-1.
  const schoolAdmin = await prisma.schoolAdmin.findUnique({
    where: { userId: session!.user.id },
    select: { schoolId: true },
  })

  const [students, classes] = schoolAdmin
    ? await Promise.all([
        prisma.student.findMany({
          where: { schoolId: schoolAdmin.schoolId },
          include: {
            user: true,
            class: true,
            examAttempts: { select: { score: true, totalMarks: true } },
          },
          orderBy: { user: { name: "asc" } },
        }),
        prisma.class.findMany({
          where: { schoolId: schoolAdmin.schoolId },
          orderBy: { displayName: "asc" },
        }),
      ])
    : [[], []]

  const withAvgScore = students.map((student) => {
    const completed = student.examAttempts.filter((a) => a.score !== null && a.totalMarks)
    const avgScore =
      completed.length > 0
        ? Math.round(
            completed.reduce((acc, a) => acc + (a.score! / a.totalMarks!) * 100, 0) / completed.length
          )
        : null
    // Strip passwordHash off the nested user before crossing the RSC
    // boundary - found by a security audit 2026-08-08 (see docs/build-log.md).
    const { passwordHash: _pwHash, ...safeUser } = student.user
    return {
      ...student,
      user: safeUser,
      avgScore,
      assessmentsTaken: student.examAttempts.length,
      // Flattened for DataTable's searchKey, which only does shallow
      // property access - it can't reach into student.user.name directly.
      name: student.user.name,
    }
  })

  // Pending join requests (school-code self-join, added 2026-08-16) aren't
  // real roster members yet - kept out of the stats/table below and shown
  // in their own approve/reject queue instead.
  const pendingRequests = withAvgScore.filter((s) => s.status === "pending")
  const rosterStudents = withAvgScore.filter((s) => s.status !== "pending")

  const totalStudents = rosterStudents.length
  const form3Count = rosterStudents.filter((s) => s.class?.form === 3).length
  const form2Count = rosterStudents.filter((s) => s.class?.form === 2).length
  const scored = rosterStudents.filter((s) => s.avgScore !== null)
  const avgScore =
    scored.length > 0
      ? Math.round(scored.reduce((acc, s) => acc + (s.avgScore ?? 0), 0) / scored.length)
      : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Learners</h1>
          <p className="text-muted-foreground">
            Manage and monitor your school&apos;s students
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Export moved into students-table.tsx (a real handler, exports
              the currently-filtered rows) - it can't have a real onClick
              here since this is a Server Component. Found dead by a
              dead-UI-elements audit 2026-08-08, see docs/build-log.md. */}
          <Button asChild>
            <Link href="/school-admin/students/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Students
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Learners</p>
            <p className="text-2xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Form 3</p>
            <p className="text-2xl font-bold">{form3Count}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Form 2</p>
            <p className="text-2xl font-bold">{form2Count}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg. Score</p>
            <p className="text-2xl font-bold">{avgScore !== null ? `${avgScore}%` : "-"}</p>
          </CardContent>
        </Card>
      </div>

      {pendingRequests.length > 0 && <PendingJoinRequests requests={pendingRequests} />}

      <StudentsTable students={rosterStudents} classes={classes} />
    </div>
  )
}
