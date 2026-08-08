"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
import { Clock, ChevronLeft, ChevronRight, Flag, Send, AlertTriangle } from "lucide-react"
import { submitExam, recordTabSwitch } from "./actions"

type ExamQuestion = {
  id: string
  text: string
  options: string[]
}

export function ExamTakingClient({
  attemptId,
  title,
  subjectName,
  questions,
  remainingSeconds,
}: {
  attemptId: string
  title: string
  subjectName: string
  questions: ExamQuestion[]
  remainingSeconds: number
}) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(remainingSeconds)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const totalQuestions = questions.length
  const answeredCount = Object.keys(answers).length
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return
    submittingRef.current = true
    setIsSubmitting(true)
    try {
      const result = await submitExam(attemptId, answers, Array.from(flaggedQuestions))
      router.push(`/student/results/${result.attemptId}`)
    } catch {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }, [attemptId, answers, flaggedQuestions, router])

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
  }, [handleSubmit])

  // Anti-cheat: log (never interrupt) whenever the exam tab loses visibility.
  // Fire-and-forget - a failed log shouldn't disrupt the exam-taking flow.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        recordTabSwitch(attemptId).catch(() => {})
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [attemptId])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
  }

  const toggleFlag = (questionId: string) => {
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

  if (totalQuestions === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="text-muted-foreground">This assessment has no questions yet.</p>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const isLowTime = timeRemaining < 300

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold">{title}</h1>
            <Badge variant="secondary">{subjectName}</Badge>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div
              className={`flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-4 py-2 font-mono text-sm sm:text-lg font-bold ${
                isLowTime ? "bg-red-500/10 text-red-600 animate-pulse" : "bg-primary/10 text-primary"
              }`}
            >
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              {formatTime(timeRemaining)}
            </div>
            <Button
              onClick={() => setShowSubmitDialog(true)}
              className="gap-1 sm:gap-2 text-sm sm:text-base"
              size="sm"
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Submit Exam</span>
              <span className="sm:hidden">Submit</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-4 sm:py-6 px-3 sm:px-4">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_300px]">
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
            <Card className="min-h-[300px] sm:min-h-[400px]">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:justify-between">
                  <CardTitle className="text-lg sm:text-xl leading-relaxed order-2 sm:order-1">
                    {question.text}
                  </CardTitle>
                  <Button
                    variant={flaggedQuestions.has(question.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFlag(question.id)}
                    className="shrink-0 self-end sm:self-auto order-1 sm:order-2"
                  >
                    <Flag className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">
                      {flaggedQuestions.has(question.id) ? "Flagged" : "Flag"}
                    </span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <RadioGroup
                  value={answers[question.id]?.toString() ?? ""}
                  onValueChange={(value) => handleAnswerSelect(question.id, Number(value))}
                  className="space-y-2 sm:space-y-3"
                >
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 sm:space-x-3 rounded-lg border p-3 sm:p-4 transition-colors cursor-pointer hover:bg-muted/50 active:bg-muted ${
                        answers[question.id] === index ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => handleAnswerSelect(question.id, index)}
                    >
                      <RadioGroupItem value={index.toString()} id={`${question.id}-${index}`} />
                      <Label
                        htmlFor={`${question.id}-${index}`}
                        className="flex-1 cursor-pointer text-sm sm:text-base"
                      >
                        <span className="font-semibold mr-1 sm:mr-2">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {option}
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
          <div className="space-y-4 order-first lg:order-last">
            <Card>
              <CardHeader className="pb-3 p-4 sm:p-6 sm:pb-3">
                <CardTitle className="text-base">Question Navigator</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="grid grid-cols-8 sm:grid-cols-5 gap-1.5 sm:gap-2">
                  {questions.map((q, index) => {
                    const isAnswered = answers[q.id] !== undefined
                    const isFlagged = flaggedQuestions.has(q.id)
                    const isCurrent = index === currentQuestion

                    return (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(index)}
                        className={`relative h-8 w-8 sm:h-10 sm:w-10 rounded-lg border text-xs sm:text-sm font-medium transition-all active:scale-95 ${
                          isCurrent
                            ? "border-primary bg-primary text-primary-foreground"
                            : isAnswered
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                            : "border-muted-foreground/20 hover:border-primary/50"
                        }`}
                      >
                        {index + 1}
                        {isFlagged && (
                          <span className="absolute -right-0.5 -top-0.5 sm:-right-1 sm:-top-1 h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-amber-500" />
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
                  <span className="font-medium text-red-600">{totalQuestions - answeredCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Flagged</span>
                  <span className="font-medium text-amber-600">{flaggedQuestions.size}</span>
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
            <AlertDialogDescription>
              You have answered {answeredCount} out of {totalQuestions} questions.
              {totalQuestions - answeredCount > 0 &&
                ` Warning: You have ${totalQuestions - answeredCount} unanswered question(s).`}
              {flaggedQuestions.size > 0 &&
                ` You have ${flaggedQuestions.size} flagged question(s) to review.`}{" "}
              Once submitted, you cannot change your answers. Are you sure you want to submit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting} className="bg-primary">
              {isSubmitting ? "Submitting..." : "Submit Exam"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
