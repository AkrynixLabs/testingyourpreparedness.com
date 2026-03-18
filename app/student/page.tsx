"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatCard } from "@/components/stat-card"
import {
  BookOpen,
  Clock,
  Target,
  Award,
  TrendingUp,
  Play,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

const performanceData = [
  { month: "Sep", score: 58 },
  { month: "Oct", score: 62 },
  { month: "Nov", score: 67 },
  { month: "Dec", score: 71 },
  { month: "Jan", score: 74 },
  { month: "Feb", score: 78 },
]

const subjectStrengths = [
  { subject: "Mathematics", score: 82, fullMark: 100 },
  { subject: "English", score: 75, fullMark: 100 },
  { subject: "Science", score: 88, fullMark: 100 },
  { subject: "Social Studies", score: 70, fullMark: 100 },
  { subject: "ICT", score: 85, fullMark: 100 },
  { subject: "RME", score: 68, fullMark: 100 },
]

const upcomingExams = [
  {
    id: 1,
    title: "Mathematics Mock Exam 3",
    subject: "Mathematics",
    date: "Mar 20, 2026",
    time: "9:00 AM",
    duration: "2 hours",
    questions: 50,
    status: "scheduled",
  },
  {
    id: 2,
    title: "English Language Practice",
    subject: "English",
    date: "Mar 22, 2026",
    time: "10:00 AM",
    duration: "1.5 hours",
    questions: 40,
    status: "scheduled",
  },
  {
    id: 3,
    title: "Integrated Science Quiz",
    subject: "Science",
    date: "Mar 25, 2026",
    time: "2:00 PM",
    duration: "1 hour",
    questions: 30,
    status: "available",
  },
]

const recentResults = [
  {
    id: 1,
    title: "Mathematics Mock Exam 2",
    subject: "Mathematics",
    score: 78,
    totalMarks: 100,
    date: "Mar 10, 2026",
    rank: 5,
    totalStudents: 45,
  },
  {
    id: 2,
    title: "Social Studies Practice Test",
    subject: "Social Studies",
    score: 65,
    totalMarks: 80,
    date: "Mar 8, 2026",
    rank: 12,
    totalStudents: 45,
  },
  {
    id: 3,
    title: "ICT Assessment",
    subject: "ICT",
    score: 42,
    totalMarks: 50,
    date: "Mar 5, 2026",
    rank: 3,
    totalStudents: 45,
  },
]

const studyStreak = {
  current: 12,
  best: 21,
  thisWeek: 5,
}

export default function StudentDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, Kwame!
          </h1>
          <p className="text-muted-foreground mt-1">
            Keep up the great work! You&apos;re on a {studyStreak.current}-day study streak.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/student/exams">
            <Button size="lg" className="gap-2">
              <Play className="h-4 w-4" />
              Start Exam
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Exams Completed"
          value="24"
          description="This semester"
          icon={<CheckCircle2 className="h-4 w-4" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Average Score"
          value="76%"
          description="+4% from last month"
          icon={<Target className="h-4 w-4" />}
          trend={{ value: 4, isPositive: true }}
        />
        <StatCard
          title="Class Rank"
          value="#5"
          description="Out of 45 students"
          icon={<Award className="h-4 w-4" />}
          trend={{ value: 2, isPositive: true }}
        />
        <StatCard
          title="Study Hours"
          value="42h"
          description="This month"
          icon={<Clock className="h-4 w-4" />}
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance Trend
            </CardTitle>
            <CardDescription>Your average scores over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subject Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Subject Strengths
            </CardTitle>
            <CardDescription>Your performance by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={subjectStrengths}>
                  <PolarGrid className="stroke-muted" />
                  <PolarAngleAxis dataKey="subject" className="text-xs" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Exams & Recent Results */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Exams */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Exams
                </CardTitle>
                <CardDescription>Your scheduled assessments</CardDescription>
              </div>
              <Link href="/student/exams">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{exam.title}</h4>
                      {exam.status === "available" && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
                          Available Now
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{exam.date}</span>
                      <span>{exam.time}</span>
                      <span>{exam.duration}</span>
                    </div>
                  </div>
                  <Link href={`/student/exams/${exam.id}/start`}>
                    <Button
                      size="sm"
                      variant={exam.status === "available" ? "default" : "outline"}
                    >
                      {exam.status === "available" ? "Start" : "View"}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Recent Results
                </CardTitle>
                <CardDescription>Your latest exam scores</CardDescription>
              </div>
              <Link href="/student/results">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentResults.map((result) => {
                const percentage = Math.round((result.score / result.totalMarks) * 100)
                return (
                  <div
                    key={result.id}
                    className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{result.title}</h4>
                        <p className="text-sm text-muted-foreground">{result.date}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{percentage}%</div>
                        <p className="text-xs text-muted-foreground">
                          Rank #{result.rank} of {result.totalStudents}
                        </p>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Progress by Subject */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Subject Progress
          </CardTitle>
          <CardDescription>Track your preparation across all BECE subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subjectStrengths.map((subject) => (
              <div key={subject.subject} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{subject.subject}</h4>
                  <span className="text-sm font-semibold text-primary">{subject.score}%</span>
                </div>
                <Progress value={subject.score} className="h-2 mb-2" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {subject.score >= 80 ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>Excellent progress</span>
                    </>
                  ) : subject.score >= 60 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-amber-500" />
                      <span>Good progress</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      <span>Needs attention</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
