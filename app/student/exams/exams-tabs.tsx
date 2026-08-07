"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Clock, FileQuestion, Play, Lock, Calendar, Filter } from "lucide-react"
import type { Difficulty } from "@/lib/generated/prisma/client"

export type AvailableExam = {
  assessmentId: string
  title: string
  subjectName: string
  duration: number
  questionCount: number
  difficulty: Difficulty | null
  deadline: Date | null
  attempts: number
  maxAttempts: number | null
}

export type ScheduledExam = {
  assignmentId: string
  title: string
  subjectName: string
  duration: number
  questionCount: number
  difficulty: Difficulty | null
  startDate: Date
}

export type CompletedExam = {
  attemptId: string
  title: string
  subjectName: string
  score: number
  totalMarks: number
  submittedAt: Date
  timeSpentSeconds: number | null
}

const getDifficultyColor = (difficulty: Difficulty | null) => {
  switch (difficulty) {
    case "Easy":
      return "bg-emerald-500/10 text-emerald-600"
    case "Medium":
      return "bg-amber-500/10 text-amber-600"
    case "Hard":
      return "bg-red-500/10 text-red-600"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getScoreColor = (percentage: number) => {
  if (percentage >= 80) return "text-emerald-600"
  if (percentage >= 60) return "text-amber-600"
  return "text-red-600"
}

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} hour${hours > 1 ? "s" : ""}` : `${hours}h ${rest}m`
}

export function ExamsTabs({
  available,
  scheduled,
  completed,
}: {
  available: AvailableExam[]
  scheduled: ScheduledExam[]
  completed: CompletedExam[]
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")

  const allSubjects = Array.from(
    new Set([...available, ...scheduled, ...completed].map((e) => e.subjectName))
  ).sort()

  const matches = (title: string, subjectName: string) => {
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = subjectFilter === "all" || subjectName === subjectFilter
    return matchesSearch && matchesSubject
  }

  const filteredAvailable = available.filter((e) => matches(e.title, e.subjectName))
  const filteredScheduled = scheduled.filter((e) => matches(e.title, e.subjectName))
  const filteredCompleted = completed.filter((e) => matches(e.title, e.subjectName))

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search exams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {allSubjects.map((subject) => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Available ({filteredAvailable.length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({filteredScheduled.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({filteredCompleted.length})</TabsTrigger>
        </TabsList>

        {/* Available */}
        <TabsContent value="available" className="space-y-4">
          {filteredAvailable.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No available exams right now.</p>
          )}
          {filteredAvailable.map((exam) => (
            <Card key={exam.assessmentId} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{exam.title}</h3>
                      <Badge variant="secondary">{exam.subjectName}</Badge>
                      <Badge className={getDifficultyColor(exam.difficulty)}>
                        {exam.difficulty ?? "Mixed"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(exam.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileQuestion className="h-4 w-4" />
                        {exam.questionCount} questions
                      </span>
                      {exam.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Due: {exam.deadline.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {exam.maxAttempts !== null && exam.attempts > 0 && (
                      <p className="text-sm text-amber-600">
                        Attempts: {exam.attempts}/{exam.maxAttempts}
                      </p>
                    )}
                  </div>
                  <Link href={`/student/exams/${exam.assessmentId}/start`}>
                    <Button size="lg" className="gap-2 w-full lg:w-auto">
                      <Play className="h-4 w-4" />
                      Start Exam
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Scheduled */}
        <TabsContent value="scheduled" className="space-y-4">
          {filteredScheduled.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No scheduled exams.</p>
          )}
          {filteredScheduled.map((exam) => (
            <Card key={exam.assignmentId} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{exam.title}</h3>
                      <Badge variant="secondary">{exam.subjectName}</Badge>
                      <Badge className={getDifficultyColor(exam.difficulty)}>
                        {exam.difficulty ?? "Mixed"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(exam.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileQuestion className="h-4 w-4" />
                        {exam.questionCount} questions
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="font-semibold text-primary">{exam.startDate.toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {exam.startDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                    <Button size="lg" variant="outline" disabled className="gap-2">
                      <Lock className="h-4 w-4" />
                      Not Yet Available
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Completed */}
        <TabsContent value="completed" className="space-y-4">
          {filteredCompleted.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No completed exams yet.</p>
          )}
          {filteredCompleted.map((exam) => {
            const percentage = exam.totalMarks > 0 ? Math.round((exam.score / exam.totalMarks) * 100) : 0
            const minutes = exam.timeSpentSeconds ? Math.round(exam.timeSpentSeconds / 60) : null
            return (
              <Card key={exam.attemptId} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{exam.title}</h3>
                        <Badge variant="secondary">{exam.subjectName}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {exam.submittedAt.toLocaleDateString()}
                        </span>
                        {minutes !== null && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Time taken: {minutes} min
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={`text-3xl font-bold ${getScoreColor(percentage)}`}>{percentage}%</p>
                        <p className="text-sm text-muted-foreground">
                          {exam.score}/{exam.totalMarks} marks
                        </p>
                      </div>
                      <Link href={`/student/results/${exam.attemptId}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>
    </>
  )
}
