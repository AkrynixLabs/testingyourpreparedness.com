"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Users,
  Target,
  Flame,
  Star,
  Award,
  Filter,
} from "lucide-react"

// School-wide student leaderboard
const schoolLeaderboard = [
  { rank: 1, name: "Ama Serwaa", class: "JHS 3A", score: 92.5, exams: 24, streak: 15, change: 0 },
  { rank: 2, name: "Emmanuel Tetteh", class: "JHS 3B", score: 91.8, exams: 24, streak: 12, change: 1 },
  { rank: 3, name: "Grace Asiedu", class: "JHS 3C", score: 90.2, exams: 23, streak: 18, change: 2 },
  { rank: 4, name: "Daniel Owusu", class: "JHS 3A", score: 89.5, exams: 24, streak: 9, change: -2 },
  { rank: 5, name: "Kofi Mensah", class: "JHS 3A", score: 89.2, exams: 24, streak: 11, change: 0 },
  { rank: 6, name: "Abena Osei", class: "JHS 3B", score: 87.8, exams: 23, streak: 8, change: 1 },
  { rank: 7, name: "Yaw Boateng", class: "JHS 2A", score: 85.4, exams: 22, streak: 10, change: 3 },
  { rank: 8, name: "Kwame Asante", class: "JHS 3A", score: 84.1, exams: 24, streak: 7, change: -1 },
  { rank: 9, name: "Efua Darko", class: "JHS 2B", score: 82.9, exams: 21, streak: 5, change: 0 },
  { rank: 10, name: "Nana Adjei", class: "JHS 3C", score: 81.5, exams: 24, streak: 6, change: 2 },
]

// Class leaderboards
const classLeaderboards: Record<string, typeof schoolLeaderboard> = {
  "JHS 3A": [
    { rank: 1, name: "Ama Serwaa", class: "JHS 3A", score: 92.5, exams: 24, streak: 15, change: 0 },
    { rank: 2, name: "Kofi Mensah", class: "JHS 3A", score: 89.2, exams: 24, streak: 11, change: 1 },
    { rank: 3, name: "Daniel Owusu", class: "JHS 3A", score: 89.5, exams: 24, streak: 9, change: -1 },
    { rank: 4, name: "Kwame Asante", class: "JHS 3A", score: 84.1, exams: 24, streak: 7, change: 0 },
    { rank: 5, name: "Akua Mensah", class: "JHS 3A", score: 79.8, exams: 23, streak: 4, change: 2 },
  ],
  "JHS 3B": [
    { rank: 1, name: "Emmanuel Tetteh", class: "JHS 3B", score: 91.8, exams: 24, streak: 12, change: 0 },
    { rank: 2, name: "Abena Osei", class: "JHS 3B", score: 87.8, exams: 23, streak: 8, change: 0 },
    { rank: 3, name: "Kwesi Appiah", class: "JHS 3B", score: 78.2, exams: 21, streak: 3, change: 1 },
    { rank: 4, name: "Adwoa Kumi", class: "JHS 3B", score: 76.5, exams: 24, streak: 9, change: -1 },
    { rank: 5, name: "Yaw Mensah", class: "JHS 3B", score: 74.2, exams: 22, streak: 2, change: 0 },
  ],
  "JHS 3C": [
    { rank: 1, name: "Grace Asiedu", class: "JHS 3C", score: 90.2, exams: 23, streak: 18, change: 0 },
    { rank: 2, name: "Nana Adjei", class: "JHS 3C", score: 81.5, exams: 24, streak: 6, change: 1 },
    { rank: 3, name: "Esi Boateng", class: "JHS 3C", score: 79.3, exams: 22, streak: 5, change: 0 },
    { rank: 4, name: "Kofi Asante", class: "JHS 3C", score: 77.8, exams: 23, streak: 4, change: 2 },
    { rank: 5, name: "Ama Darko", class: "JHS 3C", score: 75.1, exams: 21, streak: 3, change: -2 },
  ],
}

