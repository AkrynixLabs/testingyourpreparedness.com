"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  School,
  Users,
  Target,
  Award,
  MapPin,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const nationalLeaderboard = [
  { rank: 1, name: "Mfantsipim School", region: "Central", students: 520, avgScore: 89.2, examsCompleted: 12480, change: 0, type: "Public" },
  { rank: 2, name: "Wesley Girls' High School", region: "Central", students: 485, avgScore: 88.7, examsCompleted: 11640, change: 1, type: "Public" },
  { rank: 3, name: "Prempeh College", region: "Ashanti", students: 510, avgScore: 87.9, examsCompleted: 12240, change: -1, type: "Public" },
  { rank: 4, name: "Holy Child School", region: "Central", students: 440, avgScore: 87.2, examsCompleted: 10560, change: 2, type: "Public" },
  { rank: 5, name: "Achimota School", region: "Greater Accra", students: 456, avgScore: 86.8, examsCompleted: 10944, change: 0, type: "Public" },
  { rank: 6, name: "St. Augustine's College", region: "Central", students: 495, avgScore: 86.1, examsCompleted: 11880, change: -2, type: "Public" },
  { rank: 7, name: "Opoku Ware School", region: "Ashanti", students: 480, avgScore: 85.5, examsCompleted: 11520, change: 1, type: "Public" },
  { rank: 8, name: "Aburi Girls' SHS", region: "Eastern", students: 410, avgScore: 84.9, examsCompleted: 9840, change: 3, type: "Public" },
  { rank: 9, name: "Ghana International School", region: "Greater Accra", students: 220, avgScore: 84.5, examsCompleted: 5280, change: -1, type: "Private" },
  { rank: 10, name: "Presbyterian Boys' SHS", region: "Eastern", students: 505, avgScore: 84.2, examsCompleted: 12120, change: 0, type: "Public" },
]

const regionalLeaderboard = {
  "Greater Accra": [
    { rank: 1, name: "Achimota School", students: 456, avgScore: 86.8, change: 0 },
    { rank: 2, name: "Ghana International School", students: 220, avgScore: 84.5, change: 1 },
    { rank: 3, name: "St. Thomas Aquinas SHS", students: 380, avgScore: 82.3, change: -1 },
    { rank: 4, name: "Accra Academy", students: 420, avgScore: 81.7, change: 2 },
    { rank: 5, name: "Labone SHS", students: 365, avgScore: 80.9, change: 0 },
  ],
  "Ashanti": [
    { rank: 1, name: "Prempeh College", students: 510, avgScore: 87.9, change: 0 },
    { rank: 2, name: "Opoku Ware School", students: 480, avgScore: 85.5, change: 0 },
    { rank: 3, name: "St. Louis SHS", students: 425, avgScore: 83.2, change: 1 },
    { rank: 4, name: "Yaa Asantewaa Girls' SHS", students: 390, avgScore: 82.8, change: -1 },
    { rank: 5, name: "T.I. Ahmadiyya SHS", students: 445, avgScore: 81.5, change: 0 },
  ],
  "Central": [
    { rank: 1, name: "Mfantsipim School", students: 520, avgScore: 89.2, change: 0 },
    { rank: 2, name: "Wesley Girls' High School", students: 485, avgScore: 88.7, change: 0 },
    { rank: 3, name: "Holy Child School", students: 440, avgScore: 87.2, change: 0 },
    { rank: 4, name: "St. Augustine's College", students: 495, avgScore: 86.1, change: 0 },
    { rank: 5, name: "Adisadel College", students: 475, avgScore: 83.5, change: 2 },
  ],
}

const subjectLeaderboard = [
  { subject: "Mathematics", topSchool: "Mfantsipim School", avgScore: 92.1, nationalAvg: 68.5 },
  { subject: "English Language", topSchool: "Wesley Girls' High School", avgScore: 91.3, nationalAvg: 72.8 },
  { subject: "Integrated Science", topSchool: "Prempeh College", avgScore: 90.8, nationalAvg: 65.2 },
  { subject: "Social Studies", topSchool: "Holy Child School", avgScore: 89.5, nationalAvg: 70.1 },
  { subject: "ICT", topSchool: "Ghana International School", avgScore: 93.2, nationalAvg: 74.5 },
  { subject: "French", topSchool: "Wesley Girls' High School", avgScore: 88.7, nationalAvg: 62.3 },
  { subject: "RME", topSchool: "Holy Child School", avgScore: 90.2, nationalAvg: 71.8 },
  { subject: "Ghanaian Language", topSchool: "Prempeh College", avgScore: 87.9, nationalAvg: 69.4 },
]

const regionalDistribution = [
  { region: "Greater Accra", schools: 32, avgScore: 78.5 },
  { region: "Ashanti", schools: 28, avgScore: 76.8 },
  { region: "Central", schools: 18, avgScore: 82.3 },
  { region: "Eastern", schools: 15, avgScore: 75.2 },
  { region: "Western", schools: 12, avgScore: 73.8 },
  { region: "Northern", schools: 10, avgScore: 68.5 },
  { region: "Volta", schools: 8, avgScore: 71.2 },
  { region: "Others", schools: 4, avgScore: 69.8 },
]

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const improvementLeaders = [
  { rank: 1, name: "Tamale SHS", region: "Northern", improvement: 12.5, currentAvg: 72.8 },
  { rank: 2, name: "Bolgatanga Girls' SHS", region: "Upper East", improvement: 10.8, currentAvg: 69.5 },
  { rank: 3, name: "Wa SHS", region: "Upper West", improvement: 9.2, currentAvg: 67.3 },
  { rank: 4, name: "Ho Technical Institute", region: "Volta", improvement: 8.7, currentAvg: 71.2 },
  { rank: 5, name: "Sunyani SHS", region: "Bono", improvement: 7.9, currentAvg: 74.5 },
]

