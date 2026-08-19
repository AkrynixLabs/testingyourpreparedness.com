"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Download } from "lucide-react"
import type { Class, Student, User } from "@/lib/generated/prisma/client"

// Same pattern as school-admin/leaderboard and .../results - copied, not
// extracted into a shared helper, given only a handful of call sites (see
// those files' own identical copies).
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

export type StudentRow = Student & {
  user: Omit<User, "passwordHash">
  class: Class | null
  avgScore: number | null
  assessmentsTaken: number
  name: string
}

export function StudentsTable({
  students,
  classes,
}: {
  students: StudentRow[]
  classes: Class[]
}) {
  const [classFilter, setClassFilter] = useState("all")
  const [performanceFilter, setPerformanceFilter] = useState("all")

  const filteredStudents = students.filter((student) => {
    const matchesClass = classFilter === "all" || student.class?.id === classFilter
    const score = student.avgScore
    const matchesPerformance =
      performanceFilter === "all" ||
      (performanceFilter === "high" && score !== null && score >= 80) ||
      (performanceFilter === "medium" && score !== null && score >= 60 && score < 80) ||
      (performanceFilter === "low" && score !== null && score < 60)
    return matchesClass && matchesPerformance
  })

  // Was a dead no-op button on the Server Component page (Button can't have
  // an onClick there) - found by a dead-UI-elements audit 2026-08-08 (see
  // docs/build-log.md). Exports whatever the active class/performance
  // filters currently show, same "export what's on screen" convention as
  // leaderboard/results' own real export buttons.
  const handleExport = () => {
    downloadCsv("learners.csv", [
      ["Name", "Email", "Class", "Avg. Score", "Tests Taken"],
      ...filteredStudents.map((s) => [
        s.user.name,
        s.user.email,
        s.class?.displayName ?? "Unassigned",
        s.avgScore ?? "",
        s.assessmentsTaken,
      ]),
    ])
  }

  const columns = [
    {
      key: "name",
      header: "Learner",
      render: (student: StudentRow) => (
        <div>
          <p className="font-medium">{student.user.name}</p>
          <p className="text-sm text-muted-foreground">{student.user.email}</p>
        </div>
      ),
    },
    {
      key: "class",
      header: "Class",
      render: (student: StudentRow) => (
        <Badge variant="outline">{student.class?.displayName ?? "Unassigned"}</Badge>
      ),
    },
    {
      key: "avgScore",
      header: "Avg. Score",
      render: (student: StudentRow) =>
        student.avgScore === null ? (
          <span className="text-muted-foreground">-</span>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 rounded-full bg-muted">
              <div
                className={`h-2 rounded-full ${
                  student.avgScore >= 80
                    ? "bg-emerald-500"
                    : student.avgScore >= 60
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${student.avgScore}%` }}
              />
            </div>
            <span className="font-medium">{student.avgScore}%</span>
          </div>
        ),
    },
    {
      key: "assessmentsTaken",
      header: "Tests Taken",
    },
  ]

  return (
    <>
      {/* Filters */}
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
            <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Performance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="high">High (80%+)</SelectItem>
                <SelectItem value="medium">Medium (60-79%)</SelectItem>
                <SelectItem value="low">Low (&lt;60%)</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="ml-auto" onClick={handleExport} disabled={filteredStudents.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>All Learners</CardTitle>
          <CardDescription>
            {filteredStudents.length} students enrolled
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* No actions dropdown - "View Profile" (no student-detail route
              exists), "Edit" (no update-student action exists), and "Send
              Message" (no messaging system exists anywhere in this app) were
              all dead menu items with nowhere to go, found by a dead-UI-
              elements audit 2026-08-08 (see docs/build-log.md). Dropped
              rather than left as no-ops, same "don't keep UI with nowhere to
              go" precedent already applied elsewhere (e.g.
              super-admin/content-admins' dropped "View Profile"/"Send
              Message" items). */}
          <DataTable
            data={filteredStudents}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search learners..."
          />
        </CardContent>
      </Card>
    </>
  )
}
