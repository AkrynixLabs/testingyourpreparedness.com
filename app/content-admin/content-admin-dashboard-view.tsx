"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/stat-card"
import { FileQuestion, ClipboardList, CheckCircle2, Clock, ArrowRight, Plus } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import type { AssessmentStatus } from "@/lib/generated/prisma/client"

const STATUS_COLORS: Record<string, string> = {
  approved: "oklch(0.60 0.18 145)",
  pending: "oklch(0.75 0.15 85)",
  draft: "oklch(0.70 0.02 260)",
  rejected: "oklch(0.65 0.2 25)",
}

type RecentAssessment = {
  id: string
  title: string
  subjectName: string
  questionCount: number
  duration: number
  status: AssessmentStatus
}

export function ContentAdminDashboardView({
  stats,
  questionStatusCounts,
  questionsBySubject,
  recentAssessments,
}: {
  stats: { totalQuestions: number; totalAssessments: number; pendingReview: number; approved: number }
  questionStatusCounts: { draft: number; pending: number; approved: number; rejected: number }
  questionsBySubject: { name: string; count: number; percentage: number }[]
  recentAssessments: RecentAssessment[]
}) {
  const questionStatusData = (Object.entries(questionStatusCounts) as [string, number][])
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, color: STATUS_COLORS[name] }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Dashboard</h1>
          <p className="text-muted-foreground">Manage questions and assessments for the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/content-admin/questions/create">
              <Plus className="mr-2 h-4 w-4" />
              New Question
            </Link>
          </Button>
          <Button asChild>
            <Link href="/content-admin/assessments/create">
              <Plus className="mr-2 h-4 w-4" />
              New Assessment
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Questions" value={stats.totalQuestions} icon={FileQuestion} />
        <StatCard title="Platform Assessments" value={stats.totalAssessments} icon={ClipboardList} />
        <StatCard title="Pending Review" value={stats.pendingReview} icon={Clock} />
        <StatCard title="Approved" value={stats.approved} icon={CheckCircle2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Question Status</CardTitle>
            <CardDescription>Your submitted questions by status</CardDescription>
          </CardHeader>
          <CardContent>
            {questionStatusData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">You haven&apos;t created any questions yet.</p>
            ) : (
              <div className="flex items-center gap-8">
                <div className="h-[200px] w-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={questionStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                        {questionStatusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {questionStatusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-semibold ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Your Questions by Subject</CardTitle>
              <CardDescription>Question bank distribution</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/content-admin/questions">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {questionsBySubject.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">You haven&apos;t created any questions yet.</p>
            ) : (
              <div className="space-y-4">
                {questionsBySubject.map((subject) => (
                  <div key={subject.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{subject.name}</span>
                      <span className="text-muted-foreground">{subject.count} questions</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${subject.percentage}%` }} />
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
            <CardDescription>Latest assessments created across the platform</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/content-admin/assessments">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentAssessments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No assessments yet.</p>
          ) : (
            <div className="space-y-4">
              {recentAssessments.map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{assessment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {assessment.subjectName} | {assessment.questionCount} questions | {assessment.duration} mins
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      assessment.status === "published"
                        ? "bg-emerald-100 text-emerald-700"
                        : assessment.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {assessment.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
