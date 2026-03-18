"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { subjects, topics } from "@/lib/demo-data"
import { ArrowLeft, Plus, Trash2, Save, Eye } from "lucide-react"
import Link from "next/link"

export default function CreateQuestionPage() {
  const router = useRouter()
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [options, setOptions] = useState(["", "", "", ""])
  const [correctAnswer, setCorrectAnswer] = useState<string>("0")

  const subjectTopics = selectedSubject
    ? topics[parseInt(selectedSubject) as keyof typeof topics] || []
    : []

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""])
    }
  }

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
      if (parseInt(correctAnswer) >= newOptions.length) {
        setCorrectAnswer("0")
      }
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = (e: React.FormEvent, action: "draft" | "review") => {
    e.preventDefault()
    // In a real app, this would save to the database
    router.push("/content-admin/questions")
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
          <h1 className="text-2xl font-bold tracking-tight">Create Question</h1>
          <p className="text-muted-foreground">
            Add a new question to the question bank
          </p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, "review")}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question text */}
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
            {/* Metadata */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Question Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject} required>
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
                  <Label htmlFor="topic">Topic *</Label>
                  <Select disabled={!selectedSubject} required>
                    <SelectTrigger id="topic">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectTopics.map((topic, i) => (
                        <SelectItem key={i} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select required>
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
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
                      defaultValue="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select>
                      <SelectTrigger id="year">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-border/50">
              <CardContent className="p-4 space-y-3">
                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Submit for Review
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={(e) => handleSubmit(e as unknown as React.FormEvent, "draft")}
                >
                  Save as Draft
                </Button>
                <Button type="button" variant="ghost" className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
