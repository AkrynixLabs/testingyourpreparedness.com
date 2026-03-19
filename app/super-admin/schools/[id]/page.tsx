"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MoreHorizontal,
  Search,
  Download,
  UserPlus,
  Edit,
  Ban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

// Demo data for school details
const schoolData = {
  id: 1,
  name: "Achimota School",
  code: "ACH-001",
  type: "Public",
  region: "Greater Accra",
  district: "Accra Metropolitan",
  address: "Achimota, Accra",
  email: "admin@achimotaschool.edu.gh",
  phone: "+233 30 240 0123",
  website: "www.achimotaschool.edu.gh",
  status: "active",
  plan: "Professional",
  planStatus: "Active",
  monthlyFee: 450,
  totalStudents: 456,
  activeStudents: 423,
  totalClasses: 12,
  avgScore: 78.5,
  joinDate: "2024-01-15",
  lastActivity: "2 hours ago",
  adminName: "Mr. Kwame Mensah",
  adminEmail: "kwame.mensah@achimotaschool.edu.gh",
  adminPhone: "+233 24 123 4567",
}

const students = [
  { id: 1, name: "Ama Serwaa", class: "JHS 3A", email: "ama.s@student.edu.gh", avgScore: 92.5, exams: 24, status: "active" },
  { id: 2, name: "Kofi Mensah", class: "JHS 3A", email: "kofi.m@student.edu.gh", avgScore: 89.2, exams: 24, status: "active" },
  { id: 3, name: "Abena Osei", class: "JHS 3B", email: "abena.o@student.edu.gh", avgScore: 87.8, exams: 23, status: "active" },
  { id: 4, name: "Yaw Boateng", class: "JHS 2A", email: "yaw.b@student.edu.gh", avgScore: 85.4, exams: 22, status: "active" },
  { id: 5, name: "Efua Darko", class: "JHS 2B", email: "efua.d@student.edu.gh", avgScore: 82.9, exams: 20, status: "inactive" },
  { id: 6, name: "Nana Adjei", class: "JHS 1A", email: "nana.a@student.edu.gh", avgScore: 81.5, exams: 18, status: "active" },
  { id: 7, name: "Akua Mensah", class: "JHS 1B", email: "akua.m@student.edu.gh", avgScore: 79.8, exams: 19, status: "active" },
  { id: 8, name: "Kwesi Appiah", class: "JHS 3A", email: "kwesi.a@student.edu.gh", avgScore: 78.2, exams: 21, status: "active" },
]

const classes = [
  { name: "JHS 3A", students: 45, avgScore: 82.3, topStudent: "Ama Serwaa", examsCompleted: 24 },
  { name: "JHS 3B", students: 42, avgScore: 79.8, topStudent: "Abena Osei", examsCompleted: 23 },
  { name: "JHS 3C", students: 40, avgScore: 77.5, topStudent: "Grace Asiedu", examsCompleted: 22 },
  { name: "JHS 2A", students: 44, avgScore: 75.2, topStudent: "Yaw Boateng", examsCompleted: 20 },
  { name: "JHS 2B", students: 38, avgScore: 73.8, topStudent: "Efua Darko", examsCompleted: 19 },
  { name: "JHS 2C", students: 41, avgScore: 72.1, topStudent: "Daniel Owusu", examsCompleted: 18 },
  { name: "JHS 1A", students: 46, avgScore: 70.5, topStudent: "Nana Adjei", examsCompleted: 16 },
  { name: "JHS 1B", students: 43, avgScore: 69.2, topStudent: "Akua Mensah", examsCompleted: 15 },
]

const performanceData = [
  { month: "Sep", avgScore: 68, exams: 120 },
  { month: "Oct", avgScore: 71, exams: 145 },
  { month: "Nov", avgScore: 74, exams: 160 },
  { month: "Dec", avgScore: 73, exams: 130 },
  { month: "Jan", avgScore: 76, exams: 155 },
  { month: "Feb", avgScore: 78.5, exams: 170 },
]

const subjectPerformance = [
  { subject: "Mathematics", avgScore: 75 },
  { subject: "English", avgScore: 82 },
  { subject: "Science", avgScore: 78 },
  { subject: "Social Studies", avgScore: 80 },
  { subject: "ICT", avgScore: 85 },
  { subject: "French", avgScore: 72 },
  { subject: "RME", avgScore: 79 },
  { subject: "Twi", avgScore: 77 },
]

const billingHistory = [
  { id: 1, date: "2024-02-01", description: "Professional Plan - February", amount: 450, status: "paid" },
  { id: 2, date: "2024-01-01", description: "Professional Plan - January", amount: 450, status: "paid" },
  { id: 3, date: "2023-12-01", description: "Professional Plan - December", amount: 450, status: "paid" },
  { id: 4, date: "2023-11-01", description: "Professional Plan - November", amount: 450, status: "paid" },
  { id: 5, date: "2023-10-01", description: "Starter Plan - October", amount: 200, status: "paid" },
]

