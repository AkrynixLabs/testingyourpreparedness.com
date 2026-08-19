"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
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
import { Crown, Medal, School, Users, GraduationCap, MapPin, Search, Filter, BookOpen } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { OwnershipType, EnrollmentType } from "@/lib/generated/prisma/client"

type SchoolRanking = {
  id: string
  name: string
  region: string
  ownershipType: OwnershipType
  students: number
  examsCompleted: number
  avgScore: number | null
  passRate: number | null
  rank: number
}

type StudentRanking = {
  id: string
  name: string
  schoolName: string | null
  region: string | null
  enrollmentType: EnrollmentType
  exams: number
  subjects: number
  avgScore: number | null
  rank: number
}

type RegionStat = { region: string; schools: number; students: number; avgScore: number | null }

type SubjectPerformance = {
  subjectId: string
  subject: string
  avgScore: number
  answeredQuestions: number
  topSchool: { name: string; score: number } | null
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
  return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
}

export function LeaderboardView({
  schoolRankings,
  studentRankings,
  regionStats,
  subjectPerformance,
  summary,
}: {
  schoolRankings: SchoolRanking[]
  studentRankings: StudentRanking[]
  regionStats: RegionStat[]
  subjectPerformance: SubjectPerformance[]
  summary: {
    totalSchools: number
    schoolStudents: number
    independentStudents: number
    nationalAverage: number | null
    nationalPassRate: number | null
  }
}) {
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedType, setSelectedType] = useState<OwnershipType | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [studentType, setStudentType] = useState<EnrollmentType | "all">("all")
  const [studentSearch, setStudentSearch] = useState("")

  const regions = Array.from(new Set(schoolRankings.map((s) => s.region))).sort()

  const filteredSchools = schoolRankings.filter((school) => {
    const matchesRegion = selectedRegion === "all" || school.region === selectedRegion
    const matchesType = selectedType === "all" || school.ownershipType === selectedType
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRegion && matchesType && matchesSearch
  })

  const filteredStudents = studentRankings.filter((student) => {
    const matchesType = studentType === "all" || student.enrollmentType === studentType
    const matchesSearch =
      student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (student.schoolName?.toLowerCase().includes(studentSearch.toLowerCase()) ?? false)
    return matchesType && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">National Leaderboard & Analytics</h1>
        <p className="text-muted-foreground">Real performance data aggregated from actual exam attempts</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Schools</p>
                <p className="text-2xl font-bold">{summary.totalSchools}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <School className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">School Learners</p>
                <p className="text-2xl font-bold">{summary.schoolStudents}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Independent Learners</p>
                <p className="text-2xl font-bold">{summary.independentStudents}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">National Average</p>
              <p className="text-2xl font-bold">
                {summary.nationalAverage !== null ? `${summary.nationalAverage.toFixed(1)}%` : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Pass Rate</p>
              <p className="text-2xl font-bold">
                {summary.nationalPassRate !== null ? `${summary.nationalPassRate.toFixed(1)}%` : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schools" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="schools">School Rankings</TabsTrigger>
          <TabsTrigger value="students">Learner Rankings</TabsTrigger>
          <TabsTrigger value="regions">Regional Analysis</TabsTrigger>
          <TabsTrigger value="subjects">Subject Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="schools" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search schools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={(v) => setSelectedType(v as OwnershipType | "all")}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                    <SelectItem value="religious">Religious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {filteredSchools.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No schools have any submitted exam attempts yet.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Schools</CardTitle>
                <CardDescription>Ranked by average score across all submitted exam attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3 mb-6">
                  {filteredSchools.slice(0, 3).map((school, idx) => (
                    <div
                      key={school.id}
                      className={`relative p-4 rounded-lg text-center ${
                        idx === 0
                          ? "bg-yellow-500/10 border-2 border-yellow-500/30"
                          : idx === 1
                          ? "bg-gray-500/10 border-2 border-gray-400/30"
                          : "bg-amber-500/10 border-2 border-amber-600/30"
                      }`}
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        {idx === 0 ? (
                          <Crown className="h-6 w-6 text-yellow-500" />
                        ) : (
                          <Medal className={`h-6 w-6 ${idx === 1 ? "text-gray-400" : "text-amber-600"}`} />
                        )}
                      </div>
                      <p className="font-bold text-lg mt-2">{school.name}</p>
                      <p className="text-sm text-muted-foreground">{school.region}</p>
                      <p className="text-2xl font-bold mt-2 text-primary">{school.avgScore!.toFixed(1)}%</p>
                      <div className="flex items-center justify-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{school.students} learners</span>
                        <span>|</span>
                        <span>{school.passRate!.toFixed(0)}% pass</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Rank</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Learners</TableHead>
                      <TableHead className="text-right">Exams</TableHead>
                      <TableHead className="text-right">Avg Score</TableHead>
                      <TableHead className="text-right">Pass Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchools.map((school) => (
                      <TableRow key={school.id}>
                        <TableCell>
                          <div className="flex items-center justify-center">{getRankIcon(school.rank)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">{school.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{school.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {school.region}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {school.ownershipType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{school.students}</TableCell>
                        <TableCell className="text-right">{school.examsCompleted}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-bold ${
                              school.avgScore! >= 85 ? "text-emerald-600" : school.avgScore! >= 75 ? "text-amber-600" : ""
                            }`}
                          >
                            {school.avgScore!.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{school.passRate!.toFixed(0)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search learners..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={studentType} onValueChange={(v) => setStudentType(v as EnrollmentType | "all")}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Learners" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Learners</SelectItem>
                    <SelectItem value="school">School Learners</SelectItem>
                    <SelectItem value="independent">Independent Learners</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Learners Nationally</CardTitle>
              <CardDescription>Ranked by average score across all submitted exam attempts</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredStudents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No learners have any submitted exam attempts yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Rank</TableHead>
                      <TableHead>Learner</TableHead>
                      <TableHead>School/Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Exams</TableHead>
                      <TableHead className="text-right">Subjects</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center justify-center">{getRankIcon(student.rank)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {student.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{student.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={student.enrollmentType === "independent" ? "text-purple-600" : ""}>
                            {student.schoolName ?? "Independent"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={student.enrollmentType === "school" ? "secondary" : "default"}
                            className={student.enrollmentType === "independent" ? "bg-purple-500/10 text-purple-600" : ""}
                          >
                            {student.enrollmentType === "school" ? "School" : "Independent"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{student.exams}</TableCell>
                        <TableCell className="text-right">{student.subjects}</TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-primary">{student.avgScore!.toFixed(1)}%</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance</CardTitle>
                <CardDescription>Average school score by region</CardDescription>
              </CardHeader>
              <CardContent>
                {regionStats.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No regional data yet.</p>
                ) : (
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={regionStats} layout="vertical" margin={{ left: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis type="category" dataKey="region" />
                        <Tooltip />
                        <Bar dataKey="avgScore" name="Avg Score" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Statistics</CardTitle>
                <CardDescription>Detailed breakdown by region</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Region</TableHead>
                      <TableHead className="text-right">Schools</TableHead>
                      <TableHead className="text-right">Learners</TableHead>
                      <TableHead className="text-right">Avg Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regionStats.map((region) => (
                      <TableRow key={region.region}>
                        <TableCell className="font-medium">{region.region}</TableCell>
                        <TableCell className="text-right">{region.schools}</TableCell>
                        <TableCell className="text-right">{region.students}</TableCell>
                        <TableCell className="text-right">
                          {region.avgScore !== null ? (
                            <span
                              className={`font-bold ${
                                region.avgScore >= 75 ? "text-emerald-600" : region.avgScore >= 70 ? "text-amber-600" : ""
                              }`}
                            >
                              {region.avgScore.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          {subjectPerformance.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No answered questions yet to derive subject performance from.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {subjectPerformance.map((subject) => (
                <Card key={subject.subjectId}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      {subject.subject}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">National Average</span>
                      <span className="font-bold">{subject.avgScore.toFixed(1)}%</span>
                    </div>
                    <Progress value={subject.avgScore} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {subject.answeredQuestions} question{subject.answeredQuestions === 1 ? "" : "s"} answered
                    </p>
                    {subject.topSchool && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">Top School</p>
                        <p className="text-sm font-medium">{subject.topSchool.name}</p>
                        <p className="text-xs text-primary font-bold">{subject.topSchool.score.toFixed(1)}%</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
