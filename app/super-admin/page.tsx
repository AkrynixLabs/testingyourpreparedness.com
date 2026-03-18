"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/stat-card"
import { platformStats, schools, recentActivity } from "@/lib/demo-data"
import {
  School,
  Users,
  BookOpen,
  CreditCard,
  BarChart3,
  TrendingUp,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

const monthlyData = [
  { month: "Sep", students: 32000, assessments: 18500 },
  { month: "Oct", students: 35000, assessments: 22000 },
  { month: "Nov", students: 38000, assessments: 26500 },
  { month: "Dec", students: 40000, assessments: 24000 },
  { month: "Jan", students: 42500, assessments: 28000 },
  { month: "Feb", students: 45680, assessments: 31500 },
]

const subjectPerformance = [
  { subject: "English", avgScore: 72 },
  { subject: "Mathematics", avgScore: 65 },
  { subject: "Science", avgScore: 71 },
  { subject: "Social Studies", avgScore: 78 },
]

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening across TYP.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Schools"
          value={platformStats.totalSchools}
          change={8}
          changeLabel="from last month"
          icon={School}
        />
        <StatCard
          title="Total Students"
          value={platformStats.totalStudents.toLocaleString()}
          change={12}
          changeLabel="from last month"
          icon={Users}
        />
        <StatCard
          title="Assessments Taken"
          value={`${(platformStats.assessmentsTaken / 1000).toFixed(1)}K`}
          change={15}
          changeLabel="from last month"
          icon={BookOpen}
        />
        <StatCard
          title="Monthly Revenue"
          value={`GHS ${(platformStats.monthlyRevenue / 1000).toFixed(0)}K`}
          change={platformStats.revenueGrowth}
          changeLabel="from last month"
          icon={CreditCard}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Growth chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Platform Growth</CardTitle>
            <CardDescription>Student registrations and assessment activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.55 0.15 170)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.55 0.15 170)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stroke="oklch(0.55 0.15 170)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorStudents)"
                    name="Students"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subject performance */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Average Score by Subject</CardTitle>
            <CardDescription>Platform-wide performance across subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis dataKey="subject" type="category" stroke="var(--muted-foreground)" fontSize={12} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="avgScore" fill="oklch(0.55 0.15 170)" radius={[0, 4, 4, 0]} name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent schools and activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top performing schools */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Top Performing Schools</CardTitle>
              <CardDescription>Based on average student scores</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/super-admin/schools">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schools
                .filter((s) => s.status === "active")
                .sort((a, b) => b.avgScore - a.avgScore)
                .slice(0, 5)
                .map((school, index) => (
                  <div key={school.id} className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{school.name}</p>
                      <p className="text-sm text-muted-foreground">{school.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{school.avgScore}%</p>
                      <p className="text-xs text-muted-foreground">{school.students} students</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest platform events</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/super-admin/audit-logs">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.entity}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                <p className="text-xl font-bold">{platformStats.activeSubscriptions}</p>
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Active</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Platform Score</p>
                <p className="text-xl font-bold">{platformStats.averagePlatformScore}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary/40" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-xl font-bold">{platformStats.totalQuestions.toLocaleString()}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary/40" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-xl font-bold">3</p>
              </div>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">Pending</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
