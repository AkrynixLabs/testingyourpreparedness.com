"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, Medal, Crown, Download, Users, Target, Flame, Award } from "lucide-react"
import type { Class } from "@/lib/generated/prisma/client"

type Attempt = { score: number; totalMarks: number; submittedAt: string; subjectId: string; subjectName: string }
type StudentRow = { id: string; name: string; classId: string | null; className: string; badgeCount: number; attempts: Attempt[] }

type Timeframe = "week" | "month" | "term" | "year" | "all"

const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

function timeframeCutoff(timeframe: Timeframe): Date | null {
  if (timeframe === "all") return null
  const now = new Date()
  const days = { week: 7, month: 30, term: 90, year: 365 }[timeframe]
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
}

function avgPercent(attempts: Attempt[]): number | null {
  if (attempts.length === 0) return null
  const sum = attempts.reduce((acc, a) => acc + (a.score / a.totalMarks) * 100, 0)
  return Math.round((sum / attempts.length) * 10) / 10
}

function currentStreak(attempts: Attempt[]): number {
  if (attempts.length === 0) return 0
  const days = Array.from(
    new Set(attempts.map((a) => new Date(a.submittedAt).toISOString().slice(0, 10)))
  ).sort((a, b) => (a < b ? 1 : -1)) // newest first

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const mostRecent = new Date(days[0])
  const diffFromToday = Math.round((today.getTime() - mostRecent.getTime()) / (24 * 60 * 60 * 1000))
  if (diffFromToday > 1) return 0 // streak broken if last activity wasn't today or yesterday

  let streak = 1
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1])
    const cur = new Date(days[i])
    const diff = Math.round((prev.getTime() - cur.getTime()) / (24 * 60 * 60 * 1000))
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
  return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
}

