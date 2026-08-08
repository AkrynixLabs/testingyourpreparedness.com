"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/stat-card"
import { School, Users, BookOpen, CreditCard, BarChart3, ArrowRight } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import type { AuditLog, User } from "@/lib/generated/prisma/client"

type AuditLogRow = AuditLog & { actor: User | null }

export function SuperAdminDashboardView({
  stats,
  subjectPerformance,
  topSchools,
  recentActivity,
}: {
  stats: {
    totalSchools: number
    totalStudents: number
    assessmentsTaken: number
    totalRevenue: number
    activeSubscriptions: number
    averagePlatformScore: number | null
    totalQuestions: number
    pendingApprovals: number
  }
  subjectPerformance: { subject: string; avgScore: number }[]
  topSchools: { id: string; name: string; region: string; students: number; avgScore: number | null }[]
  recentActivity: AuditLogRow[]
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening across TYP.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Schools" value={stats.totalSchools} icon={School} />
        <StatCard title="Total Students" value={stats.totalStudents.toLocaleString()} icon={Users} />
        <StatCard title="Assessments Taken" value={stats.assessmentsTaken.toLocaleString()} icon={BookOpen} />
        <StatCard title="Total Revenue" value={`GHS ${stats.totalRevenue.toLocaleString()}`} icon={CreditCard} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Average Score by Subject</CardTitle>
            <CardDescription>Platform-wide performance, derived from real exam attempts</CardDescription>
          </CardHeader>
          <CardContent>
            {subjectPerformance.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">No answered questions yet.</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis dataKey="subject" type="category" stroke="var(--muted-foreground)" fontSize={12} width={100} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
                      formatter={(value: number) => [`${value}%`, "Avg Score"]}
                    />
                    <Bar dataKey="avgScore" fill="oklch(0.55 0.15 170)" radius={[0, 4, 4, 0]} name="Avg Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

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
            {topSchools.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">No schools have any submitted exam attempts yet.</p>
            ) : (
              <div className="space-y-4">
                {topSchools.map((school, index) => (
                  <div key={school.id} className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{school.name}</p>
                      <p className="text-sm text-muted-foreground">{school.region}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{school.avgScore!.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">{school.students} students</p>
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
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No activity yet.</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium capitalize">
                      {activity.action.replace("_", " ")} · {activity.actor?.name ?? "Unknown"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.timestamp.toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                <p className="text-xl font-bold">{stats.activeSubscriptions}</p>
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
                <p className="text-xl font-bold">{stats.averagePlatformScore !== null ? `${stats.averagePlatformScore}%` : "-"}</p>
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
                <p className="text-xl font-bold">{stats.totalQuestions.toLocaleString()}</p>
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
                <p className="text-xl font-bold">{stats.pendingApprovals}</p>
              </div>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">Pending</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
