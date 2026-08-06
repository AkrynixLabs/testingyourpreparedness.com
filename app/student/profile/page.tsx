"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { achievements } from "@/lib/demo-data"
import {
  Camera,
  Save,
  Trophy,
  Target,
  Flame,
  Award,
  BookOpen,
  Clock,
  Calendar,
  MapPin,
  Phone,
  Mail,
  School,
  GraduationCap,
  Edit2,
  CheckCircle2,
} from "lucide-react"

const recentActivity = [
  { type: "exam", title: "Mathematics Mock Exam", result: "92%", date: "2 hours ago", status: "passed" },
  { type: "achievement", title: "Earned 'Study Streak' badge", date: "1 day ago" },
  { type: "exam", title: "English Language Quiz", result: "88%", date: "2 days ago", status: "passed" },
  { type: "material", title: "Completed Science Chapter 5", date: "3 days ago" },
  { type: "exam", title: "Social Studies Practice", result: "76%", date: "4 days ago", status: "passed" },
]

const subjectProgress = [
  { subject: "Mathematics", score: 85, exams: 12, rank: 3 },
  { subject: "English Language", score: 78, exams: 10, rank: 8 },
  { subject: "Integrated Science", score: 82, exams: 11, rank: 5 },
  { subject: "Social Studies", score: 74, exams: 9, rank: 12 },
  { subject: "ICT", score: 91, exams: 8, rank: 2 },
]

const initialProfileForm = {
  firstName: "Kwame",
  lastName: "Asante",
  email: "kwame.asante@student.edu.gh",
  phone: "+233 24 123 4567",
  bio: "Passionate about learning and striving to be the best in Mathematics and ICT.",
}

export default function StudentProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileForm, setProfileForm] = useState(initialProfileForm)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setIsEditing(false)
    }, 1500)
  }

  const handleCancel = () => {
    setProfileForm(initialProfileForm)
    setIsEditing(false)
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
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary">KA</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{profileForm.firstName} {profileForm.lastName}</h2>
                      <Badge className="bg-emerald-500/10 text-emerald-600">Active</Badge>
                    </div>
                    <p className="text-muted-foreground">Student ID: STU-2024-00542</p>
                  </div>
                  
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm">
                      <School className="h-4 w-4 text-muted-foreground" />
                      <span>Achimota School</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span>JHS 3A</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Accra, Greater Accra</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Joined September 2023</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Mathematics</Badge>
                    <Badge variant="secondary">ICT</Badge>
                    <Badge variant="secondary">Science</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Summary */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">24</p>
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
                    <p className="text-2xl font-bold">84%</p>
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
                    <p className="text-2xl font-bold">#5</p>
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
                    <p className="text-2xl font-bold">7</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personal Information (Editable) */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us a bit about yourself..."
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subject Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>Your performance across all subjects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjectProgress.map((subject) => (
                <div key={subject.subject} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{subject.subject}</span>
                      <Badge variant="outline" className="text-xs">Rank #{subject.rank}</Badge>
                    </div>
                    <span className="font-bold">{subject.score}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={subject.score} className="flex-1" />
                    <span className="text-xs text-muted-foreground w-16">{subject.exams} exams</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profileForm.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profileForm.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Accra, Greater Accra</span>
              </div>
            </CardContent>
          </Card>

          {/* Guardian Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Guardian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">Mr. Kofi Asante</p>
                <p className="text-sm text-muted-foreground">Father</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">+233 20 987 6543</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">kofi.asante@email.com</span>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Achievements</CardTitle>
              <CardDescription>
                {achievements.filter((a) => a.earned).length} of {achievements.length} badges earned
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.name}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    achievement.earned ? "bg-primary/5" : "bg-muted/50 opacity-60"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    achievement.earned ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <achievement.icon className={`h-5 w-5 ${achievement.earned ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{achievement.name}</p>
                    {achievement.earned ? (
                      <p className="text-xs text-muted-foreground">{achievement.date}</p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Progress value={achievement.progress} className="h-1 flex-1" />
                        <span className="text-xs text-muted-foreground">{achievement.progress}%</span>
                      </div>
                    )}
                  </div>
                  {achievement.earned && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === "exam" ? "bg-blue-500/10" :
                    activity.type === "achievement" ? "bg-amber-500/10" :
                    "bg-emerald-500/10"
                  }`}>
                    {activity.type === "exam" ? <BookOpen className="h-4 w-4 text-blue-500" /> :
                     activity.type === "achievement" ? <Award className="h-4 w-4 text-amber-500" /> :
                     <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <div className="flex items-center gap-2">
                      {activity.result && (
                        <Badge variant="secondary" className="text-xs">{activity.result}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{activity.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
