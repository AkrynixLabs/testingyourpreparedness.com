"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/stat-card"
import { students, assessments } from "@/lib/demo-data"
import {
  Users,
  ClipboardList,
  TrendingUp,
  Target,
  ArrowRight,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

const classPerformance = [
  { class: "Form 3A", avgScore: 78, students: 45 },
  { class: "Form 3B", avgScore: 82, students: 42 },
  { class: "Form 3C", avgScore: 71, students: 48 },
  { class: "Form 2A", avgScore: 75, students: 44 },
  { class: "Form 2B", avgScore: 69, students: 46 },
]

const monthlyProgress = [
  { month: "Sep", score: 68 },
  { month: "Oct", score: 71 },
  { month: "Nov", score: 74 },
  { month: "Dec", score: 72 },
  { month: "Jan", score: 76 },
  { month: "Feb", score: 78 },
]

const weakTopics = [
  { topic: "Algebra", subject: "Mathematics", avgScore: 58 },
  { topic: "Trigonometry", subject: "Mathematics", avgScore: 62 },
  { topic: "Essay Writing", subject: "English", avgScore: 64 },
  { topic: "Ecology", subject: "Science", avgScore: 66 },
]

export default function SchoolAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">School Dashboard</h1>
          <p className="text-muted-foreground">
            Achimota School - Academic Term 2024
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/school-admin/students/add">Add Students</Link>
          </Button>
          <Button asChild>
            <Link href="/school-admin/assessments">Assign Assessment</Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value="1,240"
          change={5}
          changeLabel="this term"
          icon={Users}
        />
        <StatCard
          title="Active Assessments"
          value="8"
          icon={ClipboardList}
        />
        <StatCard
          title="Average Score"
          value="78%"
          change={4}
          changeLabel="from last term"
          icon={TrendingUp}
        />
        <StatCard
          title="Completion Rate"
          value="92%"
          icon={Target}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Class performance */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Performance by Class</CardTitle>
            <CardDescription>Average scores across different classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="class" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="avgScore" fill="oklch(0.55 0.15 170)" radius={[4, 4, 0, 0]} name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly progress */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">School Progress</CardTitle>
            <CardDescription>Average score trend over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis domain={[60, 85]} stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="oklch(0.55 0.15 170)"
                    strokeWidth={2}
                    dot={{ fill: "oklch(0.55 0.15 170)", strokeWidth: 2 }}
                    name="Avg Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top students and weak topics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top performing students */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Top Students</CardTitle>
              <CardDescription>Highest performing students this term</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/school-admin/students">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students
                .sort((a, b) => b.avgScore - a.avgScore)
                .slice(0, 5)
                .map((student, index) => (
                  <div key={student.id} className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.class}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{student.avgScore}%</p>
                      <p className="text-xs text-muted-foreground">{student.assessmentsTaken} tests</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Weak topics */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Areas for Improvement</CardTitle>
              <CardDescription>Topics with lowest average scores</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/school-admin/results">
                View details
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
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
                    <div
                      className="h-2 rounded-full bg-red-500"
                      style={{ width: `${topic.avgScore}%` }}
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
          <div className="space-y-4">
            {assessments.slice(0, 4).map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{assessment.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {assessment.questions} questions | {assessment.duration} mins
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{assessment.avgScore > 0 ? `${assessment.avgScore}% avg` : "-"}</p>
                  <p className="text-sm text-muted-foreground">{assessment.attempts} attempts</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
