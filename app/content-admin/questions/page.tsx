"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import { questions, subjects } from "@/lib/demo-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Filter } from "lucide-react"

// Extended mock data for the question bank
const extendedQuestions = [
  ...questions,
  { id: 7, subject: "Mathematics", topic: "Statistics", difficulty: "Medium", year: 2024, marks: 2, status: "approved" },
  { id: 8, subject: "English Language", topic: "Vocabulary", difficulty: "Easy", year: 2023, marks: 1, status: "approved" },
  { id: 9, subject: "Integrated Science", topic: "Ecology", difficulty: "Hard", year: 2024, marks: 3, status: "pending" },
  { id: 10, subject: "Social Studies", topic: "Economics", difficulty: "Medium", year: 2023, marks: 2, status: "approved" },
  { id: 11, subject: "Mathematics", topic: "Trigonometry", difficulty: "Hard", year: 2024, marks: 3, status: "draft" },
  { id: 12, subject: "English Language", topic: "Essay Writing", difficulty: "Hard", year: 2024, marks: 5, status: "approved" },
]

export default function QuestionBankPage() {
  const columns = [
    {
      key: "id",
      header: "ID",
      render: (q: typeof extendedQuestions[0]) => (
        <span className="font-mono text-sm">Q{q.id.toString().padStart(4, "0")}</span>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      render: (q: typeof extendedQuestions[0]) => (
        <div>
          <p className="font-medium">{q.subject}</p>
          <p className="text-sm text-muted-foreground">{q.topic}</p>
        </div>
      ),
    },
    {
      key: "difficulty",
      header: "Difficulty",
      render: (q: typeof extendedQuestions[0]) => (
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
    },
    {
      key: "marks",
      header: "Marks",
    },
    {
      key: "status",
      header: "Status",
      render: (q: typeof extendedQuestions[0]) => (
        <Badge
          variant="secondary"
          className={
            q.status === "approved"
              ? "bg-emerald-100 text-emerald-700"
              : q.status === "pending"
              ? "bg-amber-100 text-amber-700"
              : "bg-muted text-muted-foreground"
          }
        >
          {q.status}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Question Bank</h1>
          <p className="text-muted-foreground">
            Manage all questions in the platform
          </p>
        </div>
        <Button asChild>
          <Link href="/content-admin/questions/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Question
          </Link>
        </Button>
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
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.code}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>All Questions</CardTitle>
          <CardDescription>
            {extendedQuestions.length} questions in the bank
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={extendedQuestions}
            columns={columns}
            searchKey="subject"
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
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
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