// Subject leaderboards
const subjectLeaderboards = [
  {
    subject: "Mathematics",
    topStudents: [
      { rank: 1, name: "Ama Serwaa", class: "JHS 3A", score: 96.5 },
      { rank: 2, name: "Emmanuel Tetteh", class: "JHS 3B", score: 94.2 },
      { rank: 3, name: "Grace Asiedu", class: "JHS 3C", score: 92.8 },
    ],
    classAvg: 72.5,
    schoolAvg: 68.5,
  },
  {
    subject: "English Language",
    topStudents: [
      { rank: 1, name: "Grace Asiedu", class: "JHS 3C", score: 95.3 },
      { rank: 2, name: "Ama Serwaa", class: "JHS 3A", score: 93.7 },
      { rank: 3, name: "Abena Osei", class: "JHS 3B", score: 91.2 },
    ],
    classAvg: 74.8,
    schoolAvg: 70.2,
  },
  {
    subject: "Integrated Science",
    topStudents: [
      { rank: 1, name: "Emmanuel Tetteh", class: "JHS 3B", score: 94.8 },
      { rank: 2, name: "Daniel Owusu", class: "JHS 3A", score: 93.1 },
      { rank: 3, name: "Kofi Mensah", class: "JHS 3A", score: 91.5 },
    ],
    classAvg: 70.3,
    schoolAvg: 65.8,
  },
  {
    subject: "Social Studies",
    topStudents: [
      { rank: 1, name: "Ama Serwaa", class: "JHS 3A", score: 92.4 },
      { rank: 2, name: "Grace Asiedu", class: "JHS 3C", score: 90.8 },
      { rank: 3, name: "Nana Adjei", class: "JHS 3C", score: 88.5 },
    ],
    classAvg: 71.2,
    schoolAvg: 68.9,
  },
  {
    subject: "ICT",
    topStudents: [
      { rank: 1, name: "Kofi Mensah", class: "JHS 3A", score: 97.2 },
      { rank: 2, name: "Emmanuel Tetteh", class: "JHS 3B", score: 95.5 },
      { rank: 3, name: "Kwame Asante", class: "JHS 3A", score: 94.1 },
    ],
    classAvg: 78.5,
    schoolAvg: 74.2,
  },
]

// Class performance comparison
const classComparison = [
  { class: "JHS 3A", students: 45, avgScore: 82.4, examsCompleted: 1080, topPerformer: "Ama Serwaa", change: 2.3 },
  { class: "JHS 3B", students: 42, avgScore: 78.6, examsCompleted: 1008, topPerformer: "Emmanuel Tetteh", change: 1.8 },
  { class: "JHS 3C", students: 44, avgScore: 76.2, examsCompleted: 968, topPerformer: "Grace Asiedu", change: 3.1 },
  { class: "JHS 2A", students: 48, avgScore: 74.5, examsCompleted: 912, topPerformer: "Yaw Boateng", change: -0.5 },
  { class: "JHS 2B", students: 46, avgScore: 72.8, examsCompleted: 874, topPerformer: "Efua Darko", change: 1.2 },
  { class: "JHS 2C", students: 43, avgScore: 71.3, examsCompleted: 860, topPerformer: "Kwesi Antwi", change: 0.8 },
  { class: "JHS 1A", students: 50, avgScore: 68.9, examsCompleted: 750, topPerformer: "Akua Mensah", change: 4.2 },
  { class: "JHS 1B", students: 47, avgScore: 67.5, examsCompleted: 705, topPerformer: "Kofi Darko", change: 2.1 },
]

