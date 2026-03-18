"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { subjects, schools, sampleExamQuestions } from "@/lib/demo-data"
import { ArrowLeft, Plus, Trash2, Save, Search, GripVertical } from "lucide-react"
import Link from "next/link"

export default function CreateAssessmentPage() {
  const router = useRouter()
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([1, 3, 5])
  const [publishTo, setPublishTo] = useState<string>("global")

  const toggleQuestion = (id: number) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/content-admin/assessments")
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
          <p className="text-muted-foreground">
            Build a new assessment from the question bank
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assessment details */}
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
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this assessment covers..."
                    className="min-h-[80px]"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select required>
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
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
                      defaultValue="60"
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
                      Select questions to include ({selectedQuestions.length} selected)
                    </CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search questions..." className="pl-9 w-[250px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sampleExamQuestions.map((question) => (
                    <div
                      key={question.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                        selectedQuestions.includes(question.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <Checkbox
                        checked={selectedQuestions.includes(question.id)}
                        onCheckedChange={() => toggleQuestion(question.id)}
                      />
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{question.question}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{question.subject}</Badge>
                          <Badge variant="outline">{question.topic}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" className="w-full mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Load More Questions
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing options */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Publish To</Label>
                  <Select value={publishTo} onValueChange={setPublishTo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">All Schools (Global)</SelectItem>
                      <SelectItem value="selected">Selected Schools</SelectItem>
                      <SelectItem value="none">Save as Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {publishTo === "selected" && (
                  <div className="space-y-2">
                    <Label>Select Schools</Label>
                    <div className="max-h-[200px] overflow-y-auto space-y-2 p-2 border rounded-lg">
                      {schools.slice(0, 5).map((school) => (
                        <div key={school.id} className="flex items-center gap-2">
                          <Checkbox id={`school-${school.id}`} />
                          <label
                            htmlFor={`school-${school.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {school.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <Input type="datetime-local" />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to publish immediately
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-medium">{selectedQuestions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Marks</span>
                  <span className="font-medium">
                    {selectedQuestions.reduce((acc, id) => {
                      const q = sampleExamQuestions.find((q) => q.id === id)
                      return acc + 2 // Default 2 marks per question
                    }, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">60 mins</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-border/50">
              <CardContent className="p-4 space-y-3">
                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  {publishTo === "none" ? "Save Draft" : "Publish Assessment"}
                </Button>
                <Button type="button" variant="outline" className="w-full">
                  Preview Assessment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
