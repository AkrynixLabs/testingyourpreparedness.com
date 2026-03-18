"use client"

import { useState } from "react"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  User,
  Calendar,
  BookOpen,
  AlertTriangle,
  CheckSquare,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { StatCard } from "@/components/stat-card"

// Demo data for pending questions
const pendingQuestions = [
  {
    id: "Q001",
    question: "What is the chemical formula for water?",
    options: ["H2O", "CO2", "NaCl", "O2"],
    correctAnswer: 0,
    subject: "Integrated Science",
    topic: "Chemistry Basics",
    difficulty: "Easy",
    submittedBy: "Ama Boateng",
    submittedAt: "2024-01-15T10:30:00",
    status: "pending",
  },
  {
    id: "Q002",
    question: "Which of the following is NOT a type of rock?",
    options: ["Igneous", "Sedimentary", "Metamorphic", "Calcium"],
    correctAnswer: 3,
    subject: "Integrated Science",
    topic: "Earth Science",
    difficulty: "Medium",
    submittedBy: "Kofi Asante",
    submittedAt: "2024-01-15T09:15:00",
    status: "pending",
  },
  {
    id: "Q003",
    question: "Simplify: 3x + 5x - 2x",
    options: ["6x", "8x", "10x", "4x"],
    correctAnswer: 0,
    subject: "Mathematics",
    topic: "Algebra",
    difficulty: "Easy",
    submittedBy: "Ama Boateng",
    submittedAt: "2024-01-14T16:45:00",
    status: "pending",
  },
  {
    id: "Q004",
    question: "Who was the first President of Ghana?",
    options: ["J.B. Danquah", "Kwame Nkrumah", "Jerry Rawlings", "John Kufuor"],
    correctAnswer: 1,
    subject: "Social Studies",
    topic: "Ghana History",
    difficulty: "Easy",
    submittedBy: "Yaa Mensah",
    submittedAt: "2024-01-14T14:20:00",
    status: "pending",
  },
  {
    id: "Q005",
    question: "What is the past tense of 'run'?",
    options: ["Runned", "Ran", "Running", "Runs"],
    correctAnswer: 1,
    subject: "English Language",
    topic: "Grammar",
    difficulty: "Easy",
    submittedBy: "Ama Boateng",
    submittedAt: "2024-01-14T11:00:00",
    status: "pending",
  },
]

const reviewHistory = [
  {
    id: "Q100",
    question: "Calculate the area of a rectangle with length 5cm and width 3cm",
    subject: "Mathematics",
    submittedBy: "Kofi Asante",
    reviewedAt: "2024-01-15T08:00:00",
    status: "approved",
    reviewer: "Dr. Kwaku Mensah",
  },
  {
    id: "Q099",
    question: "What is photosynthesis?",
    subject: "Integrated Science",
    submittedBy: "Ama Boateng",
    reviewedAt: "2024-01-14T17:30:00",
    status: "rejected",
    reviewer: "Dr. Kwaku Mensah",
    rejectionReason: "Question needs more specific options",
  },
  {
    id: "Q098",
    question: "Name three rivers in Ghana",
    subject: "Social Studies",
    submittedBy: "Yaa Mensah",
    reviewedAt: "2024-01-14T15:00:00",
    status: "approved",
    reviewer: "Dr. Kwaku Mensah",
  },
]

