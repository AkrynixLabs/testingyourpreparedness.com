"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Target, TrendingUp, TrendingDown, Award, Calendar, BookOpen, CheckCircle2, Clock, Flame } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"
import { createStudyGoal } from "./actions"
import type { StudyGoalUnit } from "@/lib/generated/prisma/client"

type Stats = { overallProgress: number | null; improvement: number | null; currentStreak: number; examsCompleted: number }
type StudyGoal = { id: string; goal: string; unit: StudyGoalUnit; progress: number; total: number; dueDate: string | null }
type Achievement = { id: string; name: string; description: string; criteria: string; earned: boolean; earnedAt: string | null }

export function StudentProgressView({
  stats,
  weeklyProgress,
  subjectProgress,
  studyGoals,
  achievements,
}: {
  stats: Stats
  weeklyProgress: { week: string; score: number }[]
  subjectProgress: { subject: string; initial: number; current: number; exams: number }[]
  studyGoals: StudyGoal[]
  achievements: Achievement[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newGoal, setNewGoal] = useState({ goal: "", unit: "exam_count" as StudyGoalUnit, total: "5", dueDate: "" })

  const handleCreateGoal = () => {
    setError(null)
    startTransition(async () => {
      try {
        await createStudyGoal({
          goal: newGoal.goal,
          unit: newGoal.unit,
          total: Number(newGoal.total),
          dueDate: newGoal.dueDate || null,
        })
        setDialogOpen(false)
        setNewGoal({ goal: "", unit: "exam_count", total: "5", dueDate: "" })
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create goal.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Progress</h1>
        <p className="text-muted-foreground mt-1">Track your learning journey and achievements</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold">{stats.overallProgress !== null ? `${stats.overallProgress}%` : "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-emerald-500/10 p-3">
                {stats.improvement !== null && stats.improvement < 0 ? (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Improvement</p>
                <p className={`text-2xl font-bold ${stats.improvement !== null && stats.improvement < 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {stats.improvement !== null ? `${stats.improvement > 0 ? "+" : ""}${stats.improvement}%` : "-"}
                </p>
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
                <p className="text-2xl font-bold">{stats.currentStreak} days</p>
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
                <p className="text-2xl font-bold">{stats.examsCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Performance
            </CardTitle>
            <CardDescription>Your average scores by week</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyProgress.length === 0 ? (
              <p className="text-sm text-muted-foreground py-16 text-center">Complete an exam to see your weekly trend.</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="score" name="Your Score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Subject Mastery
            </CardTitle>
            <CardDescription>Current average by subject</CardDescription>
          </CardHeader>
          <CardContent>
            {subjectProgress.length === 0 ? (
              <p className="text-sm text-muted-foreground py-16 text-center">No data yet.</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={subjectProgress.map((s) => ({ subject: s.subject.split(" ")[0], current: s.current }))}>
                    <PolarGrid className="stroke-muted" />
                    <PolarAngleAxis dataKey="subject" className="text-xs" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                    <Radar name="Current" dataKey="current" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Subject Progress
          </CardTitle>
          <CardDescription>Detailed progress for each subject you&apos;ve been examined in</CardDescription>
        </CardHeader>
        <CardContent>
          {subjectProgress.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Complete an exam to see subject progress.</p>
          ) : (
            <div className="space-y-6">
              {subjectProgress.map((subject) => {
                const change = subject.current - subject.initial
                return (
                  <div key={subject.subject} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{subject.subject}</span>
                        <Badge variant="outline" className="text-xs">
                          {subject.exams} exam{subject.exams !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        {change !== 0 && (
                          <span className={change > 0 ? "text-emerald-600" : "text-red-600"}>
                            {change > 0 ? "+" : ""}
                            {change}%
                          </span>
                        )}
                        <span className="font-semibold text-primary">{subject.current}%</span>
                      </div>
                    </div>
                    <Progress value={subject.current} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>First exam: {subject.initial}%</span>
                      <span>Latest average: {subject.current}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
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
              {studyGoals.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No goals set yet.</p>}
              {studyGoals.map((goal) => (
                <div key={goal.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium">{goal.goal}</p>
                    {goal.dueDate && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(goal.dueDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Progress</span>
                      <span>
                        {goal.progress}/{goal.total}
                      </span>
                    </div>
                    <Progress value={(goal.progress / goal.total) * 100} className="h-2" />
                  </div>
                </div>
              ))}

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Set New Goal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Set a New Study Goal</DialogTitle>
                    <DialogDescription>Track your own learning objective.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <div className="space-y-2">
                      <Label htmlFor="goal">Goal</Label>
                      <Input
                        id="goal"
                        placeholder="e.g., Complete 5 Math practice exams"
                        value={newGoal.goal}
                        onChange={(e) => setNewGoal({ ...newGoal, goal: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Unit</Label>
                        <Select value={newGoal.unit} onValueChange={(v) => setNewGoal({ ...newGoal, unit: v as StudyGoalUnit })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="exam_count">Exams</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="day_streak">Day Streak</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="total">Target</Label>
                        <Input
                          id="total"
                          type="number"
                          min="1"
                          value={newGoal.total}
                          onChange={(e) => setNewGoal({ ...newGoal, total: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date (optional)</Label>
                      <Input id="dueDate" type="date" value={newGoal.dueDate} onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateGoal} disabled={isPending || !newGoal.goal}>
                      {isPending ? "Creating..." : "Create Goal"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

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
                  key={achievement.id}
                  className={`flex items-center gap-4 rounded-lg border p-3 ${achievement.earned ? "bg-muted/30" : "opacity-60"}`}
                >
                  <div className={`rounded-full p-2 ${achievement.earned ? "bg-amber-500/10" : "bg-muted"}`}>
                    {achievement.earned ? <Award className="h-5 w-5 text-amber-500" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{achievement.name}</p>
                      {achievement.earned && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {achievement.earned && achievement.earnedAt ? (
                      <p className="text-xs text-muted-foreground mt-1">Earned on {new Date(achievement.earnedAt).toLocaleDateString()}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">{achievement.criteria}</p>
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
