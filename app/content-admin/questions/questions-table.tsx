"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { MoreHorizontal, Eye, Edit, Trash2, Filter } from "lucide-react"
import { deleteQuestion } from "./actions"
import type { Question, Subject, Topic } from "@/lib/generated/prisma/client"

export type QuestionRow = Question & {
  subject: Subject
  topic: Topic
  subjectName: string
  topicName: string
  _count: { assessmentQuestions: number }
}

export function QuestionsTable({
  questions,
  subjects,
}: {
  questions: QuestionRow[]
  subjects: Subject[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteTarget, setDeleteTarget] = useState<QuestionRow | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const years = Array.from(new Set(questions.map((q) => q.year).filter((y): y is number => y !== null))).sort(
    (a, b) => b - a
  )
  const [yearFilter, setYearFilter] = useState("all")

  const filteredQuestions = questions.filter((q) => {
    const matchesSubject = subjectFilter === "all" || q.subjectId === subjectFilter
    const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter
    const matchesStatus = statusFilter === "all" || q.status === statusFilter
    const matchesYear = yearFilter === "all" || String(q.year) === yearFilter
    return matchesSubject && matchesDifficulty && matchesStatus && matchesYear
  })

  const handleDelete = () => {
    if (!deleteTarget) return
    setDeleteError(null)
    startTransition(async () => {
      try {
        await deleteQuestion(deleteTarget.id)
        setDeleteTarget(null)
        router.refresh()
      } catch (error) {
        setDeleteError(error instanceof Error ? error.message : "Failed to delete question.")
      }
    })
  }

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (q: QuestionRow) => (
        <span className="font-mono text-sm">{q.id.slice(0, 8)}</span>
      ),
    },
    {
      key: "subjectName",
      header: "Subject",
      render: (q: QuestionRow) => (
        <div>
          <p className="font-medium">{q.subjectName}</p>
          <p className="text-sm text-muted-foreground">{q.topicName}</p>
        </div>
      ),
    },
    {
      key: "difficulty",
      header: "Difficulty",
      render: (q: QuestionRow) => (
        <Badge
          variant="secondary"
          className={
            q.difficulty === "Easy"
              ? "bg-emerald-100 text-emerald-700"
              : q.difficulty === "Medium"
              ? "bg-amber-100 text-amber-700"
              : "bg-red-100 text-red-700"
          }
        >
          {q.difficulty}
        </Badge>
      ),
    },
    {
      key: "year",
      header: "Year",
      render: (q: QuestionRow) => q.year ?? "-",
    },
    {
      key: "marks",
      header: "Marks",
    },
    {
      key: "status",
      header: "Status",
      render: (q: QuestionRow) => (
        <Badge
          variant="secondary"
          className={
            q.status === "approved"
              ? "bg-emerald-100 text-emerald-700"
              : q.status === "pending"
              ? "bg-amber-100 text-amber-700"
              : q.status === "rejected"
              ? "bg-red-100 text-red-700"
              : "bg-muted text-muted-foreground"
          }
        >
          {q.status}
        </Badge>
      ),
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
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>All Questions</CardTitle>
          <CardDescription>{filteredQuestions.length} questions submitted</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredQuestions}
            columns={columns}
            searchKey="subjectName"
            searchPlaceholder="Search by subject..."
            actions={(question) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={question.status !== "draft" && question.status !== "rejected"}
                    asChild={question.status === "draft" || question.status === "rejected"}
                  >
                    {question.status === "draft" || question.status === "rejected" ? (
                      <Link href={`/content-admin/questions/${question.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    disabled={question.status !== "draft"}
                    onClick={() => {
                      setDeleteError(null)
                      setDeleteTarget(question)
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
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
            <AlertDialogTitle>Delete this question?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the draft question in {deleteTarget?.subjectName} ({deleteTarget?.topicName}).
              This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
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
