"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Filter, ShieldAlert, Eye } from "lucide-react"

export type FlaggedAttemptRow = {
  id: string
  studentName: string
  className: string
  classId: string | null
  subjectName: string
  assessmentTitle: string
  tabSwitchCount: number
  flaggedForReview: boolean
  inProgress: boolean
  score: number | null
  startedAt: Date
  submittedAt: Date | null
}

export function FlaggedAttemptsView({
  attempts,
  classes,
  stats,
}: {
  attempts: FlaggedAttemptRow[]
  classes: { id: string; displayName: string }[]
  stats: { totalFlagged: number; totalWithSwitches: number }
}) {
  const [classFilter, setClassFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = attempts.filter((a) => {
    const matchesClass = classFilter === "all" || a.classId === classFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "flagged" && a.flaggedForReview) ||
      (statusFilter === "unflagged" && !a.flaggedForReview)
    return matchesClass && matchesStatus
  })

  const columns = [
    {
      key: "studentName",
      header: "Student",
      render: (a: FlaggedAttemptRow) => (
        <div>
          <p className="font-medium">{a.studentName}</p>
          <p className="text-sm text-muted-foreground">{a.className}</p>
        </div>
      ),
    },
    {
      key: "assessmentTitle",
      header: "Assessment",
      render: (a: FlaggedAttemptRow) => (
        <div>
          <p className="font-medium">{a.assessmentTitle}</p>
          <p className="text-sm text-muted-foreground">{a.subjectName}</p>
        </div>
      ),
    },
    {
      key: "tabSwitchCount",
      header: "Tab Switches",
      render: (a: FlaggedAttemptRow) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{a.tabSwitchCount}</span>
          {a.flaggedForReview && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Flagged
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "score",
      header: "Status",
      render: (a: FlaggedAttemptRow) =>
        a.inProgress ? (
          <Badge variant="secondary">In progress</Badge>
        ) : (
          <span className="font-medium">{a.score}%</span>
        ),
    },
    {
      key: "startedAt",
      header: "Started",
      render: (a: FlaggedAttemptRow) => (
        <span className="text-sm text-muted-foreground">{a.startedAt.toLocaleString()}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Flagged Attempts</h1>
        <p className="text-muted-foreground">
          Exam attempts from your students with at least one recorded tab switch - logged automatically, not
          interrupted or auto-submitted.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/50 border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Flagged for Review</p>
                <p className="text-3xl font-bold">{stats.totalFlagged}</p>
                <p className="text-xs text-red-600 mt-1">3+ tab switches recorded</p>
              </div>
              <ShieldAlert className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attempts With Any Tab Switch</p>
                <p className="text-3xl font-bold">{stats.totalWithSwitches}</p>
                <p className="text-xs text-amber-600 mt-1">Includes below-threshold attempts</p>
              </div>
              <Eye className="h-10 w-10 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Attempts</SelectItem>
                <SelectItem value="flagged">Flagged Only</SelectItem>
                <SelectItem value="unflagged">Below Threshold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Attempts</CardTitle>
          <CardDescription>{filtered.length} attempt{filtered.length === 1 ? "" : "s"} with recorded tab switches</CardDescription>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No tab-switch activity recorded for your school's students yet.
            </p>
          ) : (
            <DataTable data={filtered} columns={columns} searchKey="studentName" searchPlaceholder="Search students..." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
