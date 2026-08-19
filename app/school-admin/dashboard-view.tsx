"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/stat-card"
import { Users, ClipboardList, TrendingUp, Target, ArrowRight } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

type Stats = { totalStudents: number; activeAssessments: number; averageScore: number | null; completionRate: number | null }

export function SchoolAdminDashboardView({
  schoolName,
  stats,
  classPerformance,
  monthlyProgress,
  topStudents,
  weakTopics,
  recentAssessments,
}: {
  schoolName: string
  stats: Stats
  classPerformance: { class: string; avgScore: number }[]
  monthlyProgress: { month: string; score: number }[]
  topStudents: { id: string; name: string; className: string; avgScore: number; assessmentsTaken: number }[]
  weakTopics: { topic: string; subject: string; avgScore: number }[]
  recentAssessments: { id: string; title: string; questionCount: number; duration: number; avgScore: number | null; attempts: number }[]
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">School Dashboard</h1>
          <p className="text-muted-foreground">{schoolName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/school-admin/students/add">Add Learners</Link>
          </Button>
          <Button asChild>
            <Link href="/school-admin/assessments/assign">Assign Assessment</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Learners" value={String(stats.totalStudents)} icon={Users} change={0} />
        <StatCard title="Active Assessments" value={String(stats.activeAssessments)} icon={ClipboardList} change={0} />
        <StatCard title="Average Score" value={stats.averageScore !== null ? `${stats.averageScore}%` : "-"} icon={TrendingUp} change={0} />
        <StatCard
          title="Completion Rate"
          value={stats.completionRate !== null ? `${stats.completionRate}%` : "-"}
          changeLabel="Learners with a submitted exam"
          icon={Target}
          change={0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Performance by Class</CardTitle>
            <CardDescription>Average scores across different classes</CardDescription>
          </CardHeader>
          <CardContent>
            {classPerformance.length === 0 ? (
              <p className="text-sm text-muted-foreground py-16 text-center">No exam data yet.</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="class" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                    <Bar dataKey="avgScore" fill="oklch(0.55 0.15 170)" radius={[4, 4, 0, 0]} name="Avg Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">School Progress</CardTitle>
            <CardDescription>Average score trend by month</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyProgress.length === 0 ? (
              <p className="text-sm text-muted-foreground py-16 text-center">No exam data yet.</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="score" stroke="oklch(0.55 0.15 170)" strokeWidth={2} dot={{ fill: "oklch(0.55 0.15 170)", strokeWidth: 2 }} name="Avg Score" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Top Learners</CardTitle>
              <CardDescription>Highest performing learners</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/school-admin/students">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {topStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No exam data yet.</p>
            ) : (
              <div className="space-y-4">
                {topStudents.map((student, index) => (
                  <div key={student.id} className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.className}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{student.avgScore}%</p>
                      <p className="text-xs text-muted-foreground">{student.assessmentsTaken} tests</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Areas for Improvement</CardTitle>
              <CardDescription>Topics with lowest average correctness</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/school-admin/results">
                View details
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {weakTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No exam data yet.</p>
            ) : (
              <div className="space-y-4">
                {weakTopics.map((topic) => (
                  <div key={topic.topic} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{topic.topic}</p>
                        <p className="text-sm text-muted-foreground">{topic.subject}</p>
                      </div>
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        {topic.avgScore}%
                      </Badge>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-red-500" style={{ width: `${topic.avgScore}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Assessments</CardTitle>
            <CardDescription>Latest assigned assessments</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/school-admin/assessments">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentAssessments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No assessments assigned yet.</p>
          ) : (
            <div className="space-y-4">
              {recentAssessments.map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{assessment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {assessment.questionCount} questions | {assessment.duration} mins
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{assessment.avgScore !== null ? `${assessment.avgScore}% avg` : "-"}</p>
                    <p className="text-sm text-muted-foreground">{assessment.attempts} attempts</p>
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