const activityLog = [
  { id: 1, action: "Student enrolled", details: "Kwame Asante added to JHS 3A", time: "2 hours ago", user: "Admin" },
  { id: 2, action: "Assessment assigned", details: "BECE Mock Exam 2024 assigned to JHS 3", time: "5 hours ago", user: "Admin" },
  { id: 3, action: "Results published", details: "Mathematics Quiz 5 results available", time: "1 day ago", user: "System" },
  { id: 4, action: "Plan upgraded", details: "Upgraded from Starter to Professional", time: "2 weeks ago", user: "Admin" },
  { id: 5, action: "New class created", details: "JHS 3C class added", time: "1 month ago", user: "Admin" },
]

export default function SchoolDetailPage() {
  const [studentSearch, setStudentSearch] = useState("")
  const [classFilter, setClassFilter] = useState("all")

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase())
    const matchesClass = classFilter === "all" || s.class === classFilter
    return matchesSearch && matchesClass
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/super-admin/schools">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{schoolData.name}</h1>
              <Badge variant={schoolData.status === "active" ? "default" : "secondary"}>
                {schoolData.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{schoolData.code} | {schoolData.type} School</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Contact
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Invoices</DropdownMenuItem>
              <DropdownMenuItem>Export Data</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Suspend School</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{schoolData.totalStudents}</p>
                <p className="text-xs text-muted-foreground">{schoolData.activeStudents} active</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Classes</p>
                <p className="text-2xl font-bold">{schoolData.totalClasses}</p>
                <p className="text-xs text-muted-foreground">JHS 1-3</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Score</p>
                <p className="text-2xl font-bold">{schoolData.avgScore}%</p>
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +3.2% this month
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">GHS {schoolData.monthlyFee}</p>
                <p className="text-xs text-muted-foreground">{schoolData.plan} Plan</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* School Info */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>School Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{schoolData.region}, {schoolData.district}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{schoolData.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{schoolData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{schoolData.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium">{new Date(schoolData.joinDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Activity</p>
                      <p className="font-medium">{schoolData.lastActivity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Subscription</p>
                      <p className="font-medium">{schoolData.plan} Plan - <span className="text-emerald-600">{schoolData.planStatus}</span></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* School Admin */}
            <Card>
              <CardHeader>
                <CardTitle>School Administrator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">KM</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{schoolData.adminName}</p>
                    <p className="text-sm text-muted-foreground">Primary Admin</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{schoolData.adminEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{schoolData.adminPhone}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
              <CardDescription>Average scores over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgScore" stroke="hsl(var(--primary))" strokeWidth={2} name="Avg Score" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-9 w-[250px]"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map(c => (
                    <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Avg Score</TableHead>
                  <TableHead>Exams Taken</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{student.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${student.avgScore >= 80 ? "text-emerald-600" : student.avgScore >= 60 ? "text-amber-600" : "text-red-600"}`}>
                        {student.avgScore}%
                      </span>
                    </TableCell>
                    <TableCell>{student.exams}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === "active" ? "default" : "secondary"}>
                        {student.status === "active" ? (
                          <><CheckCircle2 className="h-3 w-3 mr-1" /> Active</>
                        ) : (
                          <><Ban className="h-3 w-3 mr-1" /> Inactive</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>View Results</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {classes.map((cls) => (
              <Card key={cls.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{cls.name}</CardTitle>
                    <Badge variant="secondary">{cls.students} students</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Average Score</span>
                    <span className={`font-medium ${cls.avgScore >= 80 ? "text-emerald-600" : cls.avgScore >= 70 ? "text-amber-600" : "text-red-600"}`}>
                      {cls.avgScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Exams Completed</span>
                    <span className="font-medium">{cls.examsCompleted}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Top Student</span>
                    <span className="font-medium">{cls.topStudent}</span>
                  </div>
                  <Button variant="outline" className="w-full mt-2" size="sm">
                    View Class
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Score Trend</CardTitle>
                <CardDescription>Monthly average performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line type="monotone" dataKey="avgScore" stroke="hsl(var(--primary))" strokeWidth={2} name="Avg Score (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
                <CardDescription>Average scores by subject</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" domain={[0, 100]} className="text-xs" />
                      <YAxis dataKey="subject" type="category" width={80} className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="avgScore" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Avg Score (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>{schoolData.plan} Plan</CardDescription>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-2xl font-bold">GHS {schoolData.monthlyFee}/month</p>
                  <p className="text-sm text-muted-foreground">Next billing: March 1, 2024</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline">Change Plan</Button>
                  <Button variant="outline">Update Payment</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="font-medium">GHS {item.amount}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/10 text-emerald-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Paid
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Download</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions and events for this school</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLog.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {activity.action.includes("Student") ? (
                        <UserPlus className="h-4 w-4 text-primary" />
                      ) : activity.action.includes("Assessment") ? (
                        <Clock className="h-4 w-4 text-primary" />
                      ) : activity.action.includes("Plan") ? (
                        <CreditCard className="h-4 w-4 text-primary" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time} by {activity.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
