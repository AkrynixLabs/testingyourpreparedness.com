"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Activity, RefreshCw, AlertTriangle } from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

type ActivityEvent = {
  id: string
  studentName: string
  schoolName: string
  subject: string
  inProgress: boolean
  score: number | null
  timestamp: Date
  flaggedForReview: boolean
  tabSwitchCount: number
}

export function LiveActivityView({
  events,
  activeSchools,
  examsBySubject,
  regionActivity,
  stats,
}: {
  events: ActivityEvent[]
  activeSchools: { name: string; region: string; count: number }[]
  examsBySubject: { subject: string; count: number }[]
  regionActivity: { region: string; count: number; percentage: number }[]
  stats: { examsInProgress: number; schoolsWithActivity: number }
}) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Activity</h1>
          <p className="text-muted-foreground">
            Snapshot as of this page load - not push-updated (no realtime/session infra exists yet)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.refresh()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/50 border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Exams In Progress</p>
                <p className="text-3xl font-bold">{stats.examsInProgress}</p>
                <p className="text-xs text-blue-600 mt-1">Attempts started but not yet submitted</p>
              </div>
              <BookOpen className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Schools With Activity</p>
                <p className="text-3xl font-bold">{stats.schoolsWithActivity}</p>
                <p className="text-xs text-purple-600 mt-1">Have at least one exam in progress</p>
              </div>
              <Activity className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Most recent exam attempts (started or completed)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No exam attempts yet.</p>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div
                      className={`h-2 w-2 mt-2 rounded-full flex-shrink-0 ${
                        event.inProgress ? "bg-blue-500" : "bg-emerald-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {event.inProgress
                            ? `${event.studentName} started ${event.subject} exam`
                            : `${event.studentName} completed ${event.subject}${
                                event.score !== null ? ` (${event.score}%)` : ""
                              }`}
                        </p>
                        {event.flaggedForReview && (
                          <Badge variant="destructive" className="gap-1 shrink-0" title={`${event.tabSwitchCount} tab switches recorded`}>
                            <AlertTriangle className="h-3 w-3" />
                            Flagged
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {event.schoolName} · {event.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Schools With Exams In Progress</CardTitle>
            <CardDescription>Ranked by number of in-progress attempts right now</CardDescription>
          </CardHeader>
          <CardContent>
            {activeSchools.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No exams in progress right now.</p>
            ) : (
              <div className="space-y-3">
                {activeSchools.map((school, index) => (
                  <div key={school.name} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{school.name}</p>
                      <p className="text-xs text-muted-foreground">{school.region}</p>
                    </div>
                    <p className="font-semibold text-emerald-600">{school.count}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Active Exams by Subject</CardTitle>
            <CardDescription>In-progress attempts grouped by subject</CardDescription>
          </CardHeader>
          <CardContent>
            {examsBySubject.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No exams in progress right now.</p>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={examsBySubject} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                    <YAxis dataKey="subject" type="category" stroke="var(--muted-foreground)" fontSize={12} width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="oklch(0.55 0.15 170)" radius={[0, 4, 4, 0]} name="In Progress" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Activity by Region</CardTitle>
            <CardDescription>In-progress attempts, by school region</CardDescription>
          </CardHeader>
          <CardContent>
            {regionActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No exams in progress right now.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {regionActivity.map((region) => (
                  <div key={region.region} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{region.region}</span>
                      <Badge variant="secondary">{region.percentage}%</Badge>
                    </div>
                    <p className="text-2xl font-bold text-primary">{region.count}</p>
                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${region.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
