"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import type { Class, Subject } from "@/lib/generated/prisma/client"

type Attempt = {
  classId: string | null
  className: string
  subjectId: string
  subjectName: string
  score: number
  totalMarks: number
  submittedAt: string
  questionResults: { topicName: string; correct: boolean }[]
}

type Period = "week" | "month" | "term" | "year"

const BAR_COLORS = [
  "oklch(0.55 0.15 170)",
  "oklch(0.65 0.12 200)",
  "oklch(0.75 0.10 85)",
  "oklch(0.60 0.18 280)",
  "oklch(0.60 0.15 30)",
  "oklch(0.55 0.15 340)",
]

function periodCutoff(period: Period): Date {
  const now = new Date()
  const days = { week: 7, month: 30, term: 90, year: 365 }[period]
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function ResultsView({
  attempts,
  classes,
  subjects,
}: {
  attempts: Attempt[]
  classes: Class[]
  subjects: Subject[]
}) {
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [period, setPeriod] = useState<Period>("term")
  const [classFilter, setClassFilter] = useState("all")

  const filtered = useMemo(() => {
    const cutoff = periodCutoff(period)
    return attempts.filter((a) => {
      if (new Date(a.submittedAt) < cutoff) return false
      if (subjectFilter !== "all" && a.subjectId !== subjectFilter) return false
      if (classFilter !== "all" && a.classId !== classFilter) return false
      return true
    })
  }, [attempts, subjectFilter, period, classFilter])

  const pct = (score: number, totalMarks: number) => (score / totalMarks) * 100

  const schoolAvg = filtered.length > 0 ? filtered.reduce((sum, a) => sum + pct(a.score, a.totalMarks), 0) / filtered.length : null

  const classAverages = useMemo(() => {
    const map = new Map<string, { className: string; total: number; count: number }>()
    for (const a of filtered) {
      const key = a.classId ?? "none"
      if (!map.has(key)) map.set(key, { className: a.className, total: 0, count: 0 })
      const entry = map.get(key)!
      entry.total += pct(a.score, a.totalMarks)
      entry.count++
    }
    return Array.from(map.values())
      .map((e) => ({ className: e.className, avg: Math.round((e.total / e.count) * 10) / 10 }))
      .sort((a, b) => b.avg - a.avg)
  }, [filtered])

  const subjectAverages = useMemo(() => {
    const map = new Map<string, { subjectName: string; total: number; count: number }>()
    for (const a of filtered) {
      if (!map.has(a.subjectId)) map.set(a.subjectId, { subjectName: a.subjectName, total: 0, count: 0 })
      const entry = map.get(a.subjectId)!
      entry.total += pct(a.score, a.totalMarks)
      entry.count++
    }
    return Array.from(map.values())
      .map((e) => ({ subjectName: e.subjectName, avg: Math.round((e.total / e.count) * 10) / 10 }))
      .sort((a, b) => b.avg - a.avg)
  }, [filtered])

  const classSubjectChart = useMemo(() => {
    const subjectNames = Array.from(new Set(filtered.map((a) => a.subjectName)))
    const map = new Map<string, Record<string, { total: number; count: number }>>()
    for (const a of filtered) {
      const key = a.classId ?? "none"
      if (!map.has(key)) map.set(key, {})
      const perSubject = map.get(key)!
      if (!perSubject[a.subjectName]) perSubject[a.subjectName] = { total: 0, count: 0 }
      perSubject[a.subjectName].total += pct(a.score, a.totalMarks)
      perSubject[a.subjectName].count++
    }
    const classNames = new Map<string, string>()
    for (const a of filtered) classNames.set(a.classId ?? "none", a.className)

    const data = Array.from(map.entries()).map(([classId, perSubject]) => {
      const row: Record<string, string | number> = { class: classNames.get(classId) ?? "Unknown" }
      for (const subjectName of subjectNames) {
        const s = perSubject[subjectName]
        row[subjectName] = s ? Math.round((s.total / s.count) * 10) / 10 : 0
      }
      return row
    })
    return { subjectNames, data }
  }, [filtered])

  const topicBreakdown = useMemo(() => {
    const map = new Map<string, { correct: number; total: number }>()
    for (const a of filtered) {
      for (const qr of a.questionResults) {
        if (!map.has(qr.topicName)) map.set(qr.topicName, { correct: 0, total: 0 })
        const entry = map.get(qr.topicName)!
        entry.total++
        if (qr.correct) entry.correct++
      }
    }
    return Array.from(map.entries())
      .map(([topic, { correct, total }]) => ({ topic, score: Math.round((correct / total) * 100) }))
      .sort((a, b) => b.score - a.score)
  }, [filtered])

  const highestClass = classAverages[0] ?? null
  const bestSubject = subjectAverages[0] ?? null

  const handleExport = () => {
    downloadCsv(
      `results-${period}.csv`,
      [["Class", "Avg Score %"], ...classAverages.map((c) => [c.className, c.avg])]
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Results & Analytics</h1>
          <p className="text-muted-foreground">Detailed performance analysis for your school</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">View by:</span>
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
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
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">School Average</p>
            <p className="text-3xl font-bold text-primary">{schoolAvg !== null ? `${Math.round(schoolAvg)}%` : "-"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Highest Class</p>
            <p className="text-3xl font-bold">{highestClass?.className ?? "-"}</p>
            <p className="text-xs text-muted-foreground mt-1">{highestClass ? `${highestClass.avg}% average` : "No data"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Best Subject</p>
            <p className="text-3xl font-bold">{bestSubject?.subjectName ?? "-"}</p>
            <p className="text-xs text-muted-foreground mt-1">{bestSubject ? `${bestSubject.avg}% average` : "No data"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Assessments</p>
            <p className="text-3xl font-bold">{filtered.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Submitted attempts in this period</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Performance by Class</CardTitle>
            <CardDescription>Compare subject scores across classes</CardDescription>
          </CardHeader>
          <CardContent>
            {classSubjectChart.data.length === 0 ? (
              <p className="text-sm text-muted-foreground py-16 text-center">No data for this filter.</p>
            ) : (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classSubjectChart.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="class" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
                    />
                    {classSubjectChart.subjectNames.map((name, i) => (
                      <Bar key={name} dataKey={name} fill={BAR_COLORS[i % BAR_COLORS.length]} name={name} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Subject Strength</CardTitle>
            <CardDescription>Overall school performance by subject</CardDescription>
          </CardHeader>
          <CardContent>
            {subjectAverages.length === 0 ? (
              <p className="text-sm text-muted-foreground py-16 text-center">No data for this filter.</p>
            ) : (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={subjectAverages.map((s) => ({ subject: s.subjectName, score: s.avg, fullMark: 100 }))}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" stroke="var(--muted-foreground)" fontSize={12} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={10} />
                    <Radar name="Score" dataKey="score" stroke="oklch(0.55 0.15 170)" fill="oklch(0.55 0.15 170)" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Topic Performance</CardTitle>
          <CardDescription>Average correctness by topic across all students</CardDescription>
        </CardHeader>
        <CardContent>
          {topicBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No data for this filter.</p>
          ) : (
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
                        topic.score >= 80 ? "bg-emerald-500" : topic.score >= 70 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${topic.score}%` }}
                    />
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
