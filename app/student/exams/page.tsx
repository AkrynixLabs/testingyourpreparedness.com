"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Clock,
  FileQuestion,
  Play,
  Lock,
  Calendar,
  Filter,
} from "lucide-react"

const availableExams = [
  {
    id: 1,
    title: "Integrated Science Quiz 5",
    subject: "Science",
    description: "Test your knowledge on living things and their environment",
    duration: "1 hour",
    questions: 30,
    difficulty: "Medium",
    deadline: "Mar 25, 2026",
    attempts: 0,
    maxAttempts: 2,
  },
  {
    id: 2,
    title: "Mathematics Practice Set A",
    subject: "Mathematics",
    description: "Algebra, geometry, and number operations practice",
    duration: "1.5 hours",
    questions: 40,
    difficulty: "Hard",
    deadline: "Mar 28, 2026",
    attempts: 0,
    maxAttempts: 1,
  },
  {
    id: 3,
    title: "English Language Comprehension",
    subject: "English",
    description: "Reading comprehension and vocabulary assessment",
    duration: "1 hour",
    questions: 35,
    difficulty: "Medium",
    deadline: "Mar 30, 2026",
    attempts: 1,
    maxAttempts: 2,
  },
]

const scheduledExams = [
  {
    id: 4,
    title: "Mathematics Mock Exam 3",
    subject: "Mathematics",
    description: "Full BECE-style mathematics examination",
    duration: "2 hours",
    questions: 50,
    difficulty: "Hard",
    scheduledDate: "Mar 20, 2026",
    scheduledTime: "9:00 AM",
  },
  {
    id: 5,
    title: "Social Studies Assessment",
    subject: "Social Studies",
    description: "Ghana history, government, and citizenship",
    duration: "1.5 hours",
    questions: 40,
    difficulty: "Medium",
    scheduledDate: "Mar 23, 2026",
    scheduledTime: "2:00 PM",
  },
]

const completedExams = [
  {
    id: 6,
    title: "Mathematics Mock Exam 2",
    subject: "Mathematics",
    score: 78,
    totalMarks: 100,
    completedDate: "Mar 10, 2026",
    duration: "1h 45m",
  },
  {
    id: 7,
    title: "Social Studies Practice Test",
    subject: "Social Studies",
    score: 65,
    totalMarks: 80,
    completedDate: "Mar 8, 2026",
    duration: "1h 20m",
  },
  {
    id: 8,
    title: "ICT Assessment",
    subject: "ICT",
    score: 42,
    totalMarks: 50,
    completedDate: "Mar 5, 2026",
    duration: "50m",
  },
  {
    id: 9,
    title: "English Language Test 2",
    subject: "English",
    score: 72,
    totalMarks: 100,
    completedDate: "Mar 2, 2026",
    duration: "1h 30m",
  },
]

const getDifficultyColor = (difficulty: string) => {
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

const matchesFilters = (
  exam: { title: string; subject: string },
  searchQuery: string,
  subjectFilter: string
) => {
  const matchesSearch = exam.title
    .toLowerCase()
    .includes(searchQuery.toLowerCase())
  const matchesSubject =
    subjectFilter === "all" ||
    exam.subject.toLowerCase().replace(/\s+/g, "-") === subjectFilter
  return matchesSearch && matchesSubject
}

export default function StudentExamsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")

  const filteredAvailableExams = availableExams.filter((exam) =>
    matchesFilters(exam, searchQuery, subjectFilter)
  )
  const filteredScheduledExams = scheduledExams.filter((exam) =>
    matchesFilters(exam, searchQuery, subjectFilter)
  )
  const filteredCompletedExams = completedExams.filter((exam) =>
    matchesFilters(exam, searchQuery, subjectFilter)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
        <p className="text-muted-foreground mt-1">
          View and take your available assessments
        </p>
      </div>

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
            <SelectItem value="mathematics">Mathematics</SelectItem>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="science">Science</SelectItem>
            <SelectItem value="social-studies">Social Studies</SelectItem>
            <SelectItem value="ict">ICT</SelectItem>
            <SelectItem value="rme">RME</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">
            Available ({filteredAvailableExams.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled ({filteredScheduledExams.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({filteredCompletedExams.length})
          </TabsTrigger>
        </TabsList>

        {/* Available Exams */}
        <TabsContent value="available" className="space-y-4">
          {filteredAvailableExams.map((exam) => (
            <Card key={exam.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{exam.title}</h3>
                      <Badge variant="secondary">{exam.subject}</Badge>
                      <Badge className={getDifficultyColor(exam.difficulty)}>
                        {exam.difficulty}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{exam.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {exam.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileQuestion className="h-4 w-4" />
                        {exam.questions} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {exam.deadline}
                      </span>
                    </div>
                    {exam.attempts > 0 && (
                      <p className="text-sm text-amber-600">
                        Attempts: {exam.attempts}/{exam.maxAttempts}
                      </p>
                    )}
                  </div>
                  <Link href={`/student/exams/${exam.id}/start`}>
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

        {/* Scheduled Exams */}
        <TabsContent value="scheduled" className="space-y-4">
          {filteredScheduledExams.map((exam) => (
            <Card key={exam.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{exam.title}</h3>
                      <Badge variant="secondary">{exam.subject}</Badge>
                      <Badge className={getDifficultyColor(exam.difficulty)}>
                        {exam.difficulty}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{exam.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {exam.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileQuestion className="h-4 w-4" />
                        {exam.questions} questions
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="font-semibold text-primary">{exam.scheduledDate}</p>
                      <p className="text-sm text-muted-foreground">{exam.scheduledTime}</p>
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

        {/* Completed Exams */}
        <TabsContent value="completed" className="space-y-4">
          {filteredCompletedExams.map((exam) => {
            const percentage = Math.round((exam.score / exam.totalMarks) * 100)
            return (
              <Card key={exam.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{exam.title}</h3>
                        <Badge variant="secondary">{exam.subject}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {exam.completedDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Time taken: {exam.duration}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={`text-3xl font-bold ${getScoreColor(percentage)}`}>
                          {percentage}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {exam.score}/{exam.totalMarks} marks
                        </p>
                      </div>
                      <Link href={`/student/results/${exam.id}`}>
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
    </div>
  )
}
