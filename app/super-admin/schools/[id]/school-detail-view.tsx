"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
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
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Search,
  CheckCircle2,
  Ban,
  BarChart3,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { setSchoolStatus } from "../actions"
import type {
  School,
  SchoolAdmin,
  User,
  Subscription,
  SubscriptionPlan,
  Invoice,
  SchoolStatus,
} from "@/lib/generated/prisma/client"

type SchoolWithRelations = School & {
  admins: (SchoolAdmin & { user: Omit<User, "passwordHash"> })[]
  subscription: (Subscription & { plan: SubscriptionPlan }) | null
}

export function SchoolDetailView({
  school,
  primaryAdmin,
  students,
  classes,
  invoices,
  subjectPerformance,
  recentAttempts,
  stats,
}: {
  school: SchoolWithRelations
  primaryAdmin: (SchoolAdmin & { user: Omit<User, "passwordHash"> }) | null
  students: {
    id: string
    name: string
    email: string
    className: string
    classId: string | null
    examsCompleted: number
    avgScore: number | null
    status: string
  }[]
  classes: {
    id: string
    displayName: string
    studentCount: number
    avgScore: number | null
    examsCompleted: number
    topStudentName: string | null
  }[]
  invoices: Invoice[]
  subjectPerformance: { subject: string; avgScore: number }[]
  recentAttempts: {
    id: string
    studentName: string
    assessmentTitle: string
    subjectName: string
    score: number | null
    submittedAt: Date
  }[]
  stats: { totalStudents: number; activeStudents: number; totalClasses: number; avgScore: number | null }
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [studentSearch, setStudentSearch] = useState("")
  const [classFilter, setClassFilter] = useState("all")

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase())
    const matchesClass = classFilter === "all" || s.classId === classFilter
    return matchesSearch && matchesClass
  })

  const handleSetStatus = (status: SchoolStatus) => {
    startTransition(async () => {
      await setSchoolStatus(school.id, status)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/super-admin/schools">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{school.name}</h1>
              <Badge variant={school.status === "active" ? "default" : "secondary"}>
                {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {school.code} | {school.ownershipType.charAt(0).toUpperCase() + school.ownershipType.slice(1)} School
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" disabled={isPending}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {school.status === "suspended" ? (
                <DropdownMenuItem onClick={() => handleSetStatus("active")}>Reactivate School</DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-red-600" onClick={() => handleSetStatus("suspended")}>
                  Suspend School
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-xs text-muted-foreground">{stats.activeStudents} active</p>
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
                <p className="text-2xl font-bold">{stats.totalClasses}</p>
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
                <p className="text-2xl font-bold">{stats.avgScore !== null ? `${stats.avgScore}%` : "-"}</p>
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
                <p className="text-sm text-muted-foreground">Subscription</p>
                <p className="text-2xl font-bold">GHS {school.subscription?.plan.monthlyPrice ?? "-"}</p>
                <p className="text-xs text-muted-foreground">{school.subscription?.plan.name ?? "No plan"}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
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
                      <p className="font-medium">
                        {school.region}, {school.district}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {school.address}, {school.town}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{school.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{school.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium">{school.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Subscription</p>
                      <p className="font-medium">
                        {school.subscription ? (
                          <>
                            {school.subscription.plan.name} Plan -{" "}
                            <span className="text-emerald-600 capitalize">{school.subscription.status.replace("_", " ")}</span>
                          </>
                        ) : (
                          "No active plan"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>School Administrator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {primaryAdmin ? (
                  <>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {primaryAdmin.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{primaryAdmin.user.name}</p>
                        <p className="text-sm text-muted-foreground">{primaryAdmin.isPrimary ? "Primary Admin" : "Admin"}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{primaryAdmin.user.email}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No administrator on record.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* flex-wrap added - a 250px Input + 150px Select in a
                non-wrapping row overflows a narrow phone viewport with
                no fallback. Found by a static mobile-audit pass
                2026-08-08 (see docs/build-log.md). */}
            <div className="flex flex-wrap items-center gap-2">
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
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No students match these filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{student.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.className}</TableCell>
                      <TableCell>
                        {student.avgScore !== null ? (
                          <span
                            className={`font-medium ${
                              student.avgScore >= 80 ? "text-emerald-600" : student.avgScore >= 60 ? "text-amber-600" : "text-red-600"
                            }`}
                          >
                            {student.avgScore}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{student.examsCompleted}</TableCell>
                      <TableCell>
                        <Badge variant={student.status === "active" ? "default" : "secondary"}>
                          {student.status === "active" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                            </>
                          ) : (
                            <>
                              <Ban className="h-3 w-3 mr-1" /> {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                            </>
                          )}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          {classes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No classes yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {classes.map((cls) => (
                <Card key={cls.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{cls.displayName}</CardTitle>
                      <Badge variant="secondary">{cls.studentCount} students</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Average Score</span>
                      <span
                        className={`font-medium ${
                          cls.avgScore === null
                            ? "text-muted-foreground"
                            : cls.avgScore >= 80
                            ? "text-emerald-600"
                            : cls.avgScore >= 70
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {cls.avgScore !== null ? `${cls.avgScore}%` : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Exams Completed</span>
                      <span className="font-medium">{cls.examsCompleted}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Top Student</span>
                      <span className="font-medium">{cls.topStudentName ?? "-"}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>Average correctness by subject, derived from this school&apos;s real exam attempts</CardDescription>
            </CardHeader>
            <CardContent>
              {subjectPerformance.length === 0 ? (
                <p className="text-sm text-muted-foreground py-12 text-center">No answered questions yet.</p>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" domain={[0, 100]} className="text-xs" />
                      <YAxis dataKey="subject" type="category" width={100} className="text-xs" />
                      <Tooltip formatter={(value: number) => [`${value}%`, "Avg Score"]} />
                      <Bar dataKey="avgScore" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Avg Score (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>{school.subscription?.plan.name ?? "No plan"}</CardDescription>
                </div>
                {school.subscription && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 capitalize">{school.subscription.status.replace("_", " ")}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {school.subscription ? (
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-2xl font-bold">GHS {school.subscription.plan.monthlyPrice}/month</p>
                    <p className="text-sm text-muted-foreground">Renews {school.subscription.renewalDate.toLocaleDateString()}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">This school has no active subscription.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No invoices yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.period}</TableCell>
                        <TableCell>{invoice.dueDate.toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">GHS {invoice.amount}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              invoice.status === "paid"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : invoice.status === "overdue"
                                ? "bg-red-500/10 text-red-600"
                                : "bg-amber-500/10 text-amber-600"
                            }
                          >
                            {invoice.status === "paid" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Most recent completed exam attempts by this school&apos;s students</CardDescription>
            </CardHeader>
            <CardContent>
              {recentAttempts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No exam attempts yet.</p>
              ) : (
                <div className="space-y-4">
                  {recentAttempts.map((attempt) => (
                    <div key={attempt.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {attempt.studentName} completed {attempt.assessmentTitle}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {attempt.subjectName}
                          {attempt.score !== null ? ` · ${attempt.score}%` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{attempt.submittedAt.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
