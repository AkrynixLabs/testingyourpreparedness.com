"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Award,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  FileText,
} from "lucide-react"

const results = [
  {
    id: 1,
    title: "Mathematics Mock Exam 2",
    subject: "Mathematics",
    score: 78,
    totalMarks: 100,
    date: "Mar 10, 2026",
    duration: "1h 45m",
    rank: 5,
    totalStudents: 45,
    correctAnswers: 39,
    totalQuestions: 50,
    trend: "up",
  },
  {
    id: 2,
    title: "Social Studies Practice Test",
    subject: "Social Studies",
    score: 65,
    totalMarks: 80,
    date: "Mar 8, 2026",
    duration: "1h 20m",
    rank: 12,
    totalStudents: 45,
    correctAnswers: 26,
    totalQuestions: 40,
    trend: "down",
  },
  {
    id: 3,
    title: "ICT Assessment",
    subject: "ICT",
    score: 42,
    totalMarks: 50,
    date: "Mar 5, 2026",
    duration: "50m",
    rank: 3,
    totalStudents: 45,
    correctAnswers: 21,
    totalQuestions: 25,
    trend: "up",
  },
  {
    id: 4,
    title: "English Language Test 2",
    subject: "English",
    score: 72,
    totalMarks: 100,
    date: "Mar 2, 2026",
    duration: "1h 30m",
    rank: 8,
    totalStudents: 45,
    correctAnswers: 36,
    totalQuestions: 50,
    trend: "up",
  },
  {
    id: 5,
    title: "Integrated Science Quiz 4",
    subject: "Science",
    score: 85,
    totalMarks: 100,
    date: "Feb 28, 2026",
    duration: "1h",
    rank: 2,
    totalStudents: 45,
    correctAnswers: 34,
    totalQuestions: 40,
    trend: "up",
  },
  {
    id: 6,
    title: "Mathematics Mock Exam 1",
    subject: "Mathematics",
    score: 68,
    totalMarks: 100,
    date: "Feb 25, 2026",
    duration: "1h 50m",
    rank: 10,
    totalStudents: 45,
    correctAnswers: 34,
    totalQuestions: 50,
    trend: "down",
  },
]

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

export default function StudentResultsPage() {
  // Calculate overall stats
  const totalExams = results.length
  const averageScore = Math.round(
    results.reduce((acc, r) => acc + (r.score / r.totalMarks) * 100, 0) / totalExams
  )
  const bestScore = Math.max(...results.map((r) => (r.score / r.totalMarks) * 100))
  const averageRank = Math.round(
    results.reduce((acc, r) => acc + r.rank, 0) / totalExams
  )

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
                <p className="text-2xl font-bold text-emerald-600">{Math.round(bestScore)}%</p>
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
                <p className="text-2xl font-bold">#{averageRank}</p>
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
            {results.map((result) => {
              const percentage = Math.round((result.score / result.totalMarks) * 100)
              const grade = getGrade(percentage)

              return (
                <div
                  key={result.id}
                  className="rounded-lg border p-4 transition-all hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{result.title}</h3>
                        <Badge variant="secondary">{result.subject}</Badge>
                        {result.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {result.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {result.duration}
                        </span>
                        <span>
                          {result.correctAnswers}/{result.totalQuestions} correct
                        </span>
                      </div>
                      <div className="max-w-md">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Score</span>
                          <span className="font-medium">
                            {result.score}/{result.totalMarks}
                          </span>
                        </div>
                        <Progress
                          value={percentage}
                          className={`h-2 [&>div]:${getScoreBg(percentage)}`}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div
                          className={`text-4xl font-bold ${getScoreColor(percentage)}`}
                        >
                          {percentage}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Grade: <span className="font-semibold">{grade}</span>
                        </div>
                      </div>
                      <div className="text-center border-l pl-6">
                        <div className="text-2xl font-bold text-primary">
                          #{result.rank}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          of {result.totalStudents}
                        </div>
                      </div>
                      <Link href={`/student/results/${result.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
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
