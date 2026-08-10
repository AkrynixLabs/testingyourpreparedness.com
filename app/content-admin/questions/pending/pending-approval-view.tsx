"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  MessageSquare,
  Calendar,
  AlertTriangle,
  FileQuestion,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { StatCard } from "@/components/stat-card"
import type { Question, Subject, Topic } from "@/lib/generated/prisma/client"

type PendingQuestion = Question & { subject: Subject; topic: Topic }
type ReviewedQuestion = Question & { subject: Subject; topic: Topic; reviewedBy: { id: string; name: string } | null }

export function PendingApprovalView({
  pendingQuestions,
  reviewedQuestions,
  stats,
}: {
  pendingQuestions: PendingQuestion[]
  reviewedQuestions: ReviewedQuestion[]
  stats: { approvedCount: number; rejectedCount: number; avgReviewDays: string | null }
}) {
  const [selectedQuestion, setSelectedQuestion] = useState<PendingQuestion | ReviewedQuestion | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredReviewed = reviewedQuestions.filter(
    (q) => statusFilter === "all" || q.status === statusFilter
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Approval</h1>
          <p className="text-muted-foreground">Track the status of questions you have submitted for review</p>
        </div>
        <Button asChild>
          <Link href="/content-admin/questions/create">
            <FileQuestion className="h-4 w-4 mr-2" />
            Create New Question
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Review"
          value={pendingQuestions.length.toString()}
          changeLabel="Awaiting approval"
          icon={Clock}
          change={0}
        />
        <StatCard
          title="Approved"
          value={stats.approvedCount.toString()}
          changeLabel="All time"
          icon={CheckCircle2}
          change={0}
        />
        <StatCard
          title="Needs Revision"
          value={stats.rejectedCount.toString()}
          changeLabel="Require changes"
          icon={XCircle}
          change={0}
        />
        <StatCard
          title="Avg Review Time"
          value={stats.avgReviewDays !== null ? `${stats.avgReviewDays} days` : "-"}
          changeLabel="Per question"
          icon={Clock}
          change={0}
        />
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-4 p-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Approval Workflow</h3>
            <p className="text-sm text-muted-foreground mt-1">
              All questions you create are submitted for review by the Super Administrator. Once approved, they will
              be added to the official Question Bank and can be used in assessments. If a question needs revision,
              you will receive feedback to help improve it.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingQuestions.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Reviewed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Questions Awaiting Review</CardTitle>
              <CardDescription>
                These questions are in the review queue and will be processed by the Super Administrator
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {pendingQuestions.length === 0 ? (
                <div className="p-8 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <h3 className="mt-4 font-semibold">No pending questions</h3>
                  <p className="text-sm text-muted-foreground mt-1">All your questions have been reviewed</p>
                  <Button asChild className="mt-4">
                    <Link href="/content-admin/questions/create">Create New Question</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {pendingQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-foreground line-clamp-2">{question.text}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline">{question.subject.name}</Badge>
                              <Badge variant="secondary">{question.topic.name}</Badge>
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
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Submitted {new Date(question.createdAt).toLocaleDateString()}
                              </span>
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending Review
                              </Badge>
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
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Needs Revision</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Review History</CardTitle>
              <CardDescription>Questions that have been reviewed by the Super Administrator</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {filteredReviewed.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No reviewed questions yet.</div>
              ) : (
                <div className="divide-y">
                  {filteredReviewed.map((question) => (
                    <div
                      key={question.id}
                      className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          question.status === "approved" ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {question.status === "approved" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-foreground line-clamp-2">{question.text}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline">{question.subject.name}</Badge>
                              <Badge variant="secondary">{question.topic.name}</Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>Reviewed by {question.reviewedBy?.name ?? "Super Admin"}</span>
                              <span>{new Date(question.updatedAt).toLocaleDateString()}</span>
                            </div>
                            {question.status === "rejected" && question.rejectionReason && (
                              <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="h-4 w-4 text-red-600 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-red-800">Revision Required</p>
                                    <p className="text-sm text-red-700 mt-1">{question.rejectionReason}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              variant={question.status === "approved" ? "default" : "destructive"}
                              className={
                                question.status === "approved" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""
                              }
                            >
                              {question.status === "approved" ? "Approved" : "Needs Revision"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedQuestion(question)
                                setPreviewOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {question.status === "rejected" && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/content-admin/questions/${question.id}/edit`}>
                                  Revise & Resubmit
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Question Preview</DialogTitle>
            <DialogDescription>Question ID: {selectedQuestion?.id.slice(0, 8)}</DialogDescription>
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
                  {(selectedQuestion.options as string[]).map((option, index) => (
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
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Correct Answer</Badge>
                      )}
                    </div>
                  ))}
                </RadioGroup>
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
                  <Label className="text-muted-foreground">Submitted</Label>
                  <p className="font-medium">{new Date(selectedQuestion.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
