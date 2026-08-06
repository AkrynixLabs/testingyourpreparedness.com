"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  CheckSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { approveQuestion, rejectQuestion, bulkApproveQuestions } from "./actions"
import type { AuditLog, Question, Subject, Topic, User as PrismaUser } from "@/lib/generated/prisma/client"

export type PendingQuestionRow = Question & {
  subject: Subject
  topic: Topic
  createdBy: { name: string }
}

export type QuestionAuditRow = AuditLog & {
  actor: { name: string } | null
}

export function QuestionsPanel({
  pendingQuestions,
  history,
  subjects,
}: {
  pendingQuestions: PendingQuestionRow[]
  history: QuestionAuditRow[]
  subjects: Subject[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [selectedQuestion, setSelectedQuestion] = useState<PendingQuestionRow | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [actionError, setActionError] = useState<string | null>(null)

  const filteredQuestions = pendingQuestions.filter((q) => {
    const matchesSearch =
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.createdBy.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = subjectFilter === "all" || q.subjectId === subjectFilter
    return matchesSearch && matchesSubject
  })

  const runAction = (fn: () => Promise<void>, onDone?: () => void) => {
    setActionError(null)
    startTransition(async () => {
      try {
        await fn()
        router.refresh()
        onDone?.()
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "Action failed.")
      }
    })
  }

  const handleApprove = (questionId: string) => {
    runAction(() => approveQuestion(questionId), () => {
      setPreviewOpen(false)
      setSelectedQuestion(null)
    })
  }

  const handleReject = () => {
    if (!selectedQuestion) return
    runAction(() => rejectQuestion(selectedQuestion.id, rejectionReason), () => {
      setRejectOpen(false)
      setPreviewOpen(false)
      setRejectionReason("")
      setSelectedQuestion(null)
    })
  }

  const handleBulkApprove = () => {
    runAction(() => bulkApproveQuestions(selectedIds), () => setSelectedIds([]))
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === filteredQuestions.length ? [] : filteredQuestions.map((q) => q.id))
  }

  return (
    <>
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingQuestions.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <CheckSquare className="h-4 w-4" />
            Review History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {actionError && <p className="text-sm text-destructive">{actionError}</p>}

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search questions or authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedIds.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedIds([])}>
                  Clear Selection ({selectedIds.length})
                </Button>
                <Button onClick={handleBulkApprove} disabled={isPending}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Selected
                </Button>
              </div>
            )}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Questions Awaiting Review</CardTitle>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">Select All</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredQuestions.length === 0 && (
                  <p className="p-6 text-center text-sm text-muted-foreground">Nothing pending review.</p>
                )}
                {filteredQuestions.map((question) => (
                  <div key={question.id} className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={selectedIds.includes(question.id)}
                      onCheckedChange={() => toggleSelect(question.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-foreground line-clamp-2">{question.text}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="outline">{question.subject.name}</Badge>
                            <Badge variant="secondary">{question.topic.name}</Badge>
                            <Badge
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
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              {question.createdBy.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {question.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedQuestion(question)
                              setPreviewOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            disabled={isPending}
                            onClick={() => handleApprove(question.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedQuestion(question)
                              setRejectOpen(true)
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredQuestions.length} of {pendingQuestions.length} questions
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Review Activity</CardTitle>
              <CardDescription>Questions reviewed recently</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {history.length === 0 && (
                  <p className="p-6 text-center text-sm text-muted-foreground">No review activity yet.</p>
                )}
                {history.map((item) => {
                  const details = item.details as { reason?: string } | null
                  const isApproved = item.action === "approve"
                  return (
                    <div key={item.id} className="flex items-center gap-4 p-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          isApproved ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}
                      >
                        {isApproved ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground line-clamp-1">{item.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>by {item.actor?.name ?? "Unknown"}</span>
                          <span>{item.timestamp.toLocaleDateString()}</span>
                        </div>
                        {details?.reason && (
                          <p className="text-sm text-red-600 mt-1">Reason: {details.reason}</p>
                        )}
                      </div>
                      <Badge
                        className={isApproved ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                        variant={isApproved ? "default" : "destructive"}
                      >
                        {isApproved ? "Approved" : "Rejected"}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Question</DialogTitle>
            <DialogDescription>Review the question details and approve or reject</DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-6">
              <div>
                <Label className="text-muted-foreground">Question</Label>
                <p className="text-lg font-medium mt-1">{selectedQuestion.text}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Answer Options</Label>
                <div className="mt-2 space-y-2">
                  {(selectedQuestion.options as string[]).map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        index === selectedQuestion.correctAnswerIndex ? "border-green-500 bg-green-50" : "border-border"
                      }`}
                    >
                      <span className="flex-1">{String.fromCharCode(65 + index)}. {option}</span>
                      {index === selectedQuestion.correctAnswerIndex && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Correct Answer</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <Label className="text-muted-foreground">Submitted By</Label>
                  <p className="font-medium">{selectedQuestion.createdBy.name}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                setPreviewOpen(false)
                setRejectOpen(true)
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              disabled={isPending}
              onClick={() => selectedQuestion && handleApprove(selectedQuestion.id)}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Question</DialogTitle>
            <DialogDescription>Provide a reason for rejection to help the content author improve</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this question needs revision..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Quick Reasons</Label>
              <div className="flex flex-wrap gap-2">
                {["Unclear question wording", "Incorrect answer marked", "Options too similar", "Not aligned with syllabus", "Duplicate question"].map((reason) => (
                  <Button key={reason} variant="outline" size="sm" onClick={() => setRejectionReason(reason)}>
                    {reason}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim() || isPending}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