export default function SchoolLeaderboardPage() {
  const [timeframe, setTimeframe] = useState("month")
  const [selectedClass, setSelectedClass] = useState("JHS 3A")
  const [selectedSubject, setSelectedSubject] = useState("all")

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-emerald-500" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Leaderboard</h1>
          <p className="text-muted-foreground">Track and compare student performance across your school</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="term">This Term</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">1,240</p>
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +45 this month
                </p>
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
                <p className="text-sm text-muted-foreground">School Average</p>
                <p className="text-2xl font-bold">76.8%</p>
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +2.1% from last month
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Performer</p>
                <p className="text-2xl font-bold">Ama Serwaa</p>
                <p className="text-xs text-muted-foreground">JHS 3A - 92.5%</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Crown className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Streaks</p>
                <p className="text-2xl font-bold">342</p>
                <p className="text-xs text-muted-foreground">Students with 3+ day streak</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="school" className="space-y-6">
        <TabsList>
          <TabsTrigger value="school">School Rankings</TabsTrigger>
          <TabsTrigger value="class">By Class</TabsTrigger>
          <TabsTrigger value="subject">By Subject</TabsTrigger>
          <TabsTrigger value="comparison">Class Comparison</TabsTrigger>
        </TabsList>

        {/* School-wide Rankings */}
        <TabsContent value="school" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Top 3 Students */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Performing Students</CardTitle>
                <CardDescription>School-wide rankings based on average scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3 mb-6">
                  {schoolLeaderboard.slice(0, 3).map((student, idx) => (
                    <div
                      key={student.rank}
                      className={`relative p-4 rounded-lg text-center ${
                        idx === 0 ? "bg-yellow-500/10 border-2 border-yellow-500/30" :
                        idx === 1 ? "bg-gray-500/10 border-2 border-gray-400/30" :
                        "bg-amber-500/10 border-2 border-amber-600/30"
                      }`}
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        {idx === 0 ? <Crown className="h-6 w-6 text-yellow-500" /> :
                         idx === 1 ? <Medal className="h-6 w-6 text-gray-400" /> :
                         <Medal className="h-6 w-6 text-amber-600" />}
                      </div>
                      <Avatar className="h-16 w-16 mx-auto mt-2">
                        <AvatarFallback>{student.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <p className="font-bold mt-2">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.class}</p>
                      <p className="text-2xl font-bold mt-1 text-primary">{student.score}%</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        <span className="text-xs text-muted-foreground">{student.streak} day streak</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Full Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Rank</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead className="text-right">Exams</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Streak</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schoolLeaderboard.map((student) => (
                      <TableRow key={student.rank}>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {getRankIcon(student.rank)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {student.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{student.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{student.class}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{student.exams}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${student.score >= 85 ? "text-emerald-600" : student.score >= 75 ? "text-amber-600" : ""}`}>
                            {student.score}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span>{student.streak}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {getChangeIcon(student.change)}
                            {student.change !== 0 && (
                              <span className={`text-xs ${student.change > 0 ? "text-emerald-500" : "text-red-500"}`}>
                                {Math.abs(student.change)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Achievers</CardTitle>
                  <CardDescription>Students with most badges</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Ama Serwaa", badges: 8, class: "JHS 3A" },
                    { name: "Emmanuel Tetteh", badges: 7, class: "JHS 3B" },
                    { name: "Grace Asiedu", badges: 6, class: "JHS 3C" },
                    { name: "Kofi Mensah", badges: 5, class: "JHS 3A" },
                    { name: "Daniel Owusu", badges: 5, class: "JHS 3A" },
                  ].map((student, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-4">{idx + 1}</span>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {student.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.class}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-bold">{student.badges}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Longest Streaks</CardTitle>
                  <CardDescription>Most consistent students</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Grace Asiedu", streak: 18, class: "JHS 3C" },
                    { name: "Ama Serwaa", streak: 15, class: "JHS 3A" },
                    { name: "Emmanuel Tetteh", streak: 12, class: "JHS 3B" },
                    { name: "Kofi Mensah", streak: 11, class: "JHS 3A" },
                    { name: "Yaw Boateng", streak: 10, class: "JHS 2A" },
                  ].map((student, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-4">{idx + 1}</span>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {student.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.class}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-bold">{student.streak} days</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* By Class */}
        <TabsContent value="class" className="space-y-6">
          <div className="flex items-center gap-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JHS 3A">JHS 3A</SelectItem>
                <SelectItem value="JHS 3B">JHS 3B</SelectItem>
                <SelectItem value="JHS 3C">JHS 3C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{selectedClass} Rankings</CardTitle>
              <CardDescription>Top students in this class</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {classLeaderboards[selectedClass]?.map((student) => (
                  <div
                    key={student.rank}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      student.rank <= 3 ? "bg-primary/5 border border-primary/10" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="w-8 flex justify-center">
                      {getRankIcon(student.rank)}
                    </div>
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{student.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{student.name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{student.exams} exams</span>
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-500" />
                          {student.streak} day streak
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{student.score}%</p>
                      <div className="flex items-center justify-end gap-1">
                        {getChangeIcon(student.change)}
                        {student.change !== 0 && (
                          <span className={`text-xs ${student.change > 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {Math.abs(student.change)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Subject */}
        <TabsContent value="subject" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subjectLeaderboards.map((subject) => (
              <Card key={subject.subject}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{subject.subject}</CardTitle>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Class Avg: <strong>{subject.classAvg}%</strong></span>
                    <span className="text-muted-foreground">School Avg: <strong>{subject.schoolAvg}%</strong></span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {subject.topStudents.map((student) => (
                    <div key={student.rank} className="flex items-center gap-3">
                      <div className="w-6 flex justify-center">
                        {getRankIcon(student.rank)}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {student.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.class}</p>
                      </div>
                      <span className="font-bold text-primary">{student.score}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Class Comparison */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Class Performance Comparison</CardTitle>
              <CardDescription>Compare performance metrics across all classes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead className="text-right">Avg Score</TableHead>
                    <TableHead className="text-right">Exams Completed</TableHead>
                    <TableHead>Top Performer</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classComparison.map((cls) => (
                    <TableRow key={cls.class}>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">{cls.class}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{cls.students}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={cls.avgScore} className="w-20 h-2" />
                          <span className={`font-bold ${cls.avgScore >= 80 ? "text-emerald-600" : cls.avgScore >= 70 ? "text-amber-600" : ""}`}>
                            {cls.avgScore}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{cls.examsCompleted.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-amber-500" />
                          <span>{cls.topPerformer}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {cls.change > 0 ? (
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                          ) : cls.change < 0 ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : (
                            <Minus className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={`text-sm ${cls.change > 0 ? "text-emerald-500" : cls.change < 0 ? "text-red-500" : ""}`}>
                            {cls.change > 0 ? "+" : ""}{cls.change}%
                          </span>
                        </div>
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
