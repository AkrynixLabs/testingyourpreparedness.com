"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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

// Demo data
const availableAssessments = [
  {
    id: 1,
    title: "BECE Mock Exam 2024 - English",
    subject: "English Language",
    questions: 50,
    duration: 90,
    difficulty: "Medium",
    topics: ["Comprehension", "Grammar", "Vocabulary", "Essay Writing"],
    description: "Comprehensive English language assessment covering all BECE topics",
  },
  {
    id: 2,
    title: "Mathematics Practice Test 1",
    subject: "Mathematics",
    questions: 40,
    duration: 60,
    difficulty: "Medium",
    topics: ["Algebra", "Geometry", "Statistics", "Number Theory"],
    description: "Practice test focusing on core mathematical concepts",
  },
  {
    id: 3,
    title: "Integrated Science Mid-Term",
    subject: "Integrated Science",
    questions: 35,
    duration: 45,
    difficulty: "Easy",
    topics: ["Living Things", "Ecology", "Human Body", "Energy"],
    description: "Mid-term examination covering science fundamentals",
  },
  {
    id: 4,
    title: "Social Studies Comprehensive",
    subject: "Social Studies",
    questions: 45,
    duration: 75,
    difficulty: "Hard",
    topics: ["Governance", "History of Ghana", "Culture", "Economics"],
    description: "Comprehensive assessment of social studies curriculum",
  },
  {
    id: 5,
    title: "English Grammar Focus",
    subject: "English Language",
    questions: 30,
    duration: 40,
    difficulty: "Easy",
    topics: ["Grammar", "Parts of Speech", "Sentence Structure"],
    description: "Focused assessment on English grammar rules",
  },
  {
    id: 6,
    title: "Algebra & Geometry Test",
    subject: "Mathematics",
    questions: 25,
    duration: 35,
    difficulty: "Hard",
    topics: ["Algebra", "Geometry", "Trigonometry"],
    description: "Advanced test covering algebra and geometry",
  },
]

const classes = [
  { id: "form3a", name: "Form 3A", students: 43, teacher: "Mr. Asante" },
  { id: "form3b", name: "Form 3B", students: 42, teacher: "Mrs. Mensah" },
  { id: "form3c", name: "Form 3C", students: 41, teacher: "Mr. Owusu" },
  { id: "form2a", name: "Form 2A", students: 45, teacher: "Mrs. Adjei" },
  { id: "form2b", name: "Form 2B", students: 44, teacher: "Mr. Boateng" },
]

const students = [
  { id: 1, name: "Kwame Asante", class: "Form 3A", email: "kwame.a@student.typ.gh" },
  { id: 2, name: "Ama Serwaa", class: "Form 3A", email: "ama.s@student.typ.gh" },
  { id: 3, name: "Kofi Mensah", class: "Form 3A", email: "kofi.m@student.typ.gh" },
  { id: 4, name: "Abena Osei", class: "Form 3B", email: "abena.o@student.typ.gh" },
  { id: 5, name: "Yaw Boateng", class: "Form 3B", email: "yaw.b@student.typ.gh" },
  { id: 6, name: "Efua Darko", class: "Form 3C", email: "efua.d@student.typ.gh" },
  { id: 7, name: "Kwesi Appiah", class: "Form 3C", email: "kwesi.a@student.typ.gh" },
  { id: 8, name: "Adwoa Agyeman", class: "Form 3A", email: "adwoa.a@student.typ.gh" },
]

type Step = 1 | 2 | 3 | 4

