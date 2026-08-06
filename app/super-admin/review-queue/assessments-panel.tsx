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
import { approveAssessment, rejectAssessment, bulkApproveAssessments } from "./actions"
import type { Assessment, AuditLog, Subject } from "@/lib/generated/prisma/client"

export type PendingAssessmentRow = Assessment & {
  subject: Subject
  createdBy: { name: string }
  _count: { questions: number }
}

export type AssessmentAuditRow = AuditLog & {
  actor: { name: string } | null
}

export function AssessmentsPanel({
  pendingAssessments,
  history,
  subjects,
}: {
  pendingAssessments: PendingAssessmentRow[]
  history: AssessmentAuditRow[]
  subjects: Subject[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [selectedAssessment, setSelectedAssessment] = useState<PendingAssessmentRow | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [actionError, setActionError] = useState<string | null>(null)

  const filteredAssessments = pendingAssessments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.createdBy.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = subjectFilter === "all" || a.subjectId === subjectFilter
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

  const handleApprove = (assessmentId: string) => {
    runAction(() => approveAssessment(assessmentId), () => {
      setPreviewOpen(false)
      setSelectedAssessment(null)
    })
  }

  const handleReject = () => {
    if (!selectedAssessment) return
    runAction(() => rejectAssessment(selectedAssessment.id, rejectionReason), () => {
      setRejectOpen(false)
      setPreviewOpen(false)
      setRejectionReason("")
      setSelectedAssessment(null)
    })
  }

  const handleBulkApprove = () => {
    runAction(() => bulkApproveAssessments(selectedIds), () => setSelectedIds([]))
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === filteredAssessments.length ? [] : filteredAssessments.map((a) => a.id))
  }

  return (
    <>
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingAssessments.length})
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
                  placeholder="Search assessments or authors..."
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
                <CardTitle className="text-lg">Assessments Awaiting Review</CardTitle>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedIds.length === filteredAssessments.length && filteredAssessments.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">Select All</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredAssessments.length === 0 && (
                  <p className="p-6 text-center text-sm text-muted-foreground">Nothing pending review.</p>
                )}
                {filteredAssessments.map((assessment) => (
                  <div key={assessment.id} className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={selectedIds.includes(assessment.id)}
                      onCheckedChange={() => toggleSelect(assessment.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-foreground line-clamp-2">{assessment.title}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="outline">{assessment.subject.name}</Badge>
                            <Badge variant="secondary">{assessment._count.questions} questions</Badge>
                            {assessment.difficulty && (
                              <Badge
                                className={
                                  assessment.difficulty === "Easy"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : assessment.difficulty === "Medium"
                                    ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                    : "bg-red-100 text-red-800 hover:bg-red-100"
                                }
                              >
                                {assessment.difficulty}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              {assessment.createdBy.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {assessment.createdAt.toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {assessment.duration} min
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAssessment(assessment)
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
                            onClick={() => handleApprove(assessment.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedAssessment(assessment)
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
              Showing {filteredAssessments.length} of {pendingAssessments.length} assessments
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
              <CardDescription>Assessments reviewed recently</CardDescription>
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
            <DialogTitle>Review Assessment</DialogTitle>
            <DialogDescription>Review the assessment details and approve or reject</DialogDescription>
          </DialogHeader>
          {selectedAssessment && (
            <div className="space-y-6">
              <div>
                <Label className="text-muted-foreground">Title</Label>
                <p className="text-lg font-medium mt-1">{selectedAssessment.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Subject</Label>
                  <p className="font-medium">{selectedAssessment.subject.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Difficulty</Label>
                  <p className="font-medium">{selectedAssessment.difficulty ?? "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Questions</Label>
                  <p className="font-medium">{selectedAssessment._count.questions}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <p className="font-medium">{selectedAssessment.duration} minutes</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted By</Label>
                  <p className="font-medium">{selectedAssessment.createdBy.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted On</Label>
                  <p className="font-medium">{selectedAssessment.createdAt.toLocaleDateString()}</p>
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
              onClick={() => selectedAssessment && handleApprove(selectedAssessment.id)}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve &amp; Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Assessment</DialogTitle>
            <DialogDescription>
              Provide a reason for rejection to help the content author improve. The assessment returns to draft so they can revise and resubmit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assessment-reason">Rejection Reason</Label>
              <Textarea
                id="assessment-reason"
                placeholder="Explain why this assessment needs revision..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Quick Reasons</Label>
              <div className="flex flex-wrap gap-2">
                {["Duration doesn't match question count", "Contains unapproved questions", "Not aligned with syllabus", "Duplicate assessment", "Difficulty mismatch"].map((reason) => (
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
              Reject Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
