"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Plus, Trash2, Save, Eye, Clock, AlertTriangle } from "lucide-react"
import { updateQuestion } from "./actions"
import type { Difficulty, Question, Subject, Topic } from "@/lib/generated/prisma/client"

type SubjectWithTopics = Subject & { topics: Topic[] }

export function EditQuestionForm({
  question,
  subjects,
}: {
  question: Question
  subjects: SubjectWithTopics[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const initialOptions = question.options as unknown as string[]

  const [questionText, setQuestionText] = useState(question.text)
  const [options, setOptions] = useState<string[]>(initialOptions)
  const [correctAnswer, setCorrectAnswer] = useState<string>(String(question.correctAnswerIndex))
  const [explanation, setExplanation] = useState(question.explanation ?? "")
  const [subjectId, setSubjectId] = useState(question.subjectId)
  const [topicId, setTopicId] = useState(question.topicId)
  const [difficulty, setDifficulty] = useState<Difficulty | "">(question.difficulty)
  const [marks, setMarks] = useState(String(question.marks))
  const [year, setYear] = useState(question.year ? String(question.year) : "")

  const selectedSubject = subjects.find((s) => s.id === subjectId)
  const subjectTopics = selectedSubject?.topics ?? []

  const handleAddOption = () => {
    if (options.length < 6) setOptions([...options, ""])
  }

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
      if (Number(correctAnswer) >= newOptions.length) setCorrectAnswer("0")
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubjectChange = (value: string) => {
    setSubjectId(value)
    setTopicId("")
  }

  const handleSubmit = (e: React.FormEvent, status: "draft" | "pending") => {
    e.preventDefault()
    setError(null)

    if (!difficulty) {
      setError("Please select a difficulty.")
      return
    }

    startTransition(async () => {
      try {
        await updateQuestion(question.id, {
          text: questionText,
          options,
          correctAnswerIndex: Number(correctAnswer),
          explanation,
          subjectId,
          topicId,
          difficulty,
          marks: Number(marks) || 1,
          year: year ? Number(year) : null,
          status,
        })
        router.push("/content-admin/questions")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update question.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/content-admin/questions">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Question</h1>
          <p className="text-muted-foreground">
            {question.status === "rejected" ? "Revise and resubmit for review" : "Update this draft question"}
          </p>
        </div>
      </div>

      {question.status === "rejected" && question.rejectionReason && (
        <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-800">Revision requested</p>
            <p className="text-sm text-red-700">{question.rejectionReason}</p>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <form onSubmit={(e) => handleSubmit(e, "pending")}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Question Content</CardTitle>
                <CardDescription>Enter the question and answer options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="question">Question Text *</Label>
                  <Textarea
                    id="question"
                    placeholder="Enter the question..."
                    className="min-h-[100px]"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Answer Options *</Label>
                    {options.length < 6 && (
                      <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                        <Plus className="mr-1 h-4 w-4" />
                        Add Option
                      </Button>
                    )}
                  </div>

                  <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer}>
                    <div className="space-y-3">
                      {options.map((option, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-sm font-medium w-6">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <Input
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + index)}`}
                              required
                            />
                          </div>
                          {options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveOption(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                  <p className="text-sm text-muted-foreground">
                    Select the correct answer by clicking the radio button
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="explanation">Explanation</Label>
                  <Textarea
                    id="explanation"
                    placeholder="Explain why the correct answer is correct..."
                    className="min-h-[80px]"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    This will be shown to students after they answer
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Question Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={subjectId} onValueChange={handleSubjectChange} required>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic *</Label>
                  <Select value={topicId} onValueChange={setTopicId} disabled={!subjectId} required>
                    <SelectTrigger id="topic">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectTopics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)} required>
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="marks">Marks *</Label>
                    <Input
                      id="marks"
                      type="number"
                      min="1"
                      max="10"
                      value={marks}
                      onChange={(e) => setMarks(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger id="year">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2026">2026</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-border/50">
              <CardContent className="p-4 space-y-3">
                <Button type="submit" className="w-full" disabled={isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {isPending ? "Submitting..." : question.status === "rejected" ? "Resubmit for Review" : "Submit for Review"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isPending}
                  onClick={(e) => handleSubmit(e, "draft")}
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setPreviewOpen(true)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Question Preview</DialogTitle>
            <DialogDescription>How this question will appear to learners</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-lg font-medium">{questionText || "(no question text yet)"}</p>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${
                    index === Number(correctAnswer) ? "border-green-500 bg-green-50" : ""
                  }`}
                >
                  <span className="font-semibold">{String.fromCharCode(65 + index)}.</span>
                  <span className="flex-1">{option || `(option ${String.fromCharCode(65 + index)})`}</span>
                  {index === Number(correctAnswer) && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Correct</Badge>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {selectedSubject && <Badge variant="outline">{selectedSubject.name}</Badge>}
              {difficulty && <Badge variant="secondary">{difficulty}</Badge>}
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {marks} mark{Number(marks) !== 1 ? "s" : ""}
              </span>
            </div>
            {explanation && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium mb-1">Explanation</p>
                <p className="text-sm text-muted-foreground">{explanation}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