export default function SchoolLeaderboardPage() {
  const [timeframe, setTimeframe] = useState("month")
  const [selectedRegion, setSelectedRegion] = useState("Greater Accra")

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{rank}</span>
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
          <h1 className="text-2xl font-bold text-foreground">School Leaderboard</h1>
          <p className="text-muted-foreground">Track and compare school performance across Ghana</p>
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
                <p className="text-sm text-muted-foreground">Total Schools</p>
                <p className="text-2xl font-bold">127</p>
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +6 this month
                </p>
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
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">45,623</p>
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +1,245 this month
                </p>
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
                <p className="text-sm text-muted-foreground">National Average</p>
                <p className="text-2xl font-bold">72.8%</p>
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +2.3% from last month
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
                <p className="text-sm text-muted-foreground">Exams Completed</p>
                <p className="text-2xl font-bold">1.2M</p>
                <p className="text-xs text-muted-foreground">This academic year</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="national" className="space-y-6">
        <TabsList>
          <TabsTrigger value="national">National Rankings</TabsTrigger>
          <TabsTrigger value="regional">By Region</TabsTrigger>
          <TabsTrigger value="subjects">By Subject</TabsTrigger>
          <TabsTrigger value="improvement">Most Improved</TabsTrigger>
        </TabsList>

        {/* National Rankings */}
        <TabsContent value="national" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Top 3 Schools */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Performing Schools</CardTitle>
                <CardDescription>Based on average student scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3 mb-6">
                  {nationalLeaderboard.slice(0, 3).map((school, idx) => (
                    <div
                      key={school.rank}
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
                      <p className="font-bold text-lg mt-2">{school.name}</p>
                      <p className="text-sm text-muted-foreground">{school.region}</p>
                      <p className="text-2xl font-bold mt-2 text-primary">{school.avgScore}%</p>
                      <p className="text-xs text-muted-foreground">{school.students} students</p>
                    </div>
                  ))}
                </div>

                {/* Full Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Rank</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead className="text-right">Students</TableHead>
                      <TableHead className="text-right">Avg Score</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nationalLeaderboard.map((school) => (
                      <TableRow key={school.rank}>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {getRankIcon(school.rank)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">{school.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{school.name}</p>
                              <Badge variant="secondary" className="text-xs">{school.type}</Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {school.region}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{school.students.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${school.avgScore >= 85 ? "text-emerald-600" : school.avgScore >= 75 ? "text-amber-600" : ""}`}>
                            {school.avgScore}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {getChangeIcon(school.change)}
                            {school.change !== 0 && (
                              <span className={`text-xs ${school.change > 0 ? "text-emerald-500" : "text-red-500"}`}>
                                {Math.abs(school.change)}
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

            {/* Regional Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Regional Distribution</CardTitle>
                <CardDescription>Schools by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={regionalDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="schools"
                        nameKey="region"
                      >
                        {regionalDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {regionalDistribution.slice(0, 5).map((region, idx) => (
                    <div key={region.region} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                        <span>{region.region}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{region.schools} schools</span>
                        <span className="font-medium">{region.avgScore}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Regional Rankings */}
        <TabsContent value="regional" className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(regionalLeaderboard).map((region) => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{selectedRegion} Rankings</CardTitle>
                <CardDescription>Top schools in the region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {regionalLeaderboard[selectedRegion as keyof typeof regionalLeaderboard]?.map((school) => (
                    <div
                      key={school.rank}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        school.rank <= 3 ? "bg-primary/5" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="w-8 flex justify-center">
                        {getRankIcon(school.rank)}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{school.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{school.name}</p>
                        <p className="text-xs text-muted-foreground">{school.students} students</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{school.avgScore}%</p>
                        <div className="flex items-center justify-end gap-1">
                          {getChangeIcon(school.change)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Comparison</CardTitle>
                <CardDescription>Average scores by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionalDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" domain={[0, 100]} className="text-xs" />
                      <YAxis dataKey="region" type="category" width={100} className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="avgScore" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Avg Score (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subject Rankings */}
        <TabsContent value="subjects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Schools by Subject</CardTitle>
              <CardDescription>Highest performing schools in each BECE subject</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Top School</TableHead>
                    <TableHead className="text-right">Top Score</TableHead>
                    <TableHead className="text-right">National Avg</TableHead>
                    <TableHead className="text-right">Difference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjectLeaderboard.map((subject) => (
                    <TableRow key={subject.subject}>
                      <TableCell className="font-medium">{subject.subject}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          {subject.topSchool}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-emerald-600">{subject.avgScore}%</span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{subject.nationalAvg}%</TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-emerald-500/10 text-emerald-600">
                          +{(subject.avgScore - subject.nationalAvg).toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Most Improved */}
        <TabsContent value="improvement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Most Improved Schools</CardTitle>
              <CardDescription>Schools showing the greatest score improvement this term</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {improvementLeaders.map((school) => (
                  <div
                    key={school.rank}
                    className="flex items-center gap-4 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
                  >
                    <div className="w-8 flex justify-center">
                      {getRankIcon(school.rank)}
                    </div>
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-emerald-500/10 text-emerald-600">
                        {school.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{school.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {school.region}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-emerald-600">
                        <TrendingUp className="h-5 w-5" />
                        <span className="text-xl font-bold">+{school.improvement}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Current avg: {school.currentAvg}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
