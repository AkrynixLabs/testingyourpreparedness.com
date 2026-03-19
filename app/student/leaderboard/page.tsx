"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Flame,
  Target,
  Award,
} from "lucide-react"

const classLeaderboard = [
  { rank: 1, name: "Ama Serwaa", score: 92.5, change: 0, streak: 15, exams: 24 },
  { rank: 2, name: "Kofi Mensah", score: 89.2, change: 1, streak: 12, exams: 24 },
  { rank: 3, name: "Abena Osei", score: 87.8, change: -1, streak: 8, exams: 23 },
  { rank: 4, name: "Yaw Boateng", score: 85.4, change: 2, streak: 10, exams: 24 },
  { rank: 5, name: "Kwame Asante", score: 84.1, change: 0, streak: 7, exams: 24, isCurrentUser: true },
  { rank: 6, name: "Efua Darko", score: 82.9, change: -2, streak: 5, exams: 22 },
  { rank: 7, name: "Nana Adjei", score: 81.5, change: 1, streak: 6, exams: 24 },
  { rank: 8, name: "Akua Mensah", score: 79.8, change: -1, streak: 4, exams: 23 },
  { rank: 9, name: "Kwesi Appiah", score: 78.2, change: 0, streak: 3, exams: 21 },
  { rank: 10, name: "Adwoa Kumi", score: 76.5, change: 3, streak: 9, exams: 24 },
]

const schoolLeaderboard = [
  { rank: 1, name: "Ama Serwaa", class: "JHS 3A", score: 92.5, change: 0 },
  { rank: 2, name: "Emmanuel Tetteh", class: "JHS 3B", score: 91.8, change: 1 },
  { rank: 3, name: "Grace Asiedu", class: "JHS 3C", score: 90.2, change: 2 },
  { rank: 4, name: "Daniel Owusu", class: "JHS 3A", score: 89.5, change: -2 },
  { rank: 5, name: "Kofi Mensah", class: "JHS 3A", score: 89.2, change: 0 },
  { rank: 12, name: "Kwame Asante", class: "JHS 3A", score: 84.1, change: 2, isCurrentUser: true },
]

const nationalLeaderboard = [
  { rank: 1, name: "Bright Owusu", school: "Mfantsipim School", region: "Central", score: 96.8 },
  { rank: 2, name: "Gloria Appiah", school: "Wesley Girls", region: "Central", score: 95.9 },
  { rank: 3, name: "Samuel Asare", school: "Prempeh College", region: "Ashanti", score: 95.2 },
  { rank: 4, name: "Felicia Mensah", school: "Holy Child", region: "Central", score: 94.7 },
  { rank: 5, name: "David Antwi", school: "Achimota School", region: "Greater Accra", score: 94.1 },
  { rank: 245, name: "Kwame Asante", school: "Achimota School", region: "Greater Accra", score: 84.1, isCurrentUser: true },
]

const subjectLeaderboard = [
  { subject: "Mathematics", rank: 3, totalStudents: 45, percentile: 93 },
  { subject: "English Language", rank: 8, totalStudents: 45, percentile: 82 },
  { subject: "Integrated Science", rank: 5, totalStudents: 45, percentile: 89 },
  { subject: "Social Studies", rank: 12, totalStudents: 45, percentile: 73 },
  { subject: "ICT", rank: 2, totalStudents: 45, percentile: 96 },
  { subject: "French", rank: 15, totalStudents: 45, percentile: 67 },
  { subject: "RME", rank: 7, totalStudents: 45, percentile: 84 },
  { subject: "Ghanaian Language (Twi)", rank: 10, totalStudents: 45, percentile: 78 },
]

const achievements = [
  { name: "Top Performer", description: "Achieved 90%+ in 5 exams", icon: Star, earned: true },
  { name: "Perfect Score", description: "Got 100% on any exam", icon: Crown, earned: true },
  { name: "Study Streak", description: "7-day study streak", icon: Flame, earned: true },
  { name: "Subject Master", description: "Top 3 in any subject", icon: Target, earned: true },
  { name: "Consistency King", description: "Complete 20 exams", icon: Award, earned: true },
  { name: "National Star", description: "Top 100 nationally", icon: Trophy, earned: false },
]

