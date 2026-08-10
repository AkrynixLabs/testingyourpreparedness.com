import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, TrendingUp, TrendingDown, Calendar, Clock, Target, FileText } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const getScoreColor = (percentage: number) => {
  if (percentage >= 80) return "text-emerald-600"
  if (percentage >= 60) return "text-amber-600"
  return "text-red-600"
}

const getScoreBg = (percentage: number) => {
  if (percentage >= 80) return "bg-emerald-500"
  if (percentage >= 60) return "bg-amber-500"
  return "bg-red-500"
}

const getGrade = (percentage: number) => {
  if (percentage >= 80) return "A"
  if (percentage >= 70) return "B"
  if (percentage >= 60) return "C"
  if (percentage >= 50) return "D"
  return "F"
}

// Rank isn't a stored field on ExamAttempt - computed here from every other
// submitted attempt on the same Assessment(s). Was previously one query PER
// attempt in a loop (a real N+1 - a student with 20 completed exams meant 20
// sequential round trips just for rank) - found by an N+1 audit 2026-08-08
// (see docs/build-log.md) and rewritten to one query covering every
// assessmentId the student has ever attempted, ranked in memory per group.
async function getRanks(entries: { assessmentId: string; attemptId: string }[]): Promise<Map<string, { rank: number; totalStudents: number }>> {
  const assessmentIds = Array.from(new Set(entries.map((e) => e.assessmentId)))
  const allAttempts = await prisma.examAttempt.findMany({
    where: { assessmentId: { in: assessmentIds }, submittedAt: { not: null }, score: { not: null }, totalMarks: { not: null } },
    select: { id: true, assessmentId: true, score: true, totalMarks: true },
  })

  const byAssessment = new Map<string, { id: string; pct: number }[]>()
  for (const a of allAttempts) {
    const pct = a.totalMarks! > 0 ? (a.score! / a.totalMarks!) * 100 : 0
    const group = byAssessment.get(a.assessmentId) ?? []
    group.push({ id: a.id, pct })
    byAssessment.set(a.assessmentId, group)
  }
  for (const group of byAssessment.values()) {
    group.sort((a, b) => b.pct - a.pct)
  }

  const result = new Map<string, { rank: number; totalStudents: number }>()
  for (const { assessmentId, attemptId } of entries) {
    const ranked = byAssessment.get(assessmentId) ?? []
    result.set(attemptId, { rank: ranked.findIndex((a) => a.id === attemptId) + 1, totalStudents: ranked.length })
  }
  return result
}

export default async function StudentResultsPage() {
  const session = await auth()
  const student = await prisma.student.findUnique({ where: { userId: session!.user.id } })

  if (!student) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Results</h1>
        <p className="text-muted-foreground">No student profile found for this account.</p>
      </div>
    )
  }

  const attempts = await prisma.examAttempt.findMany({
    where: { studentId: student.id, submittedAt: { not: null } },
    include: { assessment: { include: { subject: true } } },
    orderBy: { submittedAt: "desc" },
  })

  // Compute trend (vs. the previous attempt in the same subject) walking
  // oldest-first, then reverse back to newest-first for display.
  const chronological = [...attempts].reverse()
  const ranks = await getRanks(chronological.map((a) => ({ assessmentId: a.assessmentId, attemptId: a.id })))

  const previousPctBySubject: Record<string, number> = {}
  const results: {
    attemptId: string
    title: string
    subjectName: string
    score: number
    totalMarks: number
    submittedAt: Date
    timeSpentSeconds: number | null
    rank: number
    totalStudents: number
    trend: "up" | "down" | null
  }[] = []

  for (const attempt of chronological) {
    const score = attempt.score ?? 0
    const totalMarks = attempt.totalMarks ?? 0
    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0
    const subjectName = attempt.assessment.subject.name
    const prevPct = previousPctBySubject[subjectName]
    const trend: "up" | "down" | null = prevPct === undefined ? null : percentage >= prevPct ? "up" : "down"
    previousPctBySubject[subjectName] = percentage

    const { rank, totalStudents } = ranks.get(attempt.id) ?? { rank: 0, totalStudents: 0 }

    results.push({
      attemptId: attempt.id,
      title: attempt.assessment.title,
      subjectName,
      score,
      totalMarks,
      submittedAt: attempt.submittedAt!,
      timeSpentSeconds: attempt.timeSpentSeconds,
      rank,
      totalStudents,
      trend,
    })
  }
  results.reverse()

  const totalExams = results.length
  const percentages = results.map((r) => (r.totalMarks > 0 ? (r.score / r.totalMarks) * 100 : 0))
  const averageScore = totalExams > 0 ? Math.round(percentages.reduce((acc, p) => acc + p, 0) / totalExams) : 0
  const bestScore = totalExams > 0 ? Math.round(Math.max(...percentages)) : 0
  const averageRank = totalExams > 0 ? Math.round(results.reduce((acc, r) => acc + r.rank, 0) / totalExams) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Results</h1>
        <p className="text-muted-foreground mt-1">
          View your exam scores and performance history
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Exams</p>
                <p className="text-2xl font-bold">{totalExams}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                  {averageScore}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-emerald-500/10 p-3">
                <Award className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Best Score</p>
                <p className="text-2xl font-bold text-emerald-600">{bestScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Rank</p>
                <p className="text-2xl font-bold">{totalExams > 0 ? `#${averageRank}` : "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results List */}
      <Card>
        <CardHeader>
          <CardTitle>Exam History</CardTitle>
          <CardDescription>Your recent exam results and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No completed exams yet.
              </p>
            )}
            {results.map((result) => {
              const percentage = result.totalMarks > 0 ? Math.round((result.score / result.totalMarks) * 100) : 0
              const grade = getGrade(percentage)

              return (
                <div key={result.attemptId} className="rounded-lg border p-4 transition-all hover:shadow-md">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{result.title}</h3>
                        <Badge variant="secondary">{result.subjectName}</Badge>
                        {result.trend === "up" && <TrendingUp className="h-4 w-4 text-emerald-500" />}
                        {result.trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {result.submittedAt.toLocaleDateString()}
                        </span>
                        {result.timeSpentSeconds !== null && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {Math.round(result.timeSpentSeconds / 60)} min
                          </span>
                        )}
                      </div>
                      <div className="max-w-md">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Score</span>
                          <span className="font-medium">
                            {result.score}/{result.totalMarks}
                          </span>
                        </div>
                        <Progress value={percentage} className={`h-2 [&>div]:${getScoreBg(percentage)}`} />
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getScoreColor(percentage)}`}>{percentage}%</div>
                        <div className="text-sm text-muted-foreground">
                          Grade: <span className="font-semibold">{grade}</span>
                        </div>
                      </div>
                      <div className="text-center border-l pl-6">
                        <div className="text-2xl font-bold text-primary">#{result.rank}</div>
                        <div className="text-sm text-muted-foreground">of {result.totalStudents}</div>
                      </div>
                      <Link href={`/student/results/${result.attemptId}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
