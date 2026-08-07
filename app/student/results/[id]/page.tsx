import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Award,
  TrendingUp,
  BookOpen,
  AlertCircle,
} from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { TopicBreakdownChart } from "./topic-breakdown-chart"

const getGrade = (percentage: number) => {
  if (percentage >= 80) return "A"
  if (percentage >= 70) return "B"
  if (percentage >= 60) return "C"
  if (percentage >= 50) return "D"
  return "F"
}

export default async function ResultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  const student = await prisma.student.findUnique({ where: { userId: session!.user.id } })
  if (!student) notFound()

  const attempt = await prisma.examAttempt.findUnique({
    where: { id },
    include: {
      assessment: {
        include: {
          subject: true,
          questions: {
            include: { question: { include: { topic: true } } },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  })

  // Ownership check - never trust the route param alone. Also 404s on an
  // attempt that hasn't been submitted yet (that's the /start page's job,
  // not a "result" to review).
  if (!attempt || attempt.studentId !== student.id || !attempt.submittedAt) {
    notFound()
  }

  const score = attempt.score ?? 0
  const totalMarks = attempt.totalMarks ?? 0
  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0
  const grade = attempt.grade ?? getGrade(percentage)
  const answers = (attempt.answers ?? {}) as Record<string, number>

  const questionRows = attempt.assessment.questions.map(({ question: q }) => {
    const options = q.options as string[]
    const selectedIndex = answers[q.id]
    const isCorrect = selectedIndex !== undefined && selectedIndex === q.correctAnswerIndex
    return {
      id: q.id,
      text: q.text,
      topic: q.topic.name,
      yourAnswer: selectedIndex !== undefined ? options[selectedIndex] : "No answer",
      correctAnswer: options[q.correctAnswerIndex],
      isCorrect,
      explanation: q.explanation,
    }
  })

  const correctAnswers = questionRows.filter((q) => q.isCorrect).length
  const incorrectAnswers = questionRows.length - correctAnswers

  const topicMap = new Map<string, { correct: number; total: number }>()
  for (const q of questionRows) {
    const entry = topicMap.get(q.topic) ?? { correct: 0, total: 0 }
    entry.total += 1
    if (q.isCorrect) entry.correct += 1
    topicMap.set(q.topic, entry)
  }
  const topicBreakdown = Array.from(topicMap.entries()).map(([topic, { correct, total }]) => ({
    topic,
    correct,
    total,
    percentage: total > 0 ? (correct / total) * 100 : 0,
  }))

  // Class comparison, computed from every other submitted attempt on the
  // same Assessment - not stored fields, same approach as student/results.
  const allAttempts = await prisma.examAttempt.findMany({
    where: { assessmentId: attempt.assessmentId, submittedAt: { not: null }, score: { not: null }, totalMarks: { not: null } },
    select: { id: true, score: true, totalMarks: true },
  })
  const ranked = allAttempts
    .map((a) => ({ id: a.id, pct: a.totalMarks! > 0 ? (a.score! / a.totalMarks!) * 100 : 0 }))
    .sort((a, b) => b.pct - a.pct)
  const rank = ranked.findIndex((a) => a.id === attempt.id) + 1
  const totalStudents = ranked.length
  const percentile = totalStudents > 1 ? Math.round(((totalStudents - rank) / (totalStudents - 1)) * 100) : 100
  const classAverage = totalStudents > 0 ? Math.round(ranked.reduce((acc, a) => acc + a.pct, 0) / totalStudents) : 0
  const highestScore = totalStudents > 0 ? Math.round(ranked[0].pct) : 0
  const lowestScore = totalStudents > 0 ? Math.round(ranked[ranked.length - 1].pct) : 0

  const durationLabel =
    attempt.timeSpentSeconds !== null
      ? attempt.timeSpentSeconds >= 3600
        ? `${Math.floor(attempt.timeSpentSeconds / 3600)}h ${Math.round((attempt.timeSpentSeconds % 3600) / 60)}m`
        : `${Math.round(attempt.timeSpentSeconds / 60)} minutes`
      : "-"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/student/results">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{attempt.assessment.title}</h1>
          <p className="text-muted-foreground">
            Completed on {attempt.submittedAt.toLocaleDateString()} - {durationLabel} taken
          </p>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Score Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-around">
              {/* Main Score */}
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="h-40 w-40">
                    <circle className="text-muted stroke-current" strokeWidth="10" fill="transparent" r="60" cx="80" cy="80" />
                    <circle
                      className="text-primary stroke-current"
                      strokeWidth="10"
                      strokeLinecap="round"
                      fill="transparent"
                      r="60"
                      cx="80"
                      cy="80"
                      style={{
                        strokeDasharray: `${percentage * 3.77} 377`,
                        transform: "rotate(-90deg)",
                        transformOrigin: "50% 50%",
                      }}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-4xl font-bold">{percentage}%</div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                </div>
                <Badge className="mt-4 text-lg px-4 py-1" variant="secondary">
                  Grade: {grade}
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-emerald-500/10 p-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Correct</p>
                    <p className="text-xl font-bold text-emerald-600">{correctAnswers}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-red-500/10 p-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Incorrect</p>
                    <p className="text-xl font-bold text-red-600">{incorrectAnswers}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time Taken</p>
                    <p className="text-xl font-bold">{durationLabel}</p>
                  </div>
                </div>
              </div>

              {/* Ranking */}
              <div className="text-center">
                <div className="rounded-full bg-amber-500/10 p-6 inline-block">
                  <Award className="h-12 w-12 text-amber-500" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-primary">#{rank}</p>
                  <p className="text-sm text-muted-foreground">out of {totalStudents} students</p>
                </div>
                <p className="mt-2 text-sm">
                  Top <span className="font-semibold text-emerald-600">{percentile}%</span> percentile
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Class Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Class Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Your Score</span>
                <span className="font-bold text-primary">{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-3" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Class Average</span>
                <span className="font-medium">{classAverage}%</span>
              </div>
              <Progress value={classAverage} className="h-3 [&>div]:bg-muted-foreground" />
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Highest Score</span>
                <span className="font-medium text-emerald-600">{highestScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lowest Score</span>
                <span className="font-medium text-red-600">{lowestScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Position</span>
                <span className="font-medium">
                  {percentage > classAverage ? (
                    <span className="text-emerald-600">Above Average</span>
                  ) : (
                    <span className="text-amber-600">Below Average</span>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Performance by Topic
          </CardTitle>
          <CardDescription>See how you performed in each topic area</CardDescription>
        </CardHeader>
        <CardContent>
          {topicBreakdown.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No topic breakdown available.</p>
          ) : (
            <>
              <TopicBreakdownChart data={topicBreakdown} />
              <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {topicBreakdown.map((topic) => (
                  <div key={topic.topic} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{topic.topic}</p>
                      <p className="text-sm text-muted-foreground">{topic.correct}/{topic.total} correct</p>
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        topic.percentage >= 80 ? "text-emerald-600" : topic.percentage >= 60 ? "text-amber-600" : "text-red-600"
                      }`}
                    >
                      {Math.round(topic.percentage)}%
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Question Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Question Review
          </CardTitle>
          <CardDescription>Review your answers and learn from mistakes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionRows.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No questions to review.</p>
            )}
            {questionRows.map((question, index) => (
              <div
                key={question.id}
                className={`rounded-lg border p-4 ${
                  question.isCorrect ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`rounded-full p-1 ${question.isCorrect ? "bg-emerald-500" : "bg-red-500"}`}>
                    {question.isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : (
                      <XCircle className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Q{index + 1}.</span>
                      <Badge variant="outline" className="text-xs">{question.topic}</Badge>
                    </div>
                    <p className="font-medium mb-3">{question.text}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Your answer:</span>
                        <span className={question.isCorrect ? "font-medium text-emerald-600" : "font-medium text-red-600"}>
                          {question.yourAnswer}
                        </span>
                      </div>
                      {!question.isCorrect && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Correct answer:</span>
                            <span className="font-medium text-emerald-600">{question.correctAnswer}</span>
                          </div>
                          {question.explanation && (
                            <div className="mt-3 rounded-lg bg-background p-3 border">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="h-4 w-4 text-primary" />
                                <span className="font-medium text-sm">Explanation</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{question.explanation}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Link href="/student/exams">
          <Button variant="outline">Take Another Exam</Button>
        </Link>
        <Link href="/student/progress">
          <Button>View Progress Report</Button>
        </Link>
      </div>
    </div>
  )
}