export default function StudentLeaderboardPage() {
  const [timeframe, setTimeframe] = useState("month")

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
          <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank against other students</p>
        </div>
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
      </div>

      {/* Your Ranking Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Class Rank</p>
                <p className="text-3xl font-bold text-primary">#5</p>
                <p className="text-xs text-muted-foreground">of 45 students</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">School Rank</p>
                <p className="text-3xl font-bold">#12</p>
                <p className="text-xs text-muted-foreground">of 380 students</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-500">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+2</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">National Rank</p>
                <p className="text-3xl font-bold">#245</p>
                <p className="text-xs text-muted-foreground">of 45,600 students</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-500">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+18</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Study Streak</p>
                <p className="text-3xl font-bold">7 days</p>
                <p className="text-xs text-muted-foreground">Keep it going!</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Leaderboard */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Tabs defaultValue="class" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="class">My Class</TabsTrigger>
                  <TabsTrigger value="school">My School</TabsTrigger>
                  <TabsTrigger value="national">National</TabsTrigger>
                </TabsList>

                <TabsContent value="class" className="mt-4 space-y-2">
                  {classLeaderboard.map((student) => (
                    <div
                      key={student.rank}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                        student.isCurrentUser 
                          ? "bg-primary/10 border border-primary/20" 
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="w-8 flex justify-center">
                        {getRankIcon(student.rank)}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={student.isCurrentUser ? "bg-primary text-primary-foreground" : ""}>
                          {student.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${student.isCurrentUser ? "text-primary" : ""}`}>
                          {student.name} {student.isCurrentUser && "(You)"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{student.exams} exams</span>
                          <span>|</span>
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            {student.streak} streak
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{student.score}%</p>
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
                </TabsContent>

                <TabsContent value="school" className="mt-4 space-y-2">
                  {schoolLeaderboard.map((student, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                        student.isCurrentUser 
                          ? "bg-primary/10 border border-primary/20" 
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="w-8 flex justify-center">
                        {getRankIcon(student.rank)}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={student.isCurrentUser ? "bg-primary text-primary-foreground" : ""}>
                          {student.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${student.isCurrentUser ? "text-primary" : ""}`}>
                          {student.name} {student.isCurrentUser && "(You)"}
                        </p>
                        <p className="text-xs text-muted-foreground">{student.class}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{student.score}%</p>
                        <div className="flex items-center justify-end gap-1">
                          {getChangeIcon(student.change)}
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="national" className="mt-4 space-y-2">
                  {nationalLeaderboard.map((student, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                        student.isCurrentUser 
                          ? "bg-primary/10 border border-primary/20" 
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="w-8 flex justify-center">
                        {getRankIcon(student.rank)}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={student.isCurrentUser ? "bg-primary text-primary-foreground" : ""}>
                          {student.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${student.isCurrentUser ? "text-primary" : ""}`}>
                          {student.name} {student.isCurrentUser && "(You)"}
                        </p>
                        <p className="text-xs text-muted-foreground">{student.school}, {student.region}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{student.score}%</p>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subject Rankings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subject Rankings</CardTitle>
              <CardDescription>Your rank in each subject</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {subjectLeaderboard.map((subject) => (
                <div key={subject.subject} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{subject.subject}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${subject.percentile}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{subject.percentile}%</span>
                    </div>
                  </div>
                  <Badge variant={subject.rank <= 3 ? "default" : "secondary"} className="ml-3">
                    #{subject.rank}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Achievements</CardTitle>
              <CardDescription>Badges you have earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.name}
                    className={`flex flex-col items-center p-3 rounded-lg text-center ${
                      achievement.earned ? "bg-primary/10" : "bg-muted opacity-50"
                    }`}
                    title={achievement.description}
                  >
                    <achievement.icon className={`h-6 w-6 mb-1 ${achievement.earned ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="text-xs font-medium leading-tight">{achievement.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