export function LeaderboardView({ students, classes }: { students: StudentRow[]; classes: Class[] }) {
  const [timeframe, setTimeframe] = useState<Timeframe>("month")
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? "")

  const cutoff = timeframeCutoff(timeframe)

  const ranked = useMemo(() => {
    return students
      .map((s) => {
        const attempts = cutoff ? s.attempts.filter((a) => new Date(a.submittedAt) >= cutoff) : s.attempts
        const avg = avgPercent(attempts)
        return { ...s, avg, examCount: attempts.length, streak: currentStreak(s.attempts) }
      })
      .filter((s) => s.avg !== null)
      .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))
      .map((s, i) => ({ ...s, rank: i + 1 }))
  }, [students, cutoff])

  const classRanked = useMemo(
    () => ranked.filter((s) => s.classId === selectedClassId).map((s, i) => ({ ...s, rank: i + 1 })),
    [ranked, selectedClassId]
  )

  const subjectLeaderboards = useMemo(() => {
    const subjectMap = new Map<string, { subjectName: string; entries: { name: string; className: string; avg: number }[] }>()
    for (const s of students) {
      const attempts = cutoff ? s.attempts.filter((a) => new Date(a.submittedAt) >= cutoff) : s.attempts
      const bySubject = new Map<string, Attempt[]>()
      for (const a of attempts) {
        if (!bySubject.has(a.subjectId)) bySubject.set(a.subjectId, [])
        bySubject.get(a.subjectId)!.push(a)
      }
      for (const [subjectId, subjectAttempts] of bySubject) {
        const avg = avgPercent(subjectAttempts)
        if (avg === null) continue
        if (!subjectMap.has(subjectId)) {
          subjectMap.set(subjectId, { subjectName: subjectAttempts[0].subjectName, entries: [] })
        }
        subjectMap.get(subjectId)!.entries.push({ name: s.name, className: s.className, avg })
      }
    }
    return Array.from(subjectMap.entries()).map(([subjectId, data]) => {
      const sorted = data.entries.sort((a, b) => b.avg - a.avg)
      const schoolAvg = Math.round((sorted.reduce((sum, e) => sum + e.avg, 0) / sorted.length) * 10) / 10
      return { subjectId, subjectName: data.subjectName, top: sorted.slice(0, 3), schoolAvg }
    })
  }, [students, cutoff])

  const classComparison = useMemo(() => {
    return classes.map((cls) => {
      const classStudents = students.filter((s) => s.classId === cls.id)
      const withAttempts = classStudents
        .map((s) => {
          const attempts = cutoff ? s.attempts.filter((a) => new Date(a.submittedAt) >= cutoff) : s.attempts
          return { name: s.name, avg: avgPercent(attempts), examCount: attempts.length }
        })
        .filter((s): s is { name: string; avg: number; examCount: number } => s.avg !== null)
      const avgScore =
        withAttempts.length > 0
          ? Math.round((withAttempts.reduce((sum, s) => sum + s.avg, 0) / withAttempts.length) * 10) / 10
          : null
      const examsCompleted = withAttempts.reduce((sum, s) => sum + s.examCount, 0)
      const top = withAttempts.sort((a, b) => b.avg - a.avg)[0] ?? null
      return {
        id: cls.id,
        displayName: cls.displayName,
        studentCount: classStudents.length,
        avgScore,
        examsCompleted,
        topPerformer: top?.name ?? "-",
      }
    })
  }, [classes, students, cutoff])

  const topAchievers = useMemo(
    () => [...students].sort((a, b) => b.badgeCount - a.badgeCount).filter((s) => s.badgeCount > 0).slice(0, 5),
    [students]
  )
  const longestStreaks = useMemo(
    () =>
      ranked
        .filter((s) => s.streak > 0)
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 5),
    [ranked]
  )

  const schoolAverage = ranked.length > 0 ? Math.round((ranked.reduce((sum, s) => sum + (s.avg ?? 0), 0) / ranked.length) * 10) / 10 : null
  const activeStreaks = ranked.filter((s) => s.streak >= 3).length
  const topPerformer = ranked[0] ?? null

  const handleExport = () => {
    downloadCsv(
      `leaderboard-${timeframe}.csv`,
      [
        ["Rank", "Name", "Class", "Score %", "Exams", "Streak"],
        ...ranked.map((s) => [s.rank, s.name, s.className, s.avg ?? "", s.examCount, s.streak]),
      ]
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Learner Leaderboard</h1>
          <p className="text-muted-foreground">Track and compare learner performance across your school</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={(v) => setTimeframe(v as Timeframe)}>
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
          <Button variant="outline" onClick={handleExport} disabled={ranked.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ranked Learners</p>
                <p className="text-2xl font-bold">{ranked.length}</p>
                <p className="text-xs text-muted-foreground">With exams in this period</p>
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
                <p className="text-2xl font-bold">{schoolAverage !== null ? `${schoolAverage}%` : "-"}</p>
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
                <p className="text-2xl font-bold">{topPerformer?.name ?? "-"}</p>
                <p className="text-xs text-muted-foreground">
                  {topPerformer ? `${topPerformer.className} - ${topPerformer.avg}%` : "No data"}
                </p>
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
                <p className="text-2xl font-bold">{activeStreaks}</p>
                <p className="text-xs text-muted-foreground">Learners with 3+ day streak</p>
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

        <TabsContent value="school" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Performing Learners</CardTitle>
                <CardDescription>School-wide rankings based on average scores</CardDescription>
              </CardHeader>
              <CardContent>
                {ranked.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No exams completed in this period.</p>
                ) : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-3 mb-6">
                      {ranked.slice(0, 3).map((student, idx) => (
                        <div
                          key={student.id}
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
                          <Avatar className="h-16 w-16 mx-auto mt-2">
                            <AvatarFallback>{initials(student.name)}</AvatarFallback>
                          </Avatar>
                          <p className="font-bold mt-2">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.className}</p>
                          <p className="text-2xl font-bold mt-1 text-primary">{student.avg}%</p>
                          {student.streak > 0 && (
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <Flame className="h-3 w-3 text-orange-500" />
                              <span className="text-xs text-muted-foreground">{student.streak} day streak</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">Rank</TableHead>
                          <TableHead>Learner</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead className="text-right">Exams</TableHead>
                          <TableHead className="text-right">Score</TableHead>
                          <TableHead className="text-right">Streak</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ranked.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>
                              <div className="flex items-center justify-center">
                                <RankIcon rank={student.rank} />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">{initials(student.name)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{student.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{student.className}</Badge>
                            </TableCell>
                            <TableCell className="text-right">{student.examCount}</TableCell>
                            <TableCell className="text-right">
                              <span
                                className={`font-bold ${
                                  (student.avg ?? 0) >= 85 ? "text-emerald-600" : (student.avg ?? 0) >= 75 ? "text-amber-600" : ""
                                }`}
                              >
                                {student.avg}%
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {student.streak > 0 && <Flame className="h-3 w-3 text-orange-500" />}
                                <span>{student.streak || "-"}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Achievers</CardTitle>
                  <CardDescription>Learners with most badges</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topAchievers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No badges earned yet.</p>
                  ) : (
                    topAchievers.map((student, idx) => (
                      <div key={student.id} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-muted-foreground w-4">{idx + 1}</span>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{initials(student.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.className}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-bold">{student.badgeCount}</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Longest Streaks</CardTitle>
                  <CardDescription>Most consistent learners</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {longestStreaks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active streaks.</p>
                  ) : (
                    longestStreaks.map((student, idx) => (
                      <div key={student.id} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-muted-foreground w-4">{idx + 1}</span>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{initials(student.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.className}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-bold">{student.streak} days</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="class" className="space-y-6">
          <div className="flex items-center gap-4">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{classes.find((c) => c.id === selectedClassId)?.displayName ?? "Class"} Rankings</CardTitle>
              <CardDescription>Top learners in this class</CardDescription>
            </CardHeader>
            <CardContent>
              {classRanked.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No exams completed in this period.</p>
              ) : (
                <div className="space-y-3">
                  {classRanked.map((student) => (
                    <div
                      key={student.id}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        student.rank <= 3 ? "bg-primary/5 border border-primary/10" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="w-8 flex justify-center">
                        <RankIcon rank={student.rank} />
                      </div>
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{initials(student.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{student.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{student.examCount} exams</span>
                          {student.streak > 0 && (
                            <span className="flex items-center gap-1">
                              <Flame className="h-3 w-3 text-orange-500" />
                              {student.streak} day streak
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold">{student.avg}%</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subject" className="space-y-6">
          {subjectLeaderboards.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No exams completed in this period.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {subjectLeaderboards.map((subject) => (
                <Card key={subject.subjectId}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{subject.subjectName}</CardTitle>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        School Avg: <strong>{subject.schoolAvg}%</strong>
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {subject.top.map((student, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-6 flex justify-center">
                          <RankIcon rank={idx + 1} />
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{initials(student.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.className}</p>
                        </div>
                        <span className="font-bold text-primary">{student.avg}%</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

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
                    <TableHead className="text-right">Learners</TableHead>
                    <TableHead className="text-right">Avg Score</TableHead>
                    <TableHead className="text-right">Exams Completed</TableHead>
                    <TableHead>Top Performer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classComparison.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {cls.displayName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{cls.studentCount}</TableCell>
                      <TableCell className="text-right">
                        {cls.avgScore !== null ? (
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={cls.avgScore} className="w-20 h-2" />
                            <span
                              className={`font-bold ${
                                cls.avgScore >= 80 ? "text-emerald-600" : cls.avgScore >= 70 ? "text-amber-600" : ""
                              }`}
                            >
                              {cls.avgScore}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{cls.examsCompleted.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-amber-500" />
                          <span>{cls.topPerformer}</span>
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