export default function ReviewQueuePage() {
  const [selectedQuestion, setSelectedQuestion] = useState<typeof pendingQuestions[0] | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])

  const subjects = ["All Subjects", "Mathematics", "English Language", "Integrated Science", "Social Studies"]

  const filteredQuestions = pendingQuestions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.submittedBy.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = subjectFilter === "all" || q.subject === subjectFilter
    return matchesSearch && matchesSubject
  })

  const handleApprove = (questionId: string) => {
    console.log("Approved question:", questionId)
    setPreviewOpen(false)
    setSelectedQuestion(null)
  }

  const handleReject = () => {
    if (selectedQuestion) {
      console.log("Rejected question:", selectedQuestion.id, "Reason:", rejectionReason)
      setRejectOpen(false)
      setPreviewOpen(false)
      setRejectionReason("")
      setSelectedQuestion(null)
    }
  }

  const handleBulkApprove = () => {
    console.log("Bulk approved:", selectedQuestions)
    setSelectedQuestions([])
  }

  const toggleSelectQuestion = (id: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([])
    } else {
      setSelectedQuestions(filteredQuestions.map((q) => q.id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Review Queue</h1>
        <p className="text-muted-foreground">
          Review and approve questions submitted by Content Administrators
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Review"
          value="24"
          changeLabel="Awaiting approval"
          icon={Clock}
          change={0}
        />
        <StatCard
          title="Approved Today"
          value="18"
          changeLabel="Questions approved"
          icon={CheckCircle2}
          change={12}
        />
        <StatCard
          title="Rejected Today"
          value="3"
          changeLabel="Sent back for revision"
          icon={XCircle}
          change={-2}
        />
        <StatCard
          title="Avg Review Time"
          value="4.2h"
          changeLabel="Per question"
          icon={Clock}
          change={-15}
        />
      </div>

      {/* Main Content */}
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
          {/* Filters */}
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
                  {subjects.slice(1).map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedQuestions.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedQuestions([])}>
                  Clear Selection ({selectedQuestions.length})
                </Button>
                <Button onClick={handleBulkApprove}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Selected
                </Button>
              </div>
            )}
          </div>

          {/* Questions List */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Questions Awaiting Review</CardTitle>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">Select All</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedQuestions.includes(question.id)}
                      onCheckedChange={() => toggleSelectQuestion(question.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-foreground line-clamp-2">
                            {question.question}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="outline">{question.subject}</Badge>
                            <Badge variant="secondary">{question.topic}</Badge>
                            <Badge
                              variant={
                                question.difficulty === "Easy"
                                  ? "default"
                                  : question.difficulty === "Medium"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className={
                                question.difficulty === "Easy"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : question.difficulty === "Medium"
                                  ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                  : ""
                              }
                            >
                              {question.difficulty}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              {question.submittedBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(question.submittedAt).toLocaleDateString()}
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

          {/* Pagination */}
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
              <CardDescription>Questions you have reviewed recently</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {reviewHistory.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        item.status === "approved"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {item.status === "approved" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground line-clamp-1">
                        {item.question}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{item.subject}</span>
                        <span>by {item.submittedBy}</span>
                        <span>{new Date(item.reviewedAt).toLocaleDateString()}</span>
                      </div>
                      {item.rejectionReason && (
                        <p className="text-sm text-red-600 mt-1">
                          Reason: {item.rejectionReason}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={item.status === "approved" ? "default" : "destructive"}
                      className={
                        item.status === "approved"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : ""
                      }
                    >
                      {item.status === "approved" ? "Approved" : "Rejected"}
                    </Badge>
                  </div>
                ))}
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
            <DialogDescription>
              Review the question details and approve or reject
            </DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-6">
              <div>
                <Label className="text-muted-foreground">Question</Label>
                <p className="text-lg font-medium mt-1">{selectedQuestion.question}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Answer Options</Label>
                <RadioGroup value={String(selectedQuestion.correctAnswer)} className="mt-2">
                  {selectedQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg border ${
                        index === selectedQuestion.correctAnswer
                          ? "border-green-500 bg-green-50"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem value={String(index)} disabled />
                      <Label className="flex-1 cursor-default">
                        {String.fromCharCode(65 + index)}. {option}
                      </Label>
                      {index === selectedQuestion.correctAnswer && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Correct Answer
                        </Badge>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Subject</Label>
                  <p className="font-medium">{selectedQuestion.subject}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Topic</Label>
                  <p className="font-medium">{selectedQuestion.topic}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Difficulty</Label>
                  <p className="font-medium">{selectedQuestion.difficulty}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted By</Label>
                  <p className="font-medium">{selectedQuestion.submittedBy}</p>
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
            <DialogDescription>
              Provide a reason for rejection to help the content author improve
            </DialogDescription>
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
                {[
                  "Unclear question wording",
                  "Incorrect answer marked",
                  "Options too similar",
                  "Not aligned with syllabus",
                  "Duplicate question",
                ].map((reason) => (
                  <Button
                    key={reason}
                    variant="outline"
                    size="sm"
                    onClick={() => setRejectionReason(reason)}
                  >
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
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
