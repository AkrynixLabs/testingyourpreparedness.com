"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/stat-card"
import { subjects, questions, assessments } from "@/lib/demo-data"
import {
  FileQuestion,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

const questionStatusData = [
  { name: "Approved", value: 7200, color: "oklch(0.60 0.18 145)" },
  { name: "Pending Review", value: 850, color: "oklch(0.75 0.15 85)" },
  { name: "Draft", value: 700, color: "oklch(0.70 0.02 260)" },
]

export default function ContentAdminDashboard() {
  const pendingQuestions = questions.filter(q => q.status === "pending").length
  const draftAssessments = assessments.filter(a => a.status === "draft").length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Dashboard</h1>
          <p className="text-muted-foreground">
            Manage questions and assessments for the platform
          </p>
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

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Questions"
          value="8,750"
          change={5}
          changeLabel="this month"
          icon={FileQuestion}
        />
        <StatCard
          title="Assessments"
          value={assessments.length}
          icon={ClipboardList}
        />
        <StatCard
          title="Pending Review"
          value={pendingQuestions}
          icon={Clock}
        />
        <StatCard
          title="Published Today"
          value="24"
          icon={CheckCircle2}
        />
      </div>

      {/* Charts and quick actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Question status chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Question Status</CardTitle>
            <CardDescription>Distribution of questions by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="h-[200px] w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={questionStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {questionStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {questionStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                    <span className="text-sm font-semibold ml-auto">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions by subject */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Questions by Subject</CardTitle>
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
            <div className="space-y-4">
              {subjects.map((subject) => (
                <div key={subject.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{subject.name}</span>
                    <span className="text-muted-foreground">
                      {subject.questionCount} questions
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${(subject.questionCount / 520) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent assessments */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Assessments</CardTitle>
            <CardDescription>Latest assessments created</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/content-admin/assessments">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessments.slice(0, 5).map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{assessment.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {assessment.subject} | {assessment.questions} questions |{" "}
                    {assessment.duration} mins
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
        </CardContent>
      </Card>
    </div>
  )
}
