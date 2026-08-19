"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Search, MoreHorizontal, Users, School, UserCheck, GraduationCap, Ban, ShieldCheck } from "lucide-react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { setStudentStatus } from "./actions"
import type { EnrollmentType, StudentStatus } from "@/lib/generated/prisma/client"

export type StudentRow = {
  id: string
  name: string
  email: string
  enrollmentType: EnrollmentType
  schoolName: string | null
  className: string | null
  registeredAt: Date
  lastActive: Date | null
  examsCompleted: number
  avgScore: number | null
  status: StudentStatus
}

const DIST_COLORS = ["oklch(0.55 0.15 170)", "oklch(0.65 0.15 50)"]

function StatusBadge({ status }: { status: StudentStatus }) {
  return (
    <Badge
      variant="secondary"
      className={
        status === "active"
          ? "bg-emerald-100 text-emerald-700"
          : status === "pending"
          ? "bg-amber-100 text-amber-700"
          : "bg-gray-100 text-gray-700"
      }
    >
      {status}
    </Badge>
  )
}

export function StudentsView({
  students,
  schoolStudents,
  independentStudents,
  stats,
  formDistribution,
  regionDistribution,
}: {
  students: StudentRow[]
  schoolStudents: StudentRow[]
  independentStudents: StudentRow[]
  stats: { total: number; school: number; independent: number; active: number }
  formDistribution: { form: string; count: number; percentage: number }[]
  regionDistribution: { region: string; count: number }[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<EnrollmentType | "all">("all")
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "all">("all")

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || student.enrollmentType === typeFilter
    const matchesStatus = statusFilter === "all" || student.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const distribution = [
    { name: "School Learners", value: stats.school, color: DIST_COLORS[0] },
    { name: "Independent Learners", value: stats.independent, color: DIST_COLORS[1] },
  ]

  const handleSetStatus = (studentId: string, status: StudentStatus) => {
    startTransition(async () => {
      await setStudentStatus(studentId, status)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Learner Management</h1>
        <p className="text-muted-foreground">Comprehensive view of all learners across the platform</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Learners" value={stats.total.toString()} icon={Users} />
        <StatCard title="School Learners" value={stats.school.toString()} icon={School} />
        <StatCard title="Independent Learners" value={stats.independent.toString()} icon={GraduationCap} />
        <StatCard title="Active" value={stats.active.toString()} icon={UserCheck} />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="all">All Learners</TabsTrigger>
          <TabsTrigger value="school">School Learners</TabsTrigger>
          <TabsTrigger value="independent">Independent Learners</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Learner Distribution</CardTitle>
                <CardDescription>School vs Independent learners</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.total === 0 ? (
                  <p className="text-sm text-muted-foreground">No learners yet.</p>
                ) : (
                  <>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={distribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                            labelLine={false}
                          >
                            {distribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
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
                      {distribution.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-muted-foreground">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Regional Distribution</CardTitle>
                <CardDescription>School-affiliated learners by region</CardDescription>
              </CardHeader>
              <CardContent>
                {regionDistribution.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No school-affiliated learners yet.</p>
                ) : (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={regionDistribution} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                        <YAxis dataKey="region" type="category" stroke="var(--muted-foreground)" fontSize={11} width={90} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="count" fill="oklch(0.55 0.15 170)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Distribution by Form</CardTitle>
              <CardDescription>School-affiliated learner count per form</CardDescription>
            </CardHeader>
            <CardContent>
              {formDistribution.length === 0 ? (
                <p className="text-sm text-muted-foreground">No school-affiliated learners yet.</p>
              ) : (
                <div className="space-y-4">
                  {formDistribution.map((form) => (
                    <div key={form.form} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{form.form}</span>
                        <span className="text-sm text-muted-foreground">
                          {form.count} ({form.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${form.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as EnrollmentType | "all")}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="independent">Independent</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StudentStatus | "all")}>
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
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Learner</TableHead>
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
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        No students match these filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.enrollmentType === "school" ? "default" : "secondary"}>
                            {student.enrollmentType === "school" ? "School" : "Independent"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.schoolName ?? "N/A"}</p>
                            <p className="text-sm text-muted-foreground">{student.className ?? "-"}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{student.registeredAt.toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {student.lastActive ? student.lastActive.toLocaleDateString() : "Never"}
                        </TableCell>
                        <TableCell className="text-center">{student.examsCompleted}</TableCell>
                        <TableCell className="text-center">
                          {student.avgScore !== null ? (
                            <span
                              className={
                                student.avgScore >= 70
                                  ? "text-emerald-600"
                                  : student.avgScore >= 50
                                  ? "text-amber-600"
                                  : "text-red-600"
                              }
                            >
                              {student.avgScore}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={student.status} />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={isPending}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {student.status === "inactive" ? (
                                <DropdownMenuItem onClick={() => handleSetStatus(student.id, "active")}>
                                  <ShieldCheck className="mr-2 h-4 w-4" />
                                  Reactivate
                                </DropdownMenuItem>
                              ) : (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleSetStatus(student.id, "inactive")}
                                  >
                                    <Ban className="mr-2 h-4 w-4" />
                                    Suspend Account
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="school" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>School-Affiliated Learners</CardTitle>
              <CardDescription>Learners registered through partner schools</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Learner</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-center">Avg Score</TableHead>
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
                      <TableCell className="font-medium">{student.schoolName}</TableCell>
                      <TableCell>{student.className ?? "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {student.lastActive ? student.lastActive.toLocaleDateString() : "Never"}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.avgScore !== null ? (
                          <span className="text-emerald-600 font-medium">{student.avgScore}%</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={student.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="independent" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Independent Learners</CardTitle>
              <CardDescription>Self-registered learners studying independently</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Learner</TableHead>
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
                      <TableCell className="text-sm">{student.registeredAt.toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {student.lastActive ? student.lastActive.toLocaleDateString() : "Never"}
                      </TableCell>
                      <TableCell className="text-center">{student.examsCompleted}</TableCell>
                      <TableCell className="text-center">
                        {student.avgScore !== null ? (
                          <span className="text-emerald-600 font-medium">{student.avgScore}%</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={student.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