export default function AssignAssessmentPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  
  // Step 1: Selected Assessment
  const [selectedAssessment, setSelectedAssessment] = useState<number | null>(null)
  
  // Step 2: Assignment Target
  const [assignmentType, setAssignmentType] = useState<"classes" | "students">("classes")
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  
  // Step 3: Schedule
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")
  
  // Step 4: Options
  const [shuffleQuestions, setShuffleQuestions] = useState(true)
  const [shuffleOptions, setShuffleOptions] = useState(true)
  const [showResults, setShowResults] = useState(true)
  const [allowRetake, setAllowRetake] = useState(false)
  const [maxAttempts, setMaxAttempts] = useState("1")
  const [passingScore, setPassingScore] = useState("50")
  const [sendNotification, setSendNotification] = useState(true)
  const [showAnswers, setShowAnswers] = useState(false)

  const filteredAssessments = availableAssessments.filter((assessment) => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = subjectFilter === "all" || assessment.subject === subjectFilter
    return matchesSearch && matchesSubject
  })

  const selectedAssessmentData = availableAssessments.find((a) => a.id === selectedAssessment)

  const getTotalStudents = () => {
    if (assignmentType === "classes") {
      return classes
        .filter((c) => selectedClasses.includes(c.id))
        .reduce((sum, c) => sum + c.students, 0)
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
        return startDate && endDate
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
    }
  }

  const handleSubmit = () => {
    // In a real app, this would save the assignment
    router.push("/school-admin/assessments")
  }

  const toggleClass = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    )
  }

  const toggleStudent = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    )
  }

  const toggleAllClasses = () => {
    if (selectedClasses.length === classes.length) {
      setSelectedClasses([])
    } else {
      setSelectedClasses(classes.map((c) => c.id))
    }
  }

  const steps = [
    { number: 1, title: "Select Assessment", icon: FileText },
    { number: 2, title: "Assign To", icon: Users },
    { number: 3, title: "Schedule", icon: CalendarIcon },
    { number: 4, title: "Options", icon: Sparkles },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Progress Steps */}
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
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "mt-2 text-sm font-medium",
                        isCurrent ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "mx-4 h-0.5 w-16 lg:w-24",
                        isCompleted ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Step 1: Select Assessment */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Assessment</CardTitle>
                <CardDescription>Choose an assessment from the available library</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search & Filter */}
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
                      <SelectItem value="English Language">English</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Integrated Science">Science</SelectItem>
                      <SelectItem value="Social Studies">Social Studies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Assessment List */}
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
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{assessment.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {assessment.topics.slice(0, 3).map((topic) => (
                              <Badge key={topic} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                            {assessment.topics.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{assessment.topics.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p className="font-medium text-foreground">{assessment.subject}</p>
                          <p>{assessment.questions} questions</p>
                          <p>{assessment.duration} mins</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Assign To */}
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
                              <p className="font-medium">{cls.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {cls.students} students • {cls.teacher}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="students" className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Search students..." className="pl-9" />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedStudents.length} student(s) selected
                      </span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                      {students.map((student) => (
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
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {student.class} • {student.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Schedule */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
                <CardDescription>Set when students can access this assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Start Time */}
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

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
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

                  {/* End Time */}
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

          {/* Step 4: Options */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Assessment Options</CardTitle>
                <CardDescription>Configure how students will experience this assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Shuffle className="h-4 w-4" />
                    Question Settings
                  </h4>
                  <div className="space-y-4 pl-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Shuffle Questions</Label>
                        <p className="text-sm text-muted-foreground">
                          Randomize the order of questions for each student
                        </p>
                      </div>
                      <Switch checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Shuffle Options</Label>
                        <p className="text-sm text-muted-foreground">
                          Randomize the order of answer options
                        </p>
                      </div>
                      <Switch checked={shuffleOptions} onCheckedChange={setShuffleOptions} />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Result Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Result Settings
                  </h4>
                  <div className="space-y-4 pl-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Results Immediately</Label>
                        <p className="text-sm text-muted-foreground">
                          Students can see their score right after submission
                        </p>
                      </div>
                      <Switch checked={showResults} onCheckedChange={setShowResults} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Correct Answers</Label>
                        <p className="text-sm text-muted-foreground">
                          Display correct answers after submission
                        </p>
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

                {/* Attempt Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Attempt Settings
                  </h4>
                  <div className="space-y-4 pl-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Retakes</Label>
                        <p className="text-sm text-muted-foreground">
                          Students can attempt the assessment multiple times
                        </p>
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

                {/* Notification Settings */}
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
                          Notify students via email when assessment is assigned
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

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Assignment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Assessment */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Assessment</p>
                {selectedAssessmentData ? (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium text-sm">{selectedAssessmentData.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedAssessmentData.subject} • {selectedAssessmentData.questions} questions • {selectedAssessmentData.duration} mins
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No assessment selected</p>
                )}
              </div>

              <Separator />

              {/* Assignment Target */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                {(selectedClasses.length > 0 || selectedStudents.length > 0) ? (
                  <div className="space-y-1">
                    {assignmentType === "classes" ? (
                      <>
                        <p className="text-sm">
                          {selectedClasses.length} class(es) selected
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getTotalStudents()} total students
                        </p>
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

              {/* Schedule */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Schedule</p>
                {startDate && endDate ? (
                  <div className="text-sm">
                    <p>{format(startDate, "MMM d, yyyy")} at {startTime}</p>
                    <p className="text-muted-foreground">to</p>
                    <p>{format(endDate, "MMM d, yyyy")} at {endTime}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not scheduled</p>
                )}
              </div>

              <Separator />

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary">{getTotalStudents()}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary">
                    {selectedAssessmentData?.duration || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/school-admin/assessments">Cancel</Link>
          </Button>
          {currentStep === 4 ? (
            <Button onClick={handleSubmit} disabled={!canProceed()}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Assign Assessment
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
