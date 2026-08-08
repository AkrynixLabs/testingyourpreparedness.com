"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatCard } from "@/components/stat-card"
import {
  BookOpen,
  Clock,
  Target,
  Award,
  TrendingUp,
  Play,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

type Stats = {
  examsCompleted: number
  averageScore: number | null
  classRank: { rank: number; totalStudents: number } | null
  studyHours: number
  currentStreak: number
}

export function StudentDashboardView({
  studentName,
  stats,
  performanceTrend,
  subjectStrengths,
  upcoming,
  recentResults,
}: {
  studentName: string
  stats: Stats
  performanceTrend: { month: string; score: number }[]
  subjectStrengths: { subject: string; score: number }[]
  upcoming: { id: string; title: string; subjectName: string; duration: number; when: string; isAvailable: boolean }[]
  recentResults: {
    attemptId: string
    title: string
    submittedAt: string
    score: number
    totalMarks: number
    rank: number
    totalStudents: number
  }[]
}) {
  const firstName = studentName.split(" ")[0]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {firstName}!</h1>
          <p className="text-muted-foreground mt-1">
            {stats.currentStreak > 0
              ? `Keep up the great work! You're on a ${stats.currentStreak}-day study streak.`
              : "Take an exam today to start a new study streak."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/student/exams">
            <Button size="lg" className="gap-2">
              <Play className="h-4 w-4" />
              Start Exam
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Exams Completed" value={String(stats.examsCompleted)} changeLabel="All time" icon={CheckCircle2} change={0} />
        <StatCard
          title="Average Score"
          value={stats.averageScore !== null ? `${stats.averageScore}%` : "-"}
          changeLabel="Across all exams"
          icon={Target}
          change={0}
        />
        <StatCard
          title="Class Rank"
          value={stats.classRank ? `#${stats.classRank.rank}` : "-"}
          changeLabel={stats.classRank ? `Out of ${stats.classRank.totalStudents} students` : "Not in a class"}
          icon={Award}
          change={0}
        />
        <StatCard title="Study Hours" value={`${stats.studyHours}h`} changeLabel="Time spent in exams" icon={Clock} change={0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance Trend
            </CardTitle>
            <CardDescription>Your average scores by month</CardDescription>
          </CardHeader>
          <CardContent>
            {performanceTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground py-16 text-center">Complete an exam to see your trend.</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Subject Strengths
            </CardTitle>
            <CardDescription>Your performance by subject</CardDescription>
          </CardHeader>
          <CardContent>
            {subjectStrengths.length === 0 ? (
              <p className="text-sm text-muted-foreground py-16 text-center">No data yet.</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={subjectStrengths.map((s) => ({ ...s, fullMark: 100 }))}>
                    <PolarGrid className="stroke-muted" />
                    <PolarAngleAxis dataKey="subject" className="text-xs" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                    <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Exams
                </CardTitle>
                <CardDescription>Your scheduled assessments</CardDescription>
              </div>
              <Link href="/student/exams">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No upcoming exams right now.</p>
            ) : (
              <div className="space-y-4">
                {upcoming.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{exam.title}</h4>
                        {exam.isAvailable && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">Available Now</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{exam.subjectName}</span>
                        <span>{exam.when}</span>
                        <span>{exam.duration} min</span>
                      </div>
                    </div>
                    <Link href={exam.isAvailable ? `/student/exams/${exam.id}/start` : "/student/exams"}>
                      <Button size="sm" variant={exam.isAvailable ? "default" : "outline"}>
                        {exam.isAvailable ? "Start" : "View"}
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Recent Results
                </CardTitle>
                <CardDescription>Your latest exam scores</CardDescription>
              </div>
              <Link href="/student/results">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentResults.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No completed exams yet.</p>
            ) : (
              <div className="space-y-4">
                {recentResults.map((result) => {
                  const percentage = result.totalMarks > 0 ? Math.round((result.score / result.totalMarks) * 100) : 0
                  return (
                    <Link key={result.attemptId} href={`/student/results/${result.attemptId}`}>
                      <div className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{result.title}</h4>
                            <p className="text-sm text-muted-foreground">{new Date(result.submittedAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{percentage}%</div>
                            <p className="text-xs text-muted-foreground">
                              Rank #{result.rank} of {result.totalStudents}
                            </p>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Subject Progress
          </CardTitle>
          <CardDescription>Track your preparation across subjects you&apos;ve been examined in</CardDescription>
        </CardHeader>
        <CardContent>
          {subjectStrengths.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Complete an exam to see subject progress.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subjectStrengths.map((subject) => (
                <div key={subject.subject} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{subject.subject}</h4>
                    <span className="text-sm font-semibold text-primary">{subject.score}%</span>
                  </div>
                  <Progress value={subject.score} className="h-2 mb-2" />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {subject.score >= 80 ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        <span>Excellent progress</span>
                      </>
                    ) : subject.score >= 60 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-amber-500" />
                        <span>Good progress</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        <span>Needs attention</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
