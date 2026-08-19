"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, Plus, MoreHorizontal, Calendar, Clock, Users, FileText, Pause, Play, Trash2, CheckCircle2 } from "lucide-react"
import { pauseAssignment, resumeAssignment, deleteAssignment } from "./actions"
import type { AssignmentStatus } from "@/lib/generated/prisma/client"

type AssignmentRow = {
  id: string
  title: string
  subject: string
  assignedTo: string
  totalStudents: number
  completed: number
  inProgress: number
  notStarted: number
  avgScore: number
  startDate: string
  endDate: string
  status: AssignmentStatus
  duration: number
  questions: number
}

const statusConfig: Record<AssignmentStatus, { label: string; color: string; icon: typeof Play }> = {
  active: { label: "Active", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: Play },
  completed: { label: "Completed", color: "bg-slate-500/10 text-slate-600 border-slate-500/20", icon: CheckCircle2 },
  scheduled: { label: "Scheduled", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Calendar },
  paused: { label: "Paused", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Pause },
}

export function AssignedAssessmentsView({ assignments, subjects }: { assignments: AssignmentRow[]; subjects: string[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AssignmentRow | null>(null)

  const filteredAssessments = assignments.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || a.status === statusFilter
    const matchesSubject = subjectFilter === "all" || a.subject === subjectFilter
    return matchesSearch && matchesStatus && matchesSubject
  })

  const stats = {
    total: assignments.length,
    active: assignments.filter((a) => a.status === "active").length,
    completed: assignments.filter((a) => a.status === "completed").length,
    scheduled: assignments.filter((a) => a.status === "scheduled").length,
  }

  const handlePause = (id: string) => {
    setError(null)
    startTransition(async () => {
      try {
        await pauseAssignment(id)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to pause assignment.")
      }
    })
  }

  const handleResume = (id: string) => {
    setError(null)
    startTransition(async () => {
      try {
        await resumeAssignment(id)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to resume assignment.")
      }
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setError(null)
    startTransition(async () => {
      try {
        await deleteAssignment(deleteTarget.id)
        setDeleteTarget(null)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete assignment.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Assigned Assessments</h1>
          <p className="text-muted-foreground">Manage and monitor assessments assigned to your learners</p>
        </div>
        <Button asChild>
          <Link href="/school-admin/assessments/assign">
            <Plus className="mr-2 h-4 w-4" />
            Assign New Assessment
          </Link>
        </Button>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

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

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search assessments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
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
                  {subjects.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredAssessments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">No assessments found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || subjectFilter !== "all" ? "Try adjusting your filters" : "Assign your first assessment to get started"}
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
            const status = statusConfig[assessment.status]
            const StatusIcon = status.icon
            const completionRate = assessment.totalStudents > 0 ? Math.round((assessment.completed / assessment.totalStudents) * 100) : 0

            return (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
                            {assessment.status === "active" && (
                              <DropdownMenuItem onClick={() => handlePause(assessment.id)} disabled={isPending}>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause Assessment
                              </DropdownMenuItem>
                            )}
                            {assessment.status === "paused" && (
                              <DropdownMenuItem onClick={() => handleResume(assessment.id)} disabled={isPending}>
                                <Play className="mr-2 h-4 w-4" />
                                Resume Assessment
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              disabled={assessment.completed + assessment.inProgress > 0}
                              onClick={() => setDeleteTarget(assessment)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

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
                            {new Date(assessment.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} -{" "}
                            {new Date(assessment.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </div>
                    </div>

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
                              assessment.avgScore >= 70 ? "text-emerald-600" : assessment.avgScore >= 50 ? "text-amber-600" : "text-red-600"
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

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the assignment of &quot;{deleteTarget?.title}&quot;. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
