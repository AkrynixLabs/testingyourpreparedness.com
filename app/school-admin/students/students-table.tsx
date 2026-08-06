"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Mail, Filter } from "lucide-react"
import type { Class, Student, User } from "@/lib/generated/prisma/client"

export type StudentRow = Student & {
  user: User
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

  const columns = [
    {
      key: "name",
      header: "Student",
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
          </div>
        </CardContent>
      </Card>

      {/* Students table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            {filteredStudents.length} students enrolled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredStudents}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search students..."
            actions={() => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Message
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        </CardContent>
      </Card>
    </>
  )
}
