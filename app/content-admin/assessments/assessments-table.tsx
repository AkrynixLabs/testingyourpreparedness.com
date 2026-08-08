"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  MoreHorizontal,
  Trash2,
  Clock,
  FileQuestion,
  CheckCircle2,
  AlertCircle,
  Archive,
  Filter,
  BarChart3,
} from "lucide-react"
import { deleteAssessment, submitAssessmentForReview } from "./actions"
import type { Assessment, Subject } from "@/lib/generated/prisma/client"

export type AssessmentRow = Assessment & {
  subjectName: string
  createdByName: string
  questionCount: number
  timesAssigned: number
  avgScore: number | null
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  published: "default",
  pending: "secondary",
  draft: "secondary",
  archived: "outline",
}

const statusIcon: Record<string, React.ReactNode> = {
  published: <CheckCircle2 className="h-3 w-3" />,
  pending: <Clock className="h-3 w-3" />,
  draft: <AlertCircle className="h-3 w-3" />,
  archived: <Archive className="h-3 w-3" />,
}

export function AssessmentsTable({
  assessments,
  subjects,
  stats,
}: {
  assessments: AssessmentRow[]
  subjects: Subject[]
  stats: { total: number; published: number; draft: number; pending: number; totalQuestions: number }
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteTarget, setDeleteTarget] = useState<AssessmentRow | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const filteredAssessments = assessments.filter((a) => {
    const matchesSubject = subjectFilter === "all" || a.subjectId === subjectFilter
    const matchesStatus = statusFilter === "all" || a.status === statusFilter
    return matchesSubject && matchesStatus
  })

  const handleDelete = () => {
    if (!deleteTarget) return
    setActionError(null)
    startTransition(async () => {
      try {
        await deleteAssessment(deleteTarget.id)
        setDeleteTarget(null)
        router.refresh()
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "Failed to delete assessment.")
      }
    })
  }

  const handleSubmitForReview = (assessmentId: string) => {
    setActionError(null)
    startTransition(async () => {
      try {
        await submitAssessmentForReview(assessmentId)
        router.refresh()
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "Failed to submit for review.")
      }
    })
  }

  const columns = [
    {
      key: "title",
      header: "Assessment",
      render: (a: AssessmentRow) => (
        <div>
          <p className="font-medium">{a.title}</p>
          <p className="text-xs text-muted-foreground">
            by {a.createdByName} • {new Date(a.updatedAt).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      key: "subjectName",
      header: "Subject",
      render: (a: AssessmentRow) => <Badge variant="outline">{a.subjectName}</Badge>,
    },
    {
      key: "questionCount",
      header: "Questions",
      render: (a: AssessmentRow) => (
        <div className="flex items-center justify-center gap-1">
          <FileQuestion className="h-4 w-4 text-muted-foreground" />
          {a.questionCount}
        </div>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (a: AssessmentRow) => (
        <div className="flex items-center justify-center gap-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {a.duration}m
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (a: AssessmentRow) => (
        <Badge variant={statusVariant[a.status]} className="gap-1">
          {statusIcon[a.status]}
          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "timesAssigned",
      header: "Assigned",
    },
    {
      key: "avgScore",
      header: "Avg Score",
      render: (a: AssessmentRow) =>
        a.avgScore !== null ? (
          <span
            className={
              a.avgScore >= 70 ? "text-green-600" : a.avgScore >= 50 ? "text-amber-600" : "text-red-600"
            }
          >
            {a.avgScore}%
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
  ]

  return (
    <>
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileQuestion className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Assessments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.published}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.draft}</p>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalQuestions}</p>
                <p className="text-sm text-muted-foreground">Total Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {actionError && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {actionError}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Assessment Library</CardTitle>
          <CardDescription>
            {filteredAssessments.length} assessment{filteredAssessments.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredAssessments}
            columns={columns}
            searchKey="title"
            searchPlaceholder="Search assessments..."
            actions={(assessment) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {assessment.status === "draft" && (
                    <DropdownMenuItem
                      disabled={isPending}
                      onClick={() => handleSubmitForReview(assessment.id)}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Submit for Review
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    disabled={assessment.status !== "draft"}
                    onClick={() => {
                      setActionError(null)
                      setDeleteTarget(assessment)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        </CardContent>
      </Card>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes &quot;{deleteTarget?.title}&quot;. This can&apos;t be undone.
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
    </>
  )
}
