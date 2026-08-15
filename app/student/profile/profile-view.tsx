"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Save,
  Trophy,
  Target,
  Flame,
  Award,
  BookOpen,
  Calendar,
  MapPin,
  Phone,
  Mail,
  School,
  GraduationCap,
  Edit2,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { updateStudentProfile } from "./actions"
import type { EnrollmentType, GuardianRelation, StudentStatus } from "@/lib/generated/prisma/client"

type Stats = { examsTaken: number; averageScore: number | null; classRank: { rank: number; totalStudents: number } | null; currentStreak: number }
type Guardian = { name: string; relation: GuardianRelation; phone: string; email: string | null }
type Achievement = { id: string; name: string; criteria: string; earned: boolean; earnedAt: string | null }
type Activity = { type: "exam" | "achievement"; title: string; result: string | null; date: string }

const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

export function StudentProfileView({
  user,
  studentStatus,
  enrollmentType,
  schoolName,
  className,
  address,
  createdAt,
  guardian,
  stats,
  subjectPerformance,
  achievements,
  activity,
}: {
  user: { name: string; email: string }
  studentStatus: StudentStatus
  enrollmentType: EnrollmentType
  schoolName: string | null
  className: string | null
  address: string | null
  createdAt: string
  guardian: Guardian | null
  stats: Stats
  subjectPerformance: { subject: string; score: number; exams: number }[]
  achievements: Achievement[]
  activity: Activity[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: user.name, email: user.email })

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      try {
        await updateStudentProfile(form)
        setIsEditing(false)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save changes.")
      }
    })
  }

  const handleCancel = () => {
    setForm({ name: user.name, email: user.email })
    setIsEditing(false)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">View and manage your student profile</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              <Save className="h-4 w-4 mr-2" />
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <Avatar className="h-32 w-32">
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary">{initials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{user.name}</h2>
                      <Badge className={studentStatus === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}>
                        {studentStatus.charAt(0).toUpperCase() + studentStatus.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{enrollmentType === "school" ? "School-provisioned student" : "Independent student"}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm">
                      <School className="h-4 w-4 text-muted-foreground" />
                      <span>{schoolName ?? "Not affiliated with a school"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span>{className ?? "No class assigned"}</span>
                    </div>
                    {address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Joined {new Date(createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                    </div>
                  </div>

                  {subjectPerformance.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {subjectPerformance.slice(0, 3).map((s) => (
                        <Badge key={s.subject} variant="secondary">
                          {s.subject}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.examsTaken}</p>
                    <p className="text-xs text-muted-foreground">Exams Taken</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.averageScore !== null ? `${stats.averageScore}%` : "-"}</p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.classRank ? `#${stats.classRank.rank}` : "-"}</p>
                    <p className="text-xs text-muted-foreground">Class Rank</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Flame className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.currentStreak}</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your name and email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>Your performance across subjects you&apos;ve been examined in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjectPerformance.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Complete an exam to see subject performance.</p>
              ) : (
                subjectPerformance.map((subject) => (
                  <div key={subject.subject} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{subject.subject}</span>
                        <Badge variant="outline" className="text-xs">
                          {subject.exams} exam{subject.exams !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <span className="font-bold">{subject.score}%</span>
                    </div>
                    <Progress value={subject.score} className="flex-1" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              {address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Guardian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {guardian ? (
                <>
                  <div>
                    <p className="font-medium">{guardian.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{guardian.relation}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{guardian.phone}</span>
                  </div>
                  {guardian.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{guardian.email}</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No guardian information on file.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Achievements</CardTitle>
              <CardDescription>
                {achievements.filter((a) => a.earned).length} of {achievements.length} badges earned
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className={`flex items-center gap-3 p-2 rounded-lg ${achievement.earned ? "bg-primary/5" : "bg-muted/50 opacity-60"}`}>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${achievement.earned ? "bg-primary/10" : "bg-muted"}`}>
                    {achievement.earned ? <Award className="h-5 w-5 text-primary" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{achievement.name}</p>
                    {achievement.earned && achievement.earnedAt ? (
                      <p className="text-xs text-muted-foreground">{new Date(achievement.earnedAt).toLocaleDateString()}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">{achievement.criteria}</p>
                    )}
                  </div>
                  {achievement.earned && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                activity.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.type === "exam" ? "bg-blue-500/10" : "bg-amber-500/10"}`}>
                      {item.type === "exam" ? <BookOpen className="h-4 w-4 text-blue-500" /> : <Award className="h-4 w-4 text-amber-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2">
                        {item.result && (
                          <Badge variant="secondary" className="text-xs">
                            {item.result}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
