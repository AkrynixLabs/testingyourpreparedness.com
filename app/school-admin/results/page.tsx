"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { subjects } from "@/lib/demo-data"
import { Download, Filter } from "lucide-react"
import {
  BarChart,
  Bar,
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

const classComparison = [
  { class: "Form 3A", english: 78, mathematics: 72, science: 75, social: 80 },
  { class: "Form 3B", english: 82, mathematics: 76, science: 79, social: 84 },
  { class: "Form 3C", english: 71, mathematics: 65, science: 68, social: 74 },
  { class: "Form 2A", english: 75, mathematics: 70, science: 72, social: 77 },
  { class: "Form 2B", english: 69, mathematics: 62, science: 65, social: 71 },
]

const topicBreakdown = [
  { topic: "Comprehension", score: 82 },
  { topic: "Grammar", score: 75 },
  { topic: "Algebra", score: 62 },
  { topic: "Geometry", score: 68 },
  { topic: "Living Things", score: 78 },
  { topic: "Ecology", score: 65 },
  { topic: "Governance", score: 80 },
  { topic: "History", score: 85 },
]

const radarData = [
  { subject: "English", score: 76, fullMark: 100 },
  { subject: "Mathematics", score: 68, fullMark: 100 },
  { subject: "Science", score: 72, fullMark: 100 },
  { subject: "Social Studies", score: 78, fullMark: 100 },
]

export default function ResultsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Results & Analytics</h1>
          <p className="text-muted-foreground">
            Detailed performance analysis for your school
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">View by:</span>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.code}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="term">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="term">This Term</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="form-3">Form 3</SelectItem>
                <SelectItem value="form-2">Form 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Overview cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">School Average</p>
            <p className="text-3xl font-bold text-primary">78%</p>
            <p className="text-xs text-emerald-600 mt-1">+4% from last term</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Highest Class</p>
            <p className="text-3xl font-bold">Form 3B</p>
            <p className="text-xs text-muted-foreground mt-1">82% average</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Best Subject</p>
            <p className="text-3xl font-bold">Social Studies</p>
            <p className="text-xs text-muted-foreground mt-1">80% average</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Assessments</p>
            <p className="text-3xl font-bold">142</p>
            <p className="text-xs text-muted-foreground mt-1">This term</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subject performance by class */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Performance by Class</CardTitle>
            <CardDescription>Compare subject scores across classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classComparison}>
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
                  <Bar dataKey="english" fill="oklch(0.55 0.15 170)" name="English" />
                  <Bar dataKey="mathematics" fill="oklch(0.65 0.12 200)" name="Math" />
                  <Bar dataKey="science" fill="oklch(0.75 0.10 85)" name="Science" />
                  <Bar dataKey="social" fill="oklch(0.60 0.18 280)" name="Social" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subject radar */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Subject Strength</CardTitle>
            <CardDescription>Overall school performance by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" stroke="var(--muted-foreground)" fontSize={12} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={10} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="oklch(0.55 0.15 170)"
                    fill="oklch(0.55 0.15 170)"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic breakdown */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Topic Performance</CardTitle>
          <CardDescription>Average scores by topic across all students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topicBreakdown.map((topic) => (
              <div key={topic.topic} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{topic.topic}</span>
                  <Badge
                    variant="secondary"
                    className={
                      topic.score >= 80
                        ? "bg-emerald-100 text-emerald-700"
                        : topic.score >= 70
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {topic.score}%
                  </Badge>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${
                      topic.score >= 80
                        ? "bg-emerald-500"
                        : topic.score >= 70
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${topic.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
