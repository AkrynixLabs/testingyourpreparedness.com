"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Copy,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Clock,
  FileQuestion,
  CheckCircle2,
  AlertCircle,
  Archive
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Assessment {
  id: string
  title: string
  subject: string
  questionCount: number
  duration: number
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed"
  status: "draft" | "pending" | "published" | "archived"
  timesAssigned: number
  avgScore: number | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

const assessments: Assessment[] = [
  {
    id: "1",
    title: "JHS 3 Mathematics Mock Exam 2024",
    subject: "Mathematics",
    questionCount: 50,
    duration: 90,
    difficulty: "Mixed",
    status: "published",
    timesAssigned: 45,
    avgScore: 72,
    createdBy: "Ama Boateng",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-12"
  },
  {
    id: "2",
    title: "Integrated Science Unit Test - Chemistry",
    subject: "Integrated Science",
    questionCount: 30,
    duration: 45,
    difficulty: "Medium",
    status: "published",
    timesAssigned: 32,
    avgScore: 68,
    createdBy: "Kwame Asante",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-08"
  },
  {
    id: "3",
    title: "English Language Comprehension Practice",
    subject: "English Language",
    questionCount: 25,
    duration: 40,
    difficulty: "Easy",
    status: "published",
    timesAssigned: 28,
    avgScore: 78,
    createdBy: "Ama Boateng",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-06"
  },
  {
    id: "4",
    title: "Social Studies Term Assessment",
    subject: "Social Studies",
    questionCount: 40,
    duration: 60,
    difficulty: "Medium",
    status: "draft",
    timesAssigned: 0,
    avgScore: null,
    createdBy: "Kofi Mensah",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
  },
  {
    id: "7",
    title: "Mathematics Practice Set B",
    subject: "Mathematics",
    questionCount: 35,
    duration: 60,
    difficulty: "Medium",
    status: "pending",
    timesAssigned: 0,
    avgScore: null,
    createdBy: "Kofi Mensah",
    createdAt: "2024-01-16",
    updatedAt: "2024-01-16"
  },
  {
    id: "5",
    title: "RME Weekly Quiz - Week 3",
    subject: "RME",
    questionCount: 15,
    duration: 20,
    difficulty: "Easy",
    status: "published",
    timesAssigned: 18,
    avgScore: 82,
    createdBy: "Ama Boateng",
    createdAt: "2024-01-12",
    updatedAt: "2024-01-12"
  },
  {
    id: "6",
    title: "ICT Practical Assessment",
    subject: "ICT",
    questionCount: 20,
    duration: 30,
    difficulty: "Hard",
    status: "archived",
    timesAssigned: 12,
    avgScore: 65,
    createdBy: "Efua Owusu",
    createdAt: "2023-12-01",
    updatedAt: "2023-12-15"
  },
]

export default function AssessmentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = subjectFilter === "all" || assessment.subject === subjectFilter
    const matchesStatus = statusFilter === "all" || assessment.status === statusFilter
    return matchesSearch && matchesSubject && matchesStatus
  })

  const stats = {
    total: assessments.length,
    published: assessments.filter(a => a.status === "published").length,
    draft: assessments.filter(a => a.status === "draft").length,
    pending: assessments.filter(a => a.status === "pending").length,
    totalQuestions: assessments.reduce((sum, a) => sum + a.questionCount, 0)
  }

  const handleDelete = (assessment: Assessment) => {
    setSelectedAssessment(assessment)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    // In real app, would call API
    setDeleteDialogOpen(false)
    setSelectedAssessment(null)
  }

  const getStatusColor = (status: Assessment["status"]) => {
    switch (status) {
      case "published":
        return "default"
      case "pending":
        return "secondary"
      case "draft":
        return "secondary"
      case "archived":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: Assessment["status"]) => {
    switch (status) {
      case "published":
        return <CheckCircle2 className="h-3 w-3" />
      case "pending":
        return <Clock className="h-3 w-3" />
      case "draft":
        return <AlertCircle className="h-3 w-3" />
      case "archived":
        return <Archive className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Assessments</h1>
          <p className="text-muted-foreground">Manage and organize your assessment library</p>
        </div>
        <Button asChild>
          <Link href="/content-admin/assessments/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Assessment
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileQuestion className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Assessments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.published}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.draft}</p>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalQuestions}</p>
                <p className="text-sm text-muted-foreground">Total Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assessments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-44">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="English Language">English Language</SelectItem>
                  <SelectItem value="Integrated Science">Integrated Science</SelectItem>
                  <SelectItem value="Social Studies">Social Studies</SelectItem>
                  <SelectItem value="RME">RME</SelectItem>
                  <SelectItem value="ICT">ICT</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Library</CardTitle>
          <CardDescription>
            {filteredAssessments.length} assessment{filteredAssessments.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-center">Questions</TableHead>
                  <TableHead className="text-center">Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Assigned</TableHead>
                  <TableHead className="text-center">Avg Score</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{assessment.title}</p>
                        <p className="text-xs text-muted-foreground">
                          by {assessment.createdBy} • {new Date(assessment.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{assessment.subject}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FileQuestion className="h-4 w-4 text-muted-foreground" />
                        {assessment.questionCount}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {assessment.duration}m
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(assessment.status)} className="gap-1">
                        {getStatusIcon(assessment.status)}
                        {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{assessment.timesAssigned}</TableCell>
                    <TableCell className="text-center">
                      {assessment.avgScore !== null ? (
                        <span className={assessment.avgScore >= 70 ? "text-green-600" : assessment.avgScore >= 50 ? "text-amber-600" : "text-red-600"}>
                          {assessment.avgScore}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {assessment.status === "draft" && (
                            <DropdownMenuItem>
                              <Clock className="h-4 w-4 mr-2" />
                              Submit for Review
                            </DropdownMenuItem>
                          )}
                          {assessment.status === "published" && (
                            <DropdownMenuItem>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDelete(assessment)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assessment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedAssessment?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
