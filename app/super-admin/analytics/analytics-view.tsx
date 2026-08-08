"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/stat-card"
import { BarChart3, Users, BookOpen, FileQuestion, School, ArrowUp } from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const REGION_COLORS = ["#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4", "#ccfbf1"]

export function AnalyticsView({
  stats,
  topSchools,
  regionDistribution,
  subjectPerformance,
  weeklyActivity,
}: {
  stats: { totalStudents: number; activeSchools: number; questionsInBank: number; examsCompleted: number }
  topSchools: { name: string; region: string; students: number; avgScore: number | null }[]
  regionDistribution: { name: string; count: number; percentage: number }[]
  subjectPerformance: { subject: string; avgScore: number }[]
  weeklyActivity: { day: string; count: number; intensity: number }[]
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground mt-1">Real insights derived from actual platform data</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={stats.totalStudents.toString()} changeLabel="Across all schools" icon={Users} />
        <StatCard title="Active Schools" value={stats.activeSchools.toString()} icon={School} />
        <StatCard title="Questions in Bank" value={stats.questionsInBank.toString()} changeLabel="Approved & active" icon={FileQuestion} />
        <StatCard title="Exams Completed" value={stats.examsCompleted.toString()} icon={BookOpen} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Subject Performance
            </CardTitle>
            <CardDescription>Average correctness by subject, derived from real exam attempts</CardDescription>
          </CardHeader>
          <CardContent>
            {subjectPerformance.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">No answered questions yet.</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 100]} className="text-xs" />
                    <YAxis dataKey="subject" type="category" width={100} className="text-xs" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      formatter={(value: number) => [`${value}%`, "Avg Score"]}
                    />
                    <Bar dataKey="avgScore" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              Regional Distribution
            </CardTitle>
            <CardDescription>Schools by region</CardDescription>
          </CardHeader>
          <CardContent>
            {regionDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">No schools yet.</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={regionDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="count"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      labelLine={false}
                    >
                      {regionDistribution.map((entry, index) => (
                        <Cell key={entry.name} fill={REGION_COLORS[index % REGION_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-primary" />
            Top Performing Schools
          </CardTitle>
          <CardDescription>Schools with highest average student scores, from real exam attempts</CardDescription>
        </CardHeader>
        <CardContent>
          {topSchools.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No schools have any submitted exam attempts yet.</p>
          ) : (
            <div className="space-y-4">
              {topSchools.map((school, index) => (
                <div key={school.name} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${
                        index === 0 ? "bg-amber-500" : index === 1 ? "bg-slate-400" : index === 2 ? "bg-amber-700" : "bg-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{school.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {school.region} - {school.students} students
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{school.avgScore!.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">avg score</p>
                    </div>
                    {index < 3 && (
                      <Badge className="bg-emerald-500/10 text-emerald-600">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        Top Performer
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity Pattern</CardTitle>
          <CardDescription>Real exam attempts by day of week (not simulated)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weeklyActivity.map((day) => (
              <div key={day.day} className="text-center">
                <p className="text-sm font-medium mb-2">{day.day}</p>
                <div
                  className="h-16 rounded flex items-center justify-center text-xs font-medium"
                  style={{ backgroundColor: `hsl(var(--primary) / ${0.1 + day.intensity * 0.9})` }}
                  title={`${day.count} attempt${day.count === 1 ? "" : "s"}`}
                >
                  {day.count}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Fewer attempts</span>
            <div className="flex gap-1">
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity) => (
                <div key={opacity} className="h-4 w-4 rounded" style={{ backgroundColor: `hsl(var(--primary) / ${opacity})` }} />
              ))}
            </div>
            <span>More attempts</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
