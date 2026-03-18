"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
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
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  AlertTriangle,
} from "lucide-react"

const examData = {
  id: 1,
  title: "Integrated Science Quiz 5",
  subject: "Science",
  duration: 60, // minutes
  questions: [
    {
      id: 1,
      text: "Which of the following is NOT a characteristic of living things?",
      options: [
        { id: "a", text: "Growth" },
        { id: "b", text: "Respiration" },
        { id: "c", text: "Rusting" },
        { id: "d", text: "Reproduction" },
      ],
      correctAnswer: "c",
    },
    {
      id: 2,
      text: "The process by which green plants make their own food is called:",
      options: [
        { id: "a", text: "Respiration" },
        { id: "b", text: "Photosynthesis" },
        { id: "c", text: "Digestion" },
        { id: "d", text: "Transpiration" },
      ],
      correctAnswer: "b",
    },
    {
      id: 3,
      text: "Which gas is needed for photosynthesis to take place?",
      options: [
        { id: "a", text: "Oxygen" },
        { id: "b", text: "Nitrogen" },
        { id: "c", text: "Carbon dioxide" },
        { id: "d", text: "Hydrogen" },
      ],
      correctAnswer: "c",
    },
    {
      id: 4,
      text: "The basic unit of life is the:",
      options: [
        { id: "a", text: "Atom" },
        { id: "b", text: "Molecule" },
        { id: "c", text: "Cell" },
        { id: "d", text: "Organ" },
      ],
      correctAnswer: "c",
    },
    {
      id: 5,
      text: "Which of these is a renewable source of energy?",
      options: [
        { id: "a", text: "Coal" },
        { id: "b", text: "Natural gas" },
        { id: "c", text: "Solar energy" },
        { id: "d", text: "Petroleum" },
      ],
      correctAnswer: "c",
    },
    {
      id: 6,
      text: "The force that pulls objects towards the center of the Earth is called:",
      options: [
        { id: "a", text: "Friction" },
        { id: "b", text: "Gravity" },
        { id: "c", text: "Magnetism" },
        { id: "d", text: "Tension" },
      ],
      correctAnswer: "b",
    },
    {
      id: 7,
      text: "Water changes from liquid to gas through a process called:",
      options: [
        { id: "a", text: "Condensation" },
        { id: "b", text: "Freezing" },
        { id: "c", text: "Evaporation" },
        { id: "d", text: "Melting" },
      ],
      correctAnswer: "c",
    },
    {
      id: 8,
      text: "Which organ in the human body is responsible for pumping blood?",
      options: [
        { id: "a", text: "Liver" },
        { id: "b", text: "Lungs" },
        { id: "c", text: "Brain" },
        { id: "d", text: "Heart" },
      ],
      correctAnswer: "d",
    },
  ],
}

export default function ExamTakingPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(examData.duration * 60) // seconds
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalQuestions = examData.questions.length
  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / totalQuestions) * 100

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const toggleFlag = (questionId: number) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const goToQuestion = (index: number) => {
    setCurrentQuestion(index)
  }

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true)
    // Simulate submission
    setTimeout(() => {
      router.push(`/student/results/${examData.id}`)
    }, 1500)
  }, [router])

  const question = examData.questions[currentQuestion]
  const isLowTime = timeRemaining < 300 // Less than 5 minutes

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold">{examData.title}</h1>
            <Badge variant="secondary">{examData.subject}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-lg font-bold ${
                isLowTime
                  ? "bg-red-500/10 text-red-600 animate-pulse"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Clock className="h-5 w-5" />
              {formatTime(timeRemaining)}
            </div>
            <Button
              onClick={() => setShowSubmitDialog(true)}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Submit Exam
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6 px-4">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Main Question Area */}
          <div className="space-y-6">
            {/* Progress */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {totalQuestions}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {answeredCount} of {totalQuestions} answered
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>

            {/* Question Card */}
            <Card className="min-h-[400px]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl leading-relaxed">
                    {question.text}
                  </CardTitle>
                  <Button
                    variant={flaggedQuestions.has(question.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFlag(question.id)}
                    className="shrink-0"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    {flaggedQuestions.has(question.id) ? "Flagged" : "Flag"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[question.id] || ""}
                  onValueChange={(value) => handleAnswerSelect(question.id, value)}
                  className="space-y-3"
                >
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors cursor-pointer hover:bg-muted/50 ${
                        answers[question.id] === option.id
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                      onClick={() => handleAnswerSelect(question.id, option.id)}
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label
                        htmlFor={option.id}
                        className="flex-1 cursor-pointer text-base"
                      >
                        <span className="font-semibold mr-2">
                          {option.id.toUpperCase()}.
                        </span>
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => goToQuestion(currentQuestion - 1)}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={() => goToQuestion(currentQuestion + 1)}
                disabled={currentQuestion === totalQuestions - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Sidebar - Question Navigator */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Question Navigator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {examData.questions.map((q, index) => {
                    const isAnswered = answers[q.id] !== undefined
                    const isFlagged = flaggedQuestions.has(q.id)
                    const isCurrent = index === currentQuestion

                    return (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(index)}
                        className={`relative h-10 w-10 rounded-lg border text-sm font-medium transition-all ${
                          isCurrent
                            ? "border-primary bg-primary text-primary-foreground"
                            : isAnswered
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                            : "border-muted-foreground/20 hover:border-primary/50"
                        }`}
                      >
                        {index + 1}
                        {isFlagged && (
                          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-500" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded border border-emerald-500 bg-emerald-500/10" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded border border-primary bg-primary" />
                    <span>Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative h-4 w-4 rounded border">
                      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500" />
                    </div>
                    <span>Flagged</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Exam Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Answered</span>
                  <span className="font-medium text-emerald-600">{answeredCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unanswered</span>
                  <span className="font-medium text-red-600">
                    {totalQuestions - answeredCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Flagged</span>
                  <span className="font-medium text-amber-600">
                    {flaggedQuestions.size}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Submit Exam?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  You have answered <strong>{answeredCount}</strong> out of{" "}
                  <strong>{totalQuestions}</strong> questions.
                </p>
                {totalQuestions - answeredCount > 0 && (
                  <p className="text-amber-600">
                    Warning: You have {totalQuestions - answeredCount} unanswered
                    question(s).
                  </p>
                )}
                {flaggedQuestions.size > 0 && (
                  <p className="text-amber-600">
                    You have {flaggedQuestions.size} flagged question(s) to review.
                  </p>
                )}
                <p className="pt-2">
                  Once submitted, you cannot change your answers. Are you sure you
                  want to submit?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Review Answers
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary"
            >
              {isSubmitting ? "Submitting..." : "Submit Exam"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
