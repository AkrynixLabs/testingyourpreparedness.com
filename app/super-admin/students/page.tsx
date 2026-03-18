"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatCard } from "@/components/stat-card"
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Users,
  School,
  UserCheck,
  UserX,
  TrendingUp,
  Calendar,
  GraduationCap,
  Eye,
  Mail,
  Ban,
  RefreshCw,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts"

// Demo data
const allStudents = [
  { id: "S001", name: "Kwame Asante", email: "kwame.asante@gmail.com", type: "school", school: "Presec Legon", form: "JHS 3", registeredDate: "2025-01-15", lastActive: "2 hours ago", examsCompleted: 24, avgScore: 78, status: "active" },
  { id: "S002", name: "Akua Mensah", email: "akua.m@gmail.com", type: "school", school: "Wesley Girls", form: "JHS 2", registeredDate: "2025-02-01", lastActive: "1 day ago", examsCompleted: 18, avgScore: 85, status: "active" },
  { id: "S003", name: "Kofi Owusu", email: "kofi.owusu@yahoo.com", type: "independent", school: null, form: "JHS 3", registeredDate: "2025-01-20", lastActive: "5 mins ago", examsCompleted: 32, avgScore: 72, status: "active" },
  { id: "S004", name: "Abena Darko", email: "abena.d@gmail.com", type: "independent", school: null, form: "JHS 1", registeredDate: "2025-03-05", lastActive: "3 days ago", examsCompleted: 8, avgScore: 68, status: "active" },
  { id: "S005", name: "Yaw Boateng", email: "yaw.boat@outlook.com", type: "school", school: "Achimota School", form: "JHS 3", registeredDate: "2024-11-10", lastActive: "1 week ago", examsCompleted: 45, avgScore: 81, status: "inactive" },
  { id: "S006", name: "Esi Ampong", email: "esi.amp@gmail.com", type: "school", school: "Holy Child", form: "JHS 2", registeredDate: "2025-02-14", lastActive: "30 mins ago", examsCompleted: 15, avgScore: 88, status: "active" },
  { id: "S007", name: "Kweku Frimpong", email: "kweku.f@gmail.com", type: "independent", school: null, form: "JHS 3", registeredDate: "2025-01-08", lastActive: "2 days ago", examsCompleted: 28, avgScore: 75, status: "active" },
  { id: "S008", name: "Adwoa Sarpong", email: "adwoa.s@yahoo.com", type: "school", school: "Mfantsipim", form: "JHS 1", registeredDate: "2025-03-01", lastActive: "Never", examsCompleted: 0, avgScore: 0, status: "pending" },
]

const registrationTrend = [
  { date: "Mar 1", school: 120, independent: 45 },
  { date: "Mar 5", school: 185, independent: 62 },
  { date: "Mar 10", school: 240, independent: 88 },
  { date: "Mar 15", school: 310, independent: 105 },
  { date: "Mar 20", school: 380, independent: 142 },
  { date: "Mar 25", school: 450, independent: 168 },
  { date: "Today", school: 520, independent: 195 },
]

const studentDistribution = [
  { name: "School Students", value: 38450, color: "oklch(0.55 0.15 170)" },
  { name: "Independent Students", value: 7230, color: "oklch(0.65 0.15 50)" },
]

const regionDistribution = [
  { region: "Greater Accra", students: 12500 },
  { region: "Ashanti", students: 9800 },
  { region: "Western", students: 5200 },
  { region: "Central", students: 4800 },
  { region: "Eastern", students: 4100 },
  { region: "Northern", students: 3200 },
  { region: "Volta", students: 2800 },
  { region: "Others", students: 3280 },
]

