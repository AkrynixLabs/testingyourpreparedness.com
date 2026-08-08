"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Calendar as CalendarIcon,
  Clock,
  Users,
  FileText,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Shuffle,
  Lock,
  Bell,
  Info,
  Sparkles,
} from "lucide-react"
import { createAssessmentAssignment } from "./actions"
import type { Assessment, Class, Student, Subject, User } from "@/lib/generated/prisma/client"

type AssessmentWithRelations = Assessment & { subject: Subject; _count: { questions: number } }
type ClassWithCount = Class & { _count: { students: number } }
type StudentWithRelations = Student & { user: User; class: Class | null }

type Step = 1 | 2 | 3 | 4

export function AssignAssessmentWizard({
  assessments,
  classes,
  students,
}: {
  assessments: AssessmentWithRelations[]
  classes: ClassWithCount[]
  students: StudentWithRelations[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [studentSearch, setStudentSearch] = useState("")

  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null)

  const [assignmentType, setAssignmentType] = useState<"classes" | "students">("classes")
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")

  const [shuffleQuestions, setShuffleQuestions] = useState(true)
  const [shuffleOptions, setShuffleOptions] = useState(true)
  const [showResults, setShowResults] = useState(true)
  const [allowRetake, setAllowRetake] = useState(false)
  const [maxAttempts, setMaxAttempts] = useState("2")
  const [passingScore, setPassingScore] = useState("50")
  const [sendNotification, setSendNotification] = useState(true)
  const [showAnswers, setShowAnswers] = useState(false)

  const subjectNames = Array.from(new Set(assessments.map((a) => a.subject.name))).sort()

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = subjectFilter === "all" || assessment.subject.name === subjectFilter
    return matchesSearch && matchesSubject
  })

  const filteredStudents = students.filter((s) =>
    s.user.name.toLowerCase().includes(studentSearch.toLowerCase())
  )

  const selectedAssessmentData = assessments.find((a) => a.id === selectedAssessment)

  const getTotalStudents = () => {
    if (assignmentType === "classes") {
      return classes.filter((c) => selectedClasses.includes(c.id)).reduce((sum, c) => sum + c._count.students, 0)
    }
    return selectedStudents.length
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedAssessment !== null
      case 2:
        return assignmentType === "classes" ? selectedClasses.length > 0 : selectedStudents.length > 0
      case 3:
        return Boolean(startDate && endDate)
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((currentStep + 1) as Step)
  }
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as Step)
  }

  const toggleClass = (classId: string) => {
    setSelectedClasses((prev) => (prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]))
  }
  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    )
  }
  const toggleAllClasses = () => {
    setSelectedClasses(selectedClasses.length === classes.length ? [] : classes.map((c) => c.id))
  }

  const combineDateAndTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    const combined = new Date(date)
    combined.setHours(hours, minutes, 0, 0)
    return combined
  }

  const handleSubmit = () => {
    if (!selectedAssessment || !startDate || !endDate) return
    setError(null)

    startTransition(async () => {
      try {
        await createAssessmentAssignment({
          assessmentId: selectedAssessment,
          assignmentType,
          classIds: selectedClasses,
          studentIds: selectedStudents,
          startDate: combineDateAndTime(startDate, startTime).toISOString(),
          endDate: combineDateAndTime(endDate, endTime).toISOString(),
          shuffleQuestions,
          shuffleOptions,
          showResults,
          showAnswers,
          passingScore: passingScore ? Number(passingScore) : null,
          allowRetake,
          maxAttempts: maxAttempts === "unlimited" ? null : Number(maxAttempts),
          sendNotification,
        })
        router.push("/school-admin/assessments")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to assign assessment.")
      }
    })
  }

  const steps = [
    { number: 1, title: "Select Assessment", icon: FileText },
    { number: 2, title: "Assign To", icon: Users },
    { number: 3, title: "Schedule", icon: CalendarIcon },
    { number: 4, title: "Options", icon: Sparkles },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/school-admin/assessments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Assign Assessment</h1>
          <p className="text-muted-foreground">Assign an assessment to your students</p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isCompleted = currentStep > step.number
              const isCurrent = currentStep === step.number

              return (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                        isCompleted
                          ? "bg-primary border-primary text-primary-foreground"
                          : isCurrent
                          ? "border-primary text-primary"
                          : "border-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                    </div>
                    <span
                      className={cn("mt-2 text-sm font-medium", isCurrent ? "text-primary" : "text-muted-foreground")}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn("mx-4 h-0.5 w-16 lg:w-24", isCompleted ? "bg-primary" : "bg-muted")} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Assessment</CardTitle>
                <CardDescription>Choose a published assessment from the library</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search assessments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjectNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {filteredAssessments.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No published assessments match your search.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {filteredAssessments.map((assessment) => (
                      <div
                        key={assessment.id}
                        onClick={() => setSelectedAssessment(assessment.id)}
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                          selectedAssessment === assessment.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-foreground">{assessment.title}</h4>
                              {assessment.difficulty && (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    assessment.difficulty === "Easy"
                                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                      : assessment.difficulty === "Medium"
                                      ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                      : "bg-red-500/10 text-red-600 border-red-500/20"
                                  )}
                                >
                                  {assessment.difficulty}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">{assessment.subject.name}</p>
                            <p>{assessment._count.questions} questions</p>
                            <p>{assessment.duration} mins</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Assign To</CardTitle>
                <CardDescription>Select which students should take this assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={assignmentType} onValueChange={(v) => setAssignmentType(v as "classes" | "students")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="classes">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      By Class
                    </TabsTrigger>
                    <TabsTrigger value="students">
                      <Users className="mr-2 h-4 w-4" />
                      Individual Students
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="classes" className="space-y-4">
                    {classes.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-8 text-center">
                        No classes yet. Add classes before assigning by class.
                      </p>
                    ) : (
                      <>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-muted-foreground">
                            {selectedClasses.length} class(es) selected
                          </span>
                          <Button variant="ghost" size="sm" onClick={toggleAllClasses}>
                            {selectedClasses.length === classes.length ? "Deselect All" : "Select All"}
                          </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {classes.map((cls) => (
                            <div
                              key={cls.id}
                              onClick={() => toggleClass(cls.id)}
                              className={cn(
                                "p-4 rounded-lg border cursor-pointer transition-all",
                                selectedClasses.includes(cls.id)
                                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox checked={selectedClasses.includes(cls.id)} />
                                <div className="flex-1">
                                  <p className="font-medium">{cls.displayName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {cls._count.students} students
                                    {cls.teacherName ? ` • ${cls.teacherName}` : ""}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="students" className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search students..."
                        className="pl-9"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedStudents.length} student(s) selected
                      </span>
                    </div>
                    {filteredStudents.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-8 text-center">No students found.</p>
                    ) : (
                      <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                        {filteredStudents.map((student) => (
                          <div
                            key={student.id}
                            onClick={() => toggleStudent(student.id)}
                            className={cn(
                              "p-3 rounded-lg border cursor-pointer transition-all",
                              selectedStudents.includes(student.id)
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox checked={selectedStudents.includes(student.id)} />
                              <div className="flex-1">
                                <p className="font-medium">{student.user.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {student.class?.displayName ?? "No class"} • {student.user.email}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
                <CardDescription>Set when students can access this assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger>
                        <Clock className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, "0")
                          return (
                            <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          disabled={(date) => (startDate ? date < startDate : false)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Select value={endTime} onValueChange={setEndTime}>
                      <SelectTrigger>
                        <Clock className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, "0")
                          return (
                            <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Assessment Window</p>
                      <p className="text-blue-700">
                        Students will be able to start the assessment anytime between the start and end date/time.
                        Once started, they must complete it within the assessment&apos;s time limit.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Assessment Options</CardTitle>
                <CardDescription>Configure how students will experience this assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Shuffle className="h-4 w-4" />
                    Question Settings
                  </h4>
                  <div className="space-y-4 pl-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Shuffle Questions</Label>
                        <p className="text-sm text-muted-foreground">Randomize the order of questions for each student</p>
                      </div>
                      <Switch checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Shuffle Options</Label>
                        <p className="text-sm text-muted-foreground">Randomize the order of answer options</p>
                      </div>
                      <Switch checked={shuffleOptions} onCheckedChange={setShuffleOptions} />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Result Settings
                  </h4>
                  <div className="space-y-4 pl-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Results Immediately</Label>
                        <p className="text-sm text-muted-foreground">Students can see their score right after submission</p>
                      </div>
                      <Switch checked={showResults} onCheckedChange={setShowResults} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Correct Answers</Label>
                        <p className="text-sm text-muted-foreground">Display correct answers after submission</p>
                      </div>
                      <Switch checked={showAnswers} onCheckedChange={setShowAnswers} />
                    </div>
                    <div className="space-y-2">
                      <Label>Passing Score (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={passingScore}
                        onChange={(e) => setPassingScore(e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Attempt Settings
                  </h4>
                  <div className="space-y-4 pl-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Retakes</Label>
                        <p className="text-sm text-muted-foreground">Students can attempt the assessment multiple times</p>
                      </div>
                      <Switch checked={allowRetake} onCheckedChange={setAllowRetake} />
                    </div>
                    {allowRetake && (
                      <div className="space-y-2">
                        <Label>Maximum Attempts</Label>
                        <Select value={maxAttempts} onValueChange={setMaxAttempts}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 attempts</SelectItem>
                            <SelectItem value="3">3 attempts</SelectItem>
                            <SelectItem value="5">5 attempts</SelectItem>
                            <SelectItem value="unlimited">Unlimited</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </h4>
                  <div className="space-y-4 pl-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Send Email Notification</Label>
                        <p className="text-sm text-muted-foreground">
                          Notify students via email when assessment is assigned. Email delivery isn&apos;t wired up
                          yet - this is stored as a preference only.
                        </p>
                      </div>
                      <Switch checked={sendNotification} onCheckedChange={setSendNotification} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Assignment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Assessment</p>
                {selectedAssessmentData ? (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium text-sm">{selectedAssessmentData.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedAssessmentData.subject.name} • {selectedAssessmentData._count.questions} questions •{" "}
                      {selectedAssessmentData.duration} mins
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No assessment selected</p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                {selectedClasses.length > 0 || selectedStudents.length > 0 ? (
                  <div className="space-y-1">
                    {assignmentType === "classes" ? (
                      <>
                        <p className="text-sm">{selectedClasses.length} class(es) selected</p>
                        <p className="text-xs text-muted-foreground">{getTotalStudents()} total students</p>
                      </>
                    ) : (
                      <p className="text-sm">{selectedStudents.length} student(s) selected</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No students selected</p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Schedule</p>
                {startDate && endDate ? (
                  <div className="text-sm">
                    <p>
                      {format(startDate, "MMM d, yyyy")} at {startTime}
                    </p>
                    <p className="text-muted-foreground">to</p>
                    <p>
                      {format(endDate, "MMM d, yyyy")} at {endTime}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not scheduled</p>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary">{getTotalStudents()}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary">{selectedAssessmentData?.duration || 0}</p>
                  <p className="text-xs text-muted-foreground">Minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/school-admin/assessments">Cancel</Link>
          </Button>
          {currentStep === 4 ? (
            <Button onClick={handleSubmit} disabled={!canProceed() || isPending}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {isPending ? "Assigning..." : "Assign Assessment"}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
