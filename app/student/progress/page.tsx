"use client"

import { achievements } from "@/lib/demo-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Target,
  TrendingUp,
  Award,
  Calendar,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
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

const weeklyProgress = [
  { week: "W1", score: 65, target: 70 },
  { week: "W2", score: 68, target: 70 },
  { week: "W3", score: 72, target: 75 },
  { week: "W4", score: 70, target: 75 },
  { week: "W5", score: 75, target: 80 },
  { week: "W6", score: 78, target: 80 },
  { week: "W7", score: 76, target: 80 },
  { week: "W8", score: 82, target: 85 },
]

const subjectProgress = [
  { subject: "Mathematics", current: 78, initial: 55, target: 85, exams: 12 },
  { subject: "English", current: 72, initial: 60, target: 80, exams: 10 },
  { subject: "Science", current: 85, initial: 65, target: 90, exams: 8 },
  { subject: "Social Studies", current: 68, initial: 50, target: 75, exams: 9 },
  { subject: "ICT", current: 82, initial: 70, target: 90, exams: 6 },
  { subject: "RME", current: 70, initial: 55, target: 80, exams: 7 },
]

const radarData = subjectProgress.map((s) => ({
  subject: s.subject.split(" ")[0],
  current: s.current,
  target: s.target,
}))


const studyGoals = [
  { goal: "Complete 5 Math practice exams", progress: 3, total: 5, dueDate: "Mar 25" },
  { goal: "Improve Social Studies by 10%", progress: 8, total: 10, dueDate: "Apr 1" },
  { goal: "Maintain study streak for 30 days", progress: 12, total: 30, dueDate: "Apr 15" },
]

export default function StudentProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Progress</h1>
        <p className="text-muted-foreground mt-1">
          Track your learning journey and achievements
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold">76%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-emerald-500/10 p-3">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Improvement</p>
                <p className="text-2xl font-bold text-emerald-600">+18%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-amber-500/10 p-3">
                <Flame className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Study Streak</p>
                <p className="text-2xl font-bold">12 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exams Completed</p>
                <p className="text-2xl font-bold">52</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart & Radar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Performance
            </CardTitle>
            <CardDescription>Your scores vs targets over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis domain={[50, 100]} className="text-xs" />
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
                    name="Your Score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "hsl(var(--primary))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Target"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Subject Mastery
            </CardTitle>
            <CardDescription>Current vs target performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid className="stroke-muted" />
                  <PolarAngleAxis dataKey="subject" className="text-xs" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Target"
                    dataKey="target"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.1}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Progress Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Subject Progress
          </CardTitle>
          <CardDescription>Detailed progress for each subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {subjectProgress.map((subject) => {
              const improvement = subject.current - subject.initial
              const toTarget = subject.target - subject.current
              const progressPercent = ((subject.current - subject.initial) / (subject.target - subject.initial)) * 100
              
              return (
                <div key={subject.subject} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{subject.subject}</span>
                      <Badge variant="outline" className="text-xs">
                        {subject.exams} exams
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-emerald-600">+{improvement}%</span>
                      <span className="font-semibold text-primary">{subject.current}%</span>
                      <span className="text-muted-foreground">/ {subject.target}%</span>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={progressPercent} className="h-3" />
                    <div
                      className="absolute top-0 h-3 w-0.5 bg-muted-foreground"
                      style={{ left: `${((subject.initial - subject.initial) / (subject.target - subject.initial)) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Started at {subject.initial}%</span>
                    <span>{toTarget > 0 ? `${toTarget}% to reach target` : "Target reached!"}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Goals & Achievements */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Study Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Study Goals
            </CardTitle>
            <CardDescription>Your current learning objectives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studyGoals.map((goal, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium">{goal.goal}</p>
                    <Badge variant="outline" className="text-xs shrink-0">
                      <Calendar className="h-3 w-3 mr-1" />
                      {goal.dueDate}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Progress</span>
                      <span>{goal.progress}/{goal.total}</span>
                    </div>
                    <Progress value={(goal.progress / goal.total) * 100} className="h-2" />
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                Set New Goal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Achievements
            </CardTitle>
            <CardDescription>Badges and milestones earned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.name}
                  className={`flex items-center gap-4 rounded-lg border p-3 ${
                    achievement.earned ? "bg-muted/30" : "opacity-60"
                  }`}
                >
                  <div
                    className={`rounded-full p-2 ${
                      achievement.earned
                        ? "bg-amber-500/10"
                        : "bg-muted"
                    }`}
                  >
                    {achievement.earned ? (
                      <Award className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{achievement.name}</p>
                      {achievement.earned && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                    {achievement.earned && achievement.date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Earned on {achievement.date}
                      </p>
                    )}
                    {!achievement.earned && achievement.progress !== undefined && (
                      <div className="mt-2">
                        <Progress
                          value={achievement.progress}
                          className="h-1.5"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
