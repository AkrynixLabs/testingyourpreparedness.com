"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Shield,
  ShieldOff,
  Trash2,
  Eye,
  FileQuestion,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  Download,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatCard } from "@/components/stat-card"

const contentAdmins = [
  {
    id: 1,
    name: "Ama Serwaa",
    email: "ama.serwaa@typ.edu.gh",
    avatar: null,
    status: "active",
    subjects: ["Mathematics", "Science"],
    questionsCreated: 245,
    questionsApproved: 230,
    questionsPending: 8,
    questionsRejected: 7,
    lastActive: "2 hours ago",
    joinedDate: "Jan 15, 2024",
  },
  {
    id: 2,
    name: "Kofi Asante",
    email: "kofi.asante@typ.edu.gh",
    avatar: null,
    status: "active",
    subjects: ["English Language", "Social Studies"],
    questionsCreated: 312,
    questionsApproved: 298,
    questionsPending: 10,
    questionsRejected: 4,
    lastActive: "5 minutes ago",
    joinedDate: "Feb 3, 2024",
  },
  {
    id: 3,
    name: "Akosua Mensah",
    email: "akosua.mensah@typ.edu.gh",
    avatar: null,
    status: "active",
    subjects: ["ICT", "RME"],
    questionsCreated: 178,
    questionsApproved: 165,
    questionsPending: 5,
    questionsRejected: 8,
    lastActive: "1 day ago",
    joinedDate: "Mar 20, 2024",
  },
  {
    id: 4,
    name: "Yaw Boateng",
    email: "yaw.boateng@typ.edu.gh",
    avatar: null,
    status: "inactive",
    subjects: ["French", "Ghanaian Language"],
    questionsCreated: 89,
    questionsApproved: 82,
    questionsPending: 0,
    questionsRejected: 7,
    lastActive: "2 weeks ago",
    joinedDate: "Apr 10, 2024",
  },
  {
    id: 5,
    name: "Efua Darko",
    email: "efua.darko@typ.edu.gh",
    avatar: null,
    status: "pending",
    subjects: ["Creative Arts", "Career Technology"],
    questionsCreated: 0,
    questionsApproved: 0,
    questionsPending: 0,
    questionsRejected: 0,
    lastActive: "Never",
    joinedDate: "Dec 1, 2025",
  },
]

const subjects = [
  "Mathematics",
  "English Language",
  "Science",
  "Social Studies",
  "ICT",
  "RME",
  "French",
  "Ghanaian Language",
  "Creative Arts",
  "Career Technology",
]

export default function ContentAdminsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")
  const [inviteSubjects, setInviteSubjects] = useState<string[]>([])

  const filteredAdmins = contentAdmins.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || admin.status === statusFilter
    const matchesSubject =
      subjectFilter === "all" || admin.subjects.includes(subjectFilter)
    return matchesSearch && matchesStatus && matchesSubject
  })

  const totalAdmins = contentAdmins.length
  const activeAdmins = contentAdmins.filter((a) => a.status === "active").length
  const totalQuestions = contentAdmins.reduce((sum, a) => sum + a.questionsCreated, 0)
  const approvalRate = Math.round(
    (contentAdmins.reduce((sum, a) => sum + a.questionsApproved, 0) /
      contentAdmins.reduce((sum, a) => sum + a.questionsCreated, 0)) *
      100
  ) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Administrators</h1>
          <p className="text-muted-foreground">
            Manage content admins who create and submit questions for approval
          </p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Content Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Invite Content Administrator</DialogTitle>
              <DialogDescription>
                Send an invitation to a new content administrator. They will receive an email with setup instructions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Assigned Subjects</Label>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map((subject) => (
                    <label
                      key={subject}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-input"
                        checked={inviteSubjects.includes(subject)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setInviteSubjects([...inviteSubjects, subject])
                          } else {
                            setInviteSubjects(inviteSubjects.filter((s) => s !== subject))
                          }
                        }}
                      />
                      {subject}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsInviteOpen(false)}>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Content Admins"
          value={totalAdmins.toString()}
          changeLabel="Managing content"
          icon={Shield}
          change={2}
        />
        <StatCard
          title="Active Admins"
          value={activeAdmins.toString()}
          changeLabel="Currently active"
          icon={CheckCircle2}
          change={1}
        />
        <StatCard
          title="Questions Created"
          value={totalQuestions.toLocaleString()}
          changeLabel="Total submissions"
          icon={FileQuestion}
          change={15}
        />
        <StatCard
          title="Approval Rate"
          value={`${approvalRate}%`}
          changeLabel="Questions approved"
          icon={CheckCircle2}
          change={3}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
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
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead className="text-center">Questions</TableHead>
                <TableHead className="text-center">Approved</TableHead>
                <TableHead className="text-center">Pending</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={admin.avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {admin.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{admin.name}</p>
                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {admin.subjects.map((subject) => (
                        <Badge key={subject} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {admin.questionsCreated}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-green-600 font-medium">
                      {admin.questionsApproved}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {admin.questionsPending > 0 ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        {admin.questionsPending}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        admin.status === "active"
                          ? "default"
                          : admin.status === "pending"
                          ? "secondary"
                          : "outline"
                      }
                      className={
                        admin.status === "active"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : admin.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : ""
                      }
                    >
                      {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {admin.lastActive}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileQuestion className="mr-2 h-4 w-4" />
                          View Questions
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {admin.status === "active" ? (
                          <DropdownMenuItem className="text-amber-600">
                            <ShieldOff className="mr-2 h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        ) : admin.status === "inactive" ? (
                          <DropdownMenuItem className="text-green-600">
                            <Shield className="mr-2 h-4 w-4" />
                            Reactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-600">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve Access
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Admin
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
    </div>
  )
}
