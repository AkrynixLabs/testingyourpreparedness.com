"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  FileQuestion,
  BookOpen,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { StatCard } from "@/components/stat-card"

// Demo data for approved questions in the bank
const questions = [
  {
    id: "Q1001",
    question: "What is the chemical formula for water?",
    options: ["H2O", "CO2", "NaCl", "O2"],
    correctAnswer: 0,
    subject: "Integrated Science",
    topic: "Chemistry Basics",
    difficulty: "Easy",
    author: "Ama Boateng",
    approvedBy: "Dr. Kwaku Mensah",
    approvedAt: "2024-01-15",
    timesUsed: 45,
    avgScore: 78,
    status: "active",
  },
  {
    id: "Q1002",
    question: "Simplify: 3x + 5x - 2x",
    options: ["6x", "8x", "10x", "4x"],
    correctAnswer: 0,
    subject: "Mathematics",
    topic: "Algebra",
    difficulty: "Easy",
    author: "Kofi Asante",
    approvedBy: "Dr. Kwaku Mensah",
    approvedAt: "2024-01-14",
    timesUsed: 67,
    avgScore: 85,
    status: "active",
  },
  {
    id: "Q1003",
    question: "Who was the first President of Ghana?",
    options: ["J.B. Danquah", "Kwame Nkrumah", "Jerry Rawlings", "John Kufuor"],
    correctAnswer: 1,
    subject: "Social Studies",
    topic: "Ghana History",
    difficulty: "Easy",
    author: "Yaa Mensah",
    approvedBy: "Dr. Kwaku Mensah",
    approvedAt: "2024-01-13",
    timesUsed: 89,
    avgScore: 92,
    status: "active",
  },
  {
    id: "Q1004",
    question: "What is the past tense of 'run'?",
    options: ["Runned", "Ran", "Running", "Runs"],
    correctAnswer: 1,
    subject: "English Language",
    topic: "Grammar",
    difficulty: "Easy",
    author: "Ama Boateng",
    approvedBy: "Dr. Kwaku Mensah",
    approvedAt: "2024-01-12",
    timesUsed: 112,
    avgScore: 88,
    status: "active",
  },
  {
    id: "Q1005",
    question: "Calculate the area of a circle with radius 7cm (use π = 22/7)",
    options: ["154 cm²", "44 cm²", "22 cm²", "308 cm²"],
    correctAnswer: 0,
    subject: "Mathematics",
    topic: "Geometry",
    difficulty: "Medium",
    author: "Kofi Asante",
    approvedBy: "Dr. Kwaku Mensah",
    approvedAt: "2024-01-11",
    timesUsed: 34,
    avgScore: 62,
    status: "active",
  },
  {
    id: "Q1006",
    question: "Which organ pumps blood throughout the body?",
    options: ["Lungs", "Brain", "Heart", "Liver"],
    correctAnswer: 2,
    subject: "Integrated Science",
    topic: "Human Biology",
    difficulty: "Easy",
    author: "Yaa Mensah",
    approvedBy: "Dr. Kwaku Mensah",
    approvedAt: "2024-01-10",
    timesUsed: 98,
    avgScore: 95,
    status: "active",
  },
]

const subjectStats = [
  { subject: "Mathematics", count: 2450, percentage: 28 },
  { subject: "English Language", count: 2100, percentage: 24 },
  { subject: "Integrated Science", count: 1890, percentage: 22 },
  { subject: "Social Studies", count: 1400, percentage: 16 },
  { subject: "Others", count: 860, percentage: 10 },
]

export default function QuestionBankPage() {
  const [selectedQuestion, setSelectedQuestion] = useState<typeof questions[0] | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")

  const subjects = ["Mathematics", "English Language", "Integrated Science", "Social Studies", "ICT", "French", "RME", "Ghanaian Language"]

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = subjectFilter === "all" || q.subject === subjectFilter
    const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter
    return matchesSearch && matchesSubject && matchesDifficulty
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Question Bank</h1>
          <p className="text-muted-foreground">
            All approved questions available for assessments
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Questions
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Questions"
          value="8,700"
          changeLabel="In question bank"
          icon={FileQuestion}
          change={12}
        />
        <StatCard
          title="Subjects Covered"
          value="8"
          changeLabel="BECE subjects"
          icon={BookOpen}
          change={0}
        />
        <StatCard
          title="Active Authors"
          value="24"
          changeLabel="Content admins"
          icon={Users}
          change={4}
        />
        <StatCard
          title="Avg Performance"
          value="76%"
          changeLabel="Across all questions"
          icon={TrendingUp}
          change={3}
        />
      </div>

      {/* Subject Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Questions by Subject</CardTitle>
          <CardDescription>Distribution of questions across BECE subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectStats.map((stat) => (
              <div key={stat.subject} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stat.subject}</span>
                  <span className="text-muted-foreground">{stat.count.toLocaleString()} ({stat.percentage}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg">All Questions</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-[250px]"
                />
              </div>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="text-center">Used</TableHead>
                <TableHead className="text-center">Avg Score</TableHead>
                <TableHead>Author</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="font-mono text-sm">{question.id}</TableCell>
                  <TableCell>
                    <p className="line-clamp-1 max-w-[300px]">{question.question}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{question.subject}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        question.difficulty === "Easy"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : question.difficulty === "Medium"
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      {question.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{question.timesUsed}</TableCell>
                  <TableCell className="text-center">
                    <span className={question.avgScore >= 70 ? "text-green-600" : question.avgScore >= 50 ? "text-amber-600" : "text-red-600"}>
                      {question.avgScore}%
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{question.author}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedQuestion(question)
                            setPreviewOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredQuestions.length} of 8,700 questions
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">Page 1 of 870</span>
          <Button variant="outline" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
            <DialogDescription>
              Question ID: {selectedQuestion?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-6">
              <div>
                <Label className="text-muted-foreground">Question</Label>
                <p className="text-lg font-medium mt-1">{selectedQuestion.question}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Answer Options</Label>
                <RadioGroup value={String(selectedQuestion.correctAnswer)} className="mt-2">
                  {selectedQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg border ${
                        index === selectedQuestion.correctAnswer
                          ? "border-green-500 bg-green-50"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem value={String(index)} disabled />
                      <Label className="flex-1 cursor-default">
                        {String.fromCharCode(65 + index)}. {option}
                      </Label>
                      {index === selectedQuestion.correctAnswer && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Correct Answer
                        </Badge>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Subject</Label>
                  <p className="font-medium">{selectedQuestion.subject}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Topic</Label>
                  <p className="font-medium">{selectedQuestion.topic}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Difficulty</Label>
                  <p className="font-medium">{selectedQuestion.difficulty}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Author</Label>
                  <p className="font-medium">{selectedQuestion.author}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Times Used</Label>
                  <p className="font-medium">{selectedQuestion.timesUsed} times</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Average Score</Label>
                  <p className="font-medium">{selectedQuestion.avgScore}%</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Approved By</Label>
                  <p className="font-medium">{selectedQuestion.approvedBy}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Approved Date</Label>
                  <p className="font-medium">{selectedQuestion.approvedAt}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
