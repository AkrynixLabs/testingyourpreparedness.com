"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Plus,
  MoreHorizontal,
  Calendar,
  Clock,
  Users,
  FileText,
  Eye,
  Pause,
  Play,
  Trash2,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  Timer,
} from "lucide-react"

// Demo data for assigned assessments
const assignedAssessments = [
  {
    id: 1,
    title: "BECE Mock Exam 2024 - English",
    subject: "English Language",
    assignedTo: "All Form 3",
    totalStudents: 245,
    completed: 198,
    inProgress: 32,
    notStarted: 15,
    avgScore: 72,
    startDate: "2024-03-10",
    endDate: "2024-03-17",
    status: "active",
    duration: 90,
    questions: 50,
  },
  {
    id: 2,
    title: "Mathematics Practice Test 1",
    subject: "Mathematics",
    assignedTo: "Form 3A, Form 3B",
    totalStudents: 86,
    completed: 86,
    inProgress: 0,
    notStarted: 0,
    avgScore: 68,
    startDate: "2024-03-01",
    endDate: "2024-03-08",
    status: "completed",
    duration: 60,
    questions: 40,
  },
  {
    id: 3,
    title: "Integrated Science Mid-Term",
    subject: "Integrated Science",
    assignedTo: "Form 3C",
    totalStudents: 42,
    completed: 0,
    inProgress: 0,
    notStarted: 42,
    avgScore: 0,
    startDate: "2024-03-20",
    endDate: "2024-03-25",
    status: "scheduled",
    duration: 45,
    questions: 35,
  },
  {
    id: 4,
    title: "Social Studies Comprehensive",
    subject: "Social Studies",
    assignedTo: "Form 3A",
    totalStudents: 43,
    completed: 28,
    inProgress: 8,
    notStarted: 7,
    avgScore: 76,
    startDate: "2024-03-12",
    endDate: "2024-03-19",
    status: "active",
    duration: 75,
    questions: 45,
  },
  {
    id: 5,
    title: "English Grammar Focus",
    subject: "English Language",
    assignedTo: "Form 3B",
    totalStudents: 43,
    completed: 43,
    inProgress: 0,
    notStarted: 0,
    avgScore: 81,
    startDate: "2024-02-20",
    endDate: "2024-02-27",
    status: "completed",
    duration: 40,
    questions: 30,
  },
]

const statusConfig = {
  active: { label: "Active", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: Play },
  completed: { label: "Completed", color: "bg-slate-500/10 text-slate-600 border-slate-500/20", icon: CheckCircle2 },
  scheduled: { label: "Scheduled", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Calendar },
  paused: { label: "Paused", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Pause },
}

export default function AssessmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [subjectFilter, setSubjectFilter] = useState("all")

  const filteredAssessments = assignedAssessments.filter((assessment) => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || assessment.status === statusFilter
    const matchesSubject = subjectFilter === "all" || assessment.subject === subjectFilter
    return matchesSearch && matchesStatus && matchesSubject
  })

  const stats = {
    total: assignedAssessments.length,
    active: assignedAssessments.filter((a) => a.status === "active").length,
    completed: assignedAssessments.filter((a) => a.status === "completed").length,
    scheduled: assignedAssessments.filter((a) => a.status === "scheduled").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Assigned Assessments</h1>
          <p className="text-muted-foreground">Manage and monitor assessments assigned to your students</p>
        </div>
        <Button asChild>
          <Link href="/school-admin/assessments/assign">
            <Plus className="mr-2 h-4 w-4" />
            Assign New Assessment
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Play className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-slate-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="English Language">English</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Integrated Science">Science</SelectItem>
                  <SelectItem value="Social Studies">Social Studies</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessments List */}
      <div className="space-y-4">
        {filteredAssessments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">No assessments found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || subjectFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Assign your first assessment to get started"}
              </p>
              <Button asChild>
                <Link href="/school-admin/assessments/assign">
                  <Plus className="mr-2 h-4 w-4" />
                  Assign Assessment
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredAssessments.map((assessment) => {
            const status = statusConfig[assessment.status as keyof typeof statusConfig]
            const StatusIcon = status.icon
            const completionRate = Math.round((assessment.completed / assessment.totalStudents) * 100)

            return (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    {/* Main Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{assessment.title}</h3>
                            <Badge variant="outline" className={status.color}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{assessment.subject}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart2 className="mr-2 h-4 w-4" />
                              View Results
                            </DropdownMenuItem>
                            {assessment.status === "active" && (
                              <DropdownMenuItem>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause Assessment
                              </DropdownMenuItem>
                            )}
                            {assessment.status === "paused" && (
                              <DropdownMenuItem>
                                <Play className="mr-2 h-4 w-4" />
                                Resume Assessment
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{assessment.assignedTo}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{assessment.questions} questions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{assessment.duration} mins</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(assessment.startDate).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}{" "}
                            -{" "}
                            {new Date(assessment.endDate).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress & Stats */}
                    <div className="flex flex-col gap-3 lg:w-80">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Completion</span>
                        <span className="font-medium">
                          {assessment.completed}/{assessment.totalStudents} students ({completionRate}%)
                        </span>
                      </div>
                      <Progress value={completionRate} className="h-2" />
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-muted-foreground">
                            Completed: <span className="font-medium text-foreground">{assessment.completed}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-amber-500" />
                          <span className="text-muted-foreground">
                            In Progress: <span className="font-medium text-foreground">{assessment.inProgress}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-slate-300" />
                          <span className="text-muted-foreground">
                            Not Started: <span className="font-medium text-foreground">{assessment.notStarted}</span>
                          </span>
                        </div>
                      </div>
                      {assessment.avgScore > 0 && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm text-muted-foreground">Average Score</span>
                          <span
                            className={`text-lg font-bold ${
                              assessment.avgScore >= 70
                                ? "text-emerald-600"
                                : assessment.avgScore >= 50
                                  ? "text-amber-600"
                                  : "text-red-600"
                            }`}
                          >
                            {assessment.avgScore}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
