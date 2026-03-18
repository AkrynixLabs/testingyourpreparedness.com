"use client"

import { useState } from "react"
import { 
  CheckCircle2, 
  XCircle, 
  MessageSquare,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Flag,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  Filter,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
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

interface ReviewQuestion {
  id: string
  question: string
  options: { label: string; text: string }[]
  correctAnswer: string
  explanation: string
  subject: string
  topic: string
  difficulty: "Easy" | "Medium" | "Hard"
  submittedBy: string
  submittedAt: string
  status: "pending" | "flagged"
  flagReason?: string
  previousComments: { author: string; comment: string; date: string }[]
}

const reviewQueue: ReviewQuestion[] = [
  {
    id: "1",
    question: "What is the chemical symbol for water?",
    options: [
      { label: "A", text: "H2O" },
      { label: "B", text: "CO2" },
      { label: "C", text: "NaCl" },
      { label: "D", text: "O2" },
    ],
    correctAnswer: "A",
    explanation: "Water is composed of two hydrogen atoms bonded to one oxygen atom, hence H2O.",
    subject: "Integrated Science",
    topic: "Chemistry",
    difficulty: "Easy",
    submittedBy: "Kwame Asante",
    submittedAt: "2024-01-15T10:30:00",
    status: "pending",
    previousComments: []
  },
  {
    id: "2",
    question: "Ghana gained independence in which year?",
    options: [
      { label: "A", text: "1960" },
      { label: "B", text: "1957" },
      { label: "C", text: "1963" },
      { label: "D", text: "1966" },
    ],
    correctAnswer: "B",
    explanation: "Ghana became the first sub-Saharan African country to gain independence from colonial rule on March 6, 1957.",
    subject: "Social Studies",
    topic: "History",
    difficulty: "Easy",
    submittedBy: "Ama Serwah",
    submittedAt: "2024-01-14T14:20:00",
    status: "pending",
    previousComments: []
  },
  {
    id: "3",
    question: "Simplify: 3x + 2x - x",
    options: [
      { label: "A", text: "4x" },
      { label: "B", text: "5x" },
      { label: "C", text: "6x" },
      { label: "D", text: "3x" },
    ],
    correctAnswer: "A",
    explanation: "Combining like terms: 3x + 2x - x = (3 + 2 - 1)x = 4x",
    subject: "Mathematics",
    topic: "Algebra",
    difficulty: "Medium",
    submittedBy: "Kofi Mensah",
    submittedAt: "2024-01-14T09:15:00",
    status: "flagged",
    flagReason: "Answer may be incorrect - needs verification",
    previousComments: [
      { author: "Review Bot", comment: "Auto-flagged: Similar question exists in database", date: "2024-01-14T09:16:00" }
    ]
  },
  {
    id: "4",
    question: "Which organ pumps blood throughout the body?",
    options: [
      { label: "A", text: "Liver" },
      { label: "B", text: "Lungs" },
      { label: "C", text: "Heart" },
      { label: "D", text: "Kidney" },
    ],
    correctAnswer: "C",
    explanation: "The heart is a muscular organ that pumps blood through the circulatory system.",
    subject: "Integrated Science",
    topic: "Biology",
    difficulty: "Easy",
    submittedBy: "Efua Owusu",
    submittedAt: "2024-01-13T16:45:00",
    status: "pending",
    previousComments: []
  },
]

export default function ReviewQueuePage() {
  const [queue] = useState<ReviewQuestion[]>(reviewQueue)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [filterSubject, setFilterSubject] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const currentQuestion = queue[currentIndex]

  const filteredQueue = queue.filter(q => {
    if (filterSubject !== "all" && q.subject !== filterSubject) return false
    if (filterStatus !== "all" && q.status !== filterStatus) return false
    return true
  })

  const handleApprove = () => {
    // In real app, would call API
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
    setReviewComment("")
    setSelectedAnswer("")
  }

  const handleReject = () => {
    setRejectDialogOpen(true)
  }

  const confirmReject = () => {
    // In real app, would call API
    setRejectDialogOpen(false)
    setRejectReason("")
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
    setReviewComment("")
    setSelectedAnswer("")
  }

  const handleSkip = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
    setReviewComment("")
    setSelectedAnswer("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Review Queue</h1>
          <p className="text-muted-foreground">
            {queue.length} questions pending review
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="Integrated Science">Integrated Science</SelectItem>
              <SelectItem value="Social Studies">Social Studies</SelectItem>
              <SelectItem value="English Language">English Language</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Review Progress</span>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} of {filteredQueue.length}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / filteredQueue.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {currentQuestion && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Review Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Question Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{currentQuestion.subject}</Badge>
                      <Badge variant="secondary">{currentQuestion.topic}</Badge>
                      <Badge variant={
                        currentQuestion.difficulty === "Easy" ? "secondary" :
                        currentQuestion.difficulty === "Medium" ? "default" : "destructive"
                      }>
                        {currentQuestion.difficulty}
                      </Badge>
                    </div>
                    {currentQuestion.status === "flagged" && (
                      <div className="flex items-center gap-2 text-amber-600">
                        <Flag className="h-4 w-4" />
                        <span className="text-sm">{currentQuestion.flagReason}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ID: {currentQuestion.id}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question Text */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-lg font-medium">{currentQuestion.question}</p>
                </div>

                {/* Options */}
                <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option) => (
                      <div key={option.label} className="flex items-center space-x-3">
                        <RadioGroupItem 
                          value={option.label} 
                          id={`option-${option.label}`}
                        />
                        <Label 
                          htmlFor={`option-${option.label}`}
                          className={`flex-1 p-3 rounded-lg border cursor-pointer transition-colors ${
                            option.label === currentQuestion.correctAnswer 
                              ? "border-green-500 bg-green-50" 
                              : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <span className="font-medium mr-2">{option.label}.</span>
                          {option.text}
                          {option.label === currentQuestion.correctAnswer && (
                            <CheckCircle2 className="h-4 w-4 text-green-600 inline ml-2" />
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                {/* Explanation */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Explanation</h4>
                  <p className="text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Review Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Review Comment (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Add a comment or suggestion for the question author..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleApprove} className="gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button variant="destructive" onClick={handleReject} className="gap-2">
                    <ThumbsDown className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Edit3 className="h-4 w-4" />
                    Edit & Approve
                  </Button>
                  <Button variant="ghost" onClick={handleSkip}>
                    Skip
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button 
                variant="outline"
                onClick={() => setCurrentIndex(Math.min(queue.length - 1, currentIndex + 1))}
                disabled={currentIndex === queue.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Submission Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Submission Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {currentQuestion.submittedBy.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{currentQuestion.submittedBy}</p>
                    <p className="text-sm text-muted-foreground">Content Creator</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Submitted {new Date(currentQuestion.submittedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Previous Comments */}
            {currentQuestion.previousComments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Previous Comments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentQuestion.previousComments.map((comment, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3" />
                        <span className="font-medium">{comment.author}</span>
                      </div>
                      <p className="text-muted-foreground">{comment.comment}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Queue Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Queue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {queue.slice(0, 5).map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                        index === currentIndex 
                          ? "bg-primary/10 border border-primary" 
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate max-w-[180px]">{q.question}</span>
                        {q.status === "flagged" && (
                          <Flag className="h-3 w-3 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {q.subject}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Keyboard Shortcuts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Keyboard Shortcuts</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approve</span>
                  <kbd className="px-2 py-0.5 bg-muted rounded text-xs">A</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reject</span>
                  <kbd className="px-2 py-0.5 bg-muted rounded text-xs">R</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Skip</span>
                  <kbd className="px-2 py-0.5 bg-muted rounded text-xs">S</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next</span>
                  <kbd className="px-2 py-0.5 bg-muted rounded text-xs">→</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Previous</span>
                  <kbd className="px-2 py-0.5 bg-muted rounded text-xs">←</kbd>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Question</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this question. This will be sent to the content creator.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={rejectReason} onValueChange={setRejectReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="incorrect">Incorrect answer</SelectItem>
                <SelectItem value="unclear">Question unclear</SelectItem>
                <SelectItem value="duplicate">Duplicate question</SelectItem>
                <SelectItem value="offtopic">Off-topic / Not BECE aligned</SelectItem>
                <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Additional comments (optional)..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={!rejectReason}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
