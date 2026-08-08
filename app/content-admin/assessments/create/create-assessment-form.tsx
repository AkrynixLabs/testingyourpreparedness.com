"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Search, GripVertical } from "lucide-react"
import { createAssessment } from "./actions"
import type { Question, Subject, Topic } from "@/lib/generated/prisma/client"

type QuestionWithRelations = Question & { subject: Subject; topic: Topic }

export function CreateAssessmentForm({
  subjects,
  questions,
}: {
  subjects: Subject[]
  questions: QuestionWithRelations[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [duration, setDuration] = useState("60")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([])

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSubject = !subjectId || q.subjectId === subjectId
      const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSubject && matchesSearch
    })
  }, [questions, subjectId, searchQuery])

  const toggleQuestion = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    )
  }

  const totalMarks = questions
    .filter((q) => selectedQuestionIds.includes(q.id))
    .reduce((sum, q) => sum + q.marks, 0)

  const handleSubmit = (e: React.FormEvent, status: "draft" | "pending") => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        await createAssessment({
          title,
          subjectId,
          duration: Number(duration) || 0,
          questionIds: selectedQuestionIds,
          status,
        })
        router.push("/content-admin/assessments")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create assessment.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/content-admin/assessments">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Assessment</h1>
          <p className="text-muted-foreground">Build a new assessment from the question bank</p>
        </div>
      </div>

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
                <CardTitle className="text-lg">Assessment Details</CardTitle>
                <CardDescription>Basic information about the assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., BECE Mock Exam 2024 - Mathematics"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select
                      value={subjectId}
                      onValueChange={(v) => {
                        setSubjectId(v)
                        setSelectedQuestionIds([])
                      }}
                      required
                    >
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
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="5"
                      max="180"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question selection */}
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Questions</CardTitle>
                    <CardDescription>
                      Select questions from the approved bank ({selectedQuestionIds.length} selected)
                    </CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search questions..."
                      className="pl-9 w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!subjectId ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    Select a subject to see available questions.
                  </p>
                ) : filteredQuestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No approved questions found for this subject.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredQuestions.map((question) => (
                      <div
                        key={question.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                          selectedQuestionIds.includes(question.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <Checkbox
                          checked={selectedQuestionIds.includes(question.id)}
                          onCheckedChange={() => toggleQuestion(question.id)}
                        />
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{question.text}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">{question.subject.name}</Badge>
                            <Badge variant="outline">{question.topic.name}</Badge>
                            <Badge variant="outline">{question.difficulty}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {question.marks} mark{question.marks !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-medium">{selectedQuestionIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Marks</span>
                  <span className="font-medium">{totalMarks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{duration || 0} mins</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4 space-y-3">
                <Button type="submit" className="w-full" disabled={isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {isPending ? "Submitting..." : "Submit for Review"}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
