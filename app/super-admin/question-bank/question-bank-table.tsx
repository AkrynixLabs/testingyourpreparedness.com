"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Eye,
  Archive,
  ArchiveRestore,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { setQuestionActive } from "./actions"
import type { Question, Subject, Topic, User, Difficulty } from "@/lib/generated/prisma/client"

export type QuestionRow = Question & {
  subject: Subject
  topic: Topic
  createdBy: User
  reviewedBy: User | null
  timesUsed: number
}

export function QuestionBankTable({
  questions,
  subjects,
}: {
  questions: QuestionRow[]
  subjects: Subject[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionRow | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all")
  const [statusFilter, setStatusFilter] = useState<"active" | "archived" | "all">("active")

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = subjectFilter === "all" || q.subjectId === subjectFilter
    const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && q.isActive) ||
      (statusFilter === "archived" && !q.isActive)
    return matchesSearch && matchesSubject && matchesDifficulty && matchesStatus
  })

  const handleToggleActive = (question: QuestionRow) => {
    setPendingId(question.id)
    startTransition(async () => {
      await setQuestionActive(question.id, !question.isActive)
      router.refresh()
      setPendingId(null)
    })
  }

  const options = (q: QuestionRow) => q.options as unknown as string[]

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg">All Questions</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-[250px]"
                />
              </div>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={(v) => setDifficultyFilter(v as Difficulty | "all")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "active" | "archived" | "all")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="text-center">Used</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No questions match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>
                      <p className="line-clamp-1 max-w-[300px]">{question.text}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{question.subject.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          question.difficulty === "Easy"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : question.difficulty === "Medium"
                            ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }
                      >
                        {question.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{question.timesUsed}</TableCell>
                    <TableCell className="text-muted-foreground">{question.createdBy.name}</TableCell>
                    <TableCell>
                      {question.isActive ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Archived</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isPending && pendingId === question.id}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedQuestion(question)
                              setPreviewOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          {question.isActive ? (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleToggleActive(question)}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleToggleActive(question)}>
                              <ArchiveRestore className="h-4 w-4 mr-2" />
                              Restore
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        Showing {filteredQuestions.length} of {questions.length} questions
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
            <DialogDescription>Question ID: {selectedQuestion?.id}</DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-6">
              <div>
                <Label className="text-muted-foreground">Question</Label>
                <p className="text-lg font-medium mt-1">{selectedQuestion.text}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Answer Options</Label>
                <RadioGroup value={String(selectedQuestion.correctAnswerIndex)} className="mt-2">
                  {options(selectedQuestion).map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg border ${
                        index === selectedQuestion.correctAnswerIndex
                          ? "border-green-500 bg-green-50"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem value={String(index)} disabled />
                      <Label className="flex-1 cursor-default">
                        {String.fromCharCode(65 + index)}. {option}
                      </Label>
                      {index === selectedQuestion.correctAnswerIndex && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Correct Answer
                        </Badge>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Subject</Label>
                  <p className="font-medium">{selectedQuestion.subject.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Topic</Label>
                  <p className="font-medium">{selectedQuestion.topic.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Difficulty</Label>
                  <p className="font-medium">{selectedQuestion.difficulty}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Author</Label>
                  <p className="font-medium">{selectedQuestion.createdBy.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Times Used</Label>
                  <p className="font-medium">{selectedQuestion.timesUsed} times</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Marks</Label>
                  <p className="font-medium">{selectedQuestion.marks}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Approved By</Label>
                  <p className="font-medium">{selectedQuestion.reviewedBy?.name ?? "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Approved Date</Label>
                  <p className="font-medium">{selectedQuestion.updatedAt.toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
