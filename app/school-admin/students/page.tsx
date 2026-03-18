"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import { students } from "@/lib/demo-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Plus, MoreHorizontal, Eye, Edit, Mail, Filter, Download } from "lucide-react"

// Extended student data
const schoolStudents = [
  ...students,
  { id: 7, name: "Akosua Mensah", email: "akosua.m@achimota.edu.gh", school: "Achimota School", class: "Form 3A", avgScore: 79, assessmentsTaken: 13 },
  { id: 8, name: "Kwesi Ofori", email: "kwesi.o@achimota.edu.gh", school: "Achimota School", class: "Form 3B", avgScore: 74, assessmentsTaken: 11 },
  { id: 9, name: "Adjoa Bonsu", email: "adjoa.b@achimota.edu.gh", school: "Achimota School", class: "Form 3C", avgScore: 86, assessmentsTaken: 17 },
  { id: 10, name: "Kojo Antwi", email: "kojo.a@achimota.edu.gh", school: "Achimota School", class: "Form 2A", avgScore: 68, assessmentsTaken: 9 },
  { id: 11, name: "Esi Appiah", email: "esi.a@achimota.edu.gh", school: "Achimota School", class: "Form 2B", avgScore: 71, assessmentsTaken: 8 },
  { id: 12, name: "Yaw Asare", email: "yaw.a@achimota.edu.gh", school: "Achimota School", class: "Form 3A", avgScore: 83, assessmentsTaken: 14 },
]

export default function StudentsPage() {
  const columns = [
    {
      key: "name",
      header: "Student",
      render: (student: typeof schoolStudents[0]) => (
        <div>
          <p className="font-medium">{student.name}</p>
          <p className="text-sm text-muted-foreground">{student.email}</p>
        </div>
      ),
    },
    {
      key: "class",
      header: "Class",
      render: (student: typeof schoolStudents[0]) => (
        <Badge variant="outline">{student.class}</Badge>
      ),
    },
    {
      key: "avgScore",
      header: "Avg. Score",
      render: (student: typeof schoolStudents[0]) => (
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage and monitor your school&apos;s students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild>
            <Link href="/school-admin/students/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Students
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Students</p>
            <p className="text-2xl font-bold">{schoolStudents.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Form 3</p>
            <p className="text-2xl font-bold">
              {schoolStudents.filter((s) => s.class.includes("Form 3")).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Form 2</p>
            <p className="text-2xl font-bold">
              {schoolStudents.filter((s) => s.class.includes("Form 2")).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg. Score</p>
            <p className="text-2xl font-bold">
              {Math.round(
                schoolStudents.reduce((acc, s) => acc + s.avgScore, 0) /
                  schoolStudents.length
              )}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="form-3a">Form 3A</SelectItem>
                <SelectItem value="form-3b">Form 3B</SelectItem>
                <SelectItem value="form-3c">Form 3C</SelectItem>
                <SelectItem value="form-2a">Form 2A</SelectItem>
                <SelectItem value="form-2b">Form 2B</SelectItem>
              </SelectContent>
            </Select>
            <Select>
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
            {schoolStudents.length} students enrolled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={schoolStudents}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search students..."
            actions={(student) => (
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
    </div>
  )
}