const formDistribution = [
  { form: "JHS 1", count: 12400, percentage: 27 },
  { form: "JHS 2", count: 15800, percentage: 35 },
  { form: "JHS 3", count: 17480, percentage: 38 },
]

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [formFilter, setFormFilter] = useState("all")
  const [dateRange, setDateRange] = useState("all")

  const filteredStudents = allStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || student.type === typeFilter
    const matchesStatus = statusFilter === "all" || student.status === statusFilter
    const matchesForm = formFilter === "all" || student.form === formFilter
    return matchesSearch && matchesType && matchesStatus && matchesForm
  })

  const schoolStudents = allStudents.filter(s => s.type === "school")
  const independentStudents = allStudents.filter(s => s.type === "independent")

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground">
            Comprehensive view of all students across the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Schools
          </Button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value="45,680"
          change={12.5}
          changeLabel="from last month"
          icon={Users}
        />
        <StatCard
          title="School Students"
          value="38,450"
          change={10.2}
          changeLabel="from last month"
          icon={School}
        />
        <StatCard
          title="Independent Students"
          value="7,230"
          change={24.8}
          changeLabel="from last month"
          icon={GraduationCap}
        />
        <StatCard
          title="Active Today"
          value="8,942"
          change={5.3}
          changeLabel="from yesterday"
          icon={UserCheck}
        />
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="all">All Students</TabsTrigger>
          <TabsTrigger value="school">School Students</TabsTrigger>
          <TabsTrigger value="independent">Independent Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Registration Trend */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Registration Trend</CardTitle>
                <CardDescription>New student registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={registrationTrend}>
                      <defs>
                        <linearGradient id="colorSchool" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.55 0.15 170)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="oklch(0.55 0.15 170)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorIndependent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.65 0.15 50)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="oklch(0.65 0.15 50)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="school"
                        stroke="oklch(0.55 0.15 170)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSchool)"
                        name="School Students"
                      />
                      <Area
                        type="monotone"
                        dataKey="independent"
                        stroke="oklch(0.65 0.15 50)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorIndependent)"
                        name="Independent Students"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Student Distribution */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Student Distribution</CardTitle>
                <CardDescription>School vs Independent students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={studentDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {studentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => value.toLocaleString()}
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-center gap-6">
                  {studentDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form and Region Distribution */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Form Distribution */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Distribution by Form</CardTitle>
                <CardDescription>Student count per JHS level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formDistribution.map((form) => (
                    <div key={form.form} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{form.form}</span>
                        <span className="text-sm text-muted-foreground">
                          {form.count.toLocaleString()} ({form.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${form.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Regional Distribution */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Regional Distribution</CardTitle>
                <CardDescription>Students by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                      <YAxis dataKey="region" type="category" stroke="var(--muted-foreground)" fontSize={11} width={90} />
                      <Tooltip
                        formatter={(value: number) => value.toLocaleString()}
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="students" fill="oklch(0.55 0.15 170)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* All Students Tab */}
        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or ID..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="independent">Independent</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Select value={formFilter} onValueChange={setFormFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Forms</SelectItem>
                      <SelectItem value="JHS 1">JHS 1</SelectItem>
                      <SelectItem value="JHS 2">JHS 2</SelectItem>
                      <SelectItem value="JHS 3">JHS 3</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <Card className="border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>School / Form</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-center">Exams</TableHead>
                    <TableHead className="text-center">Avg Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.type === "school" ? "default" : "secondary"}>
                          {student.type === "school" ? "School" : "Independent"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.school || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">{student.form}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{student.registeredDate}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{student.lastActive}</TableCell>
                      <TableCell className="text-center">{student.examsCompleted}</TableCell>
                      <TableCell className="text-center">
                        {student.avgScore > 0 ? (
                          <span className={student.avgScore >= 70 ? "text-emerald-600" : student.avgScore >= 50 ? "text-amber-600" : "text-red-600"}>
                            {student.avgScore}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            student.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : student.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        >
                          {student.status}
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend Account
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
        </TabsContent>

        {/* School Students Tab */}
        <TabsContent value="school" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>School-Affiliated Students</CardTitle>
              <CardDescription>Students registered through partner schools</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-center">Performance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{student.school}</TableCell>
                      <TableCell>{student.form}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{student.lastActive}</TableCell>
                      <TableCell className="text-center">
                        <span className={student.avgScore >= 70 ? "text-emerald-600 font-medium" : "text-muted-foreground"}>
                          {student.avgScore}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                          {student.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Independent Students Tab */}
        <TabsContent value="independent" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Independent Students</CardTitle>
              <CardDescription>Self-registered students preparing for BECE</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Form Level</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-center">Exams Completed</TableHead>
                    <TableHead className="text-center">Avg Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {independentStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{student.form}</TableCell>
                      <TableCell className="text-sm">{student.registeredDate}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{student.lastActive}</TableCell>
                      <TableCell className="text-center">{student.examsCompleted}</TableCell>
                      <TableCell className="text-center">
                        <span className={student.avgScore >= 70 ? "text-emerald-600 font-medium" : "text-muted-foreground"}>
                          {student.avgScore}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                          {student.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">New Today</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                    <p className="text-2xl font-bold">892</p>
                  </div>
                  <Calendar className="h-8 w-8 text-primary/40" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold">3,245</p>
                  </div>
                  <Calendar className="h-8 w-8 text-primary/40" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Churn Rate</p>
                    <p className="text-2xl font-bold">2.3%</p>
                  </div>
                  <UserX className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Student Activity Patterns</CardTitle>
              <CardDescription>Peak usage times and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Peak Hours</h4>
                  <p className="text-3xl font-bold text-primary">4PM - 8PM</p>
                  <p className="text-sm text-muted-foreground">Most active study period</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Avg Session Duration</h4>
                  <p className="text-3xl font-bold text-primary">42 mins</p>
                  <p className="text-sm text-muted-foreground">Per study session</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Weekly Active Users</h4>
                  <p className="text-3xl font-bold text-primary">28,450</p>
                  <p className="text-sm text-muted-foreground">62% of total students</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
