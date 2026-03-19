"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Search,
  Filter,
  Calendar,
  BarChart3,
  GraduationCap,
  BookOpen,
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
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts"

// National school leaderboard with more data
const nationalSchoolLeaderboard = [
  { rank: 1, name: "Mfantsipim School", region: "Central", type: "Public", students: 520, avgScore: 89.2, examsCompleted: 12480, passRate: 94.5, change: 0, trend: [85, 86, 87, 88, 89.2] },
  { rank: 2, name: "Wesley Girls' High School", region: "Central", type: "Public", students: 485, avgScore: 88.7, examsCompleted: 11640, passRate: 93.8, change: 1, trend: [84, 85, 86, 87.5, 88.7] },
  { rank: 3, name: "Prempeh College", region: "Ashanti", type: "Public", students: 510, avgScore: 87.9, examsCompleted: 12240, passRate: 92.3, change: -1, trend: [86, 87, 88, 88.5, 87.9] },
  { rank: 4, name: "Holy Child School", region: "Central", type: "Public", students: 440, avgScore: 87.2, examsCompleted: 10560, passRate: 91.7, change: 2, trend: [82, 84, 85, 86, 87.2] },
  { rank: 5, name: "Achimota School", region: "Greater Accra", type: "Public", students: 456, avgScore: 86.8, examsCompleted: 10944, passRate: 90.5, change: 0, trend: [85, 85.5, 86, 86.5, 86.8] },
  { rank: 6, name: "St. Augustine's College", region: "Central", type: "Public", students: 495, avgScore: 86.1, examsCompleted: 11880, passRate: 89.8, change: -2, trend: [87, 87.5, 87, 86.5, 86.1] },
  { rank: 7, name: "Opoku Ware School", region: "Ashanti", type: "Public", students: 480, avgScore: 85.5, examsCompleted: 11520, passRate: 88.9, change: 1, trend: [83, 84, 84.5, 85, 85.5] },
  { rank: 8, name: "Aburi Girls' SHS", region: "Eastern", type: "Public", students: 410, avgScore: 84.9, examsCompleted: 9840, passRate: 87.6, change: 3, trend: [80, 82, 83, 84, 84.9] },
  { rank: 9, name: "Ghana International School", region: "Greater Accra", type: "Private", students: 220, avgScore: 84.5, examsCompleted: 5280, passRate: 92.1, change: -1, trend: [83, 83.5, 84, 84.2, 84.5] },
  { rank: 10, name: "Presbyterian Boys' SHS", region: "Eastern", type: "Public", students: 505, avgScore: 84.2, examsCompleted: 12120, passRate: 86.5, change: 0, trend: [82, 83, 83.5, 84, 84.2] },
]

// National student leaderboard
const nationalStudentLeaderboard = [
  { rank: 1, name: "Bright Owusu", school: "Mfantsipim School", region: "Central", type: "School", score: 96.8, exams: 24, subjects: 8 },
  { rank: 2, name: "Gloria Appiah", school: "Wesley Girls' High School", region: "Central", type: "School", score: 95.9, exams: 24, subjects: 8 },
  { rank: 3, name: "Samuel Asare", school: "Prempeh College", region: "Ashanti", type: "School", score: 95.2, exams: 23, subjects: 8 },
  { rank: 4, name: "Felicia Mensah", school: "Holy Child School", region: "Central", type: "School", score: 94.7, exams: 24, subjects: 8 },
  { rank: 5, name: "David Antwi", school: "Achimota School", region: "Greater Accra", type: "School", score: 94.1, exams: 24, subjects: 8 },
  { rank: 6, name: "Akosua Boateng", school: "Independent", region: "Ashanti", type: "Independent", score: 93.8, exams: 22, subjects: 6 },
  { rank: 7, name: "Kofi Darko", school: "Opoku Ware School", region: "Ashanti", type: "School", score: 93.5, exams: 24, subjects: 8 },
  { rank: 8, name: "Ama Sarpong", school: "Independent", region: "Greater Accra", type: "Independent", score: 93.2, exams: 20, subjects: 5 },
  { rank: 9, name: "Emmanuel Tetteh", school: "St. Augustine's College", region: "Central", type: "School", score: 92.9, exams: 24, subjects: 8 },
  { rank: 10, name: "Grace Asiedu", school: "Aburi Girls' SHS", region: "Eastern", type: "School", score: 92.6, exams: 23, subjects: 8 },
]

// Regional data
const regionData = [
  { region: "Greater Accra", schools: 32, students: 12450, avgScore: 78.5, passRate: 85.2, change: 2.3 },
  { region: "Ashanti", schools: 28, students: 10820, avgScore: 76.8, passRate: 83.5, change: 1.8 },
  { region: "Central", schools: 18, students: 8540, avgScore: 82.3, passRate: 89.1, change: 3.1 },
  { region: "Eastern", schools: 15, students: 6230, avgScore: 75.2, passRate: 81.4, change: 1.2 },
  { region: "Western", schools: 12, students: 4560, avgScore: 73.8, passRate: 79.8, change: 0.8 },
  { region: "Northern", schools: 10, students: 3210, avgScore: 68.5, passRate: 74.2, change: 4.5 },
  { region: "Volta", schools: 8, students: 2890, avgScore: 71.2, passRate: 77.3, change: 2.1 },
  { region: "Upper East", schools: 4, students: 1230, avgScore: 66.8, passRate: 72.1, change: 5.2 },
]

// Subject performance data
const subjectPerformance = [
  { subject: "Mathematics", avgScore: 68.5, passRate: 72.3, topSchool: "Mfantsipim School", topScore: 92.1 },
  { subject: "English Language", avgScore: 72.8, passRate: 78.5, topSchool: "Wesley Girls' High School", topScore: 91.3 },
  { subject: "Integrated Science", avgScore: 65.2, passRate: 69.8, topSchool: "Prempeh College", topScore: 90.8 },
  { subject: "Social Studies", avgScore: 70.1, passRate: 75.4, topSchool: "Holy Child School", topScore: 89.5 },
  { subject: "ICT", avgScore: 74.5, passRate: 80.2, topSchool: "Ghana International School", topScore: 93.2 },
  { subject: "French", avgScore: 62.3, passRate: 65.8, topSchool: "Wesley Girls' High School", topScore: 88.7 },
  { subject: "RME", avgScore: 71.8, passRate: 77.2, topSchool: "Holy Child School", topScore: 90.2 },
  { subject: "Ghanaian Language", avgScore: 69.4, passRate: 74.5, topSchool: "Prempeh College", topScore: 87.9 },
]

// Trend data for charts
const trendData = [
  { month: "Sep", avgScore: 68.5, passRate: 72, schools: 95 },
  { month: "Oct", avgScore: 70.2, passRate: 74, schools: 102 },
  { month: "Nov", avgScore: 71.8, passRate: 76, schools: 110 },
  { month: "Dec", avgScore: 72.5, passRate: 77, schools: 115 },
  { month: "Jan", avgScore: 74.1, passRate: 79, schools: 120 },
  { month: "Feb", avgScore: 75.8, passRate: 81, schools: 125 },
  { month: "Mar", avgScore: 76.8, passRate: 82, schools: 127 },
]

// School type distribution
const schoolTypeData = [
  { name: "Public", value: 98, avgScore: 74.5 },
  { name: "Private", value: 29, avgScore: 78.2 },
]

// Most improved schools
const mostImprovedSchools = [
  { rank: 1, name: "Tamale SHS", region: "Northern", improvement: 12.5, currentAvg: 72.8, previousAvg: 60.3 },
  { rank: 2, name: "Bolgatanga Girls' SHS", region: "Upper East", improvement: 10.8, currentAvg: 69.5, previousAvg: 58.7 },
  { rank: 3, name: "Wa SHS", region: "Upper West", improvement: 9.2, currentAvg: 67.3, previousAvg: 58.1 },
  { rank: 4, name: "Ho Technical Institute", region: "Volta", improvement: 8.7, currentAvg: 71.2, previousAvg: 62.5 },
  { rank: 5, name: "Sunyani SHS", region: "Bono", improvement: 7.9, currentAvg: 74.5, previousAvg: 66.6 },
]

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function SuperAdminLeaderboardPage() {
  const [timeframe, setTimeframe] = useState("month")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [studentType, setStudentType] = useState("all")

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

  const filteredSchools = nationalSchoolLeaderboard.filter(school => {
    const matchesRegion = selectedRegion === "all" || school.region === selectedRegion
    const matchesType = selectedType === "all" || school.type === selectedType
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRegion && matchesType && matchesSearch
  })

  const filteredStudents = nationalStudentLeaderboard.filter(student => {
    const matchesRegion = selectedRegion === "all" || student.region === selectedRegion
    const matchesType = studentType === "all" || student.type === studentType
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.school.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRegion && matchesType && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">National Leaderboard & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive performance analytics across Ghana</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="term">This Term</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
                <p className="text-sm text-muted-foreground">School Students</p>
                <p className="text-2xl font-bold">42,350</p>
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +1,120 this month
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
                <p className="text-sm text-muted-foreground">Independent Students</p>
                <p className="text-2xl font-bold">3,273</p>
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +125 this month
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">National Average</p>
                <p className="text-2xl font-bold">76.8%</p>
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
                <p className="text-sm text-muted-foreground">Pass Rate</p>
                <p className="text-2xl font-bold">82.5%</p>
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +1.8% from last month
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schools" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="schools">School Rankings</TabsTrigger>
          <TabsTrigger value="students">Student Rankings</TabsTrigger>
          <TabsTrigger value="regions">Regional Analysis</TabsTrigger>
          <TabsTrigger value="subjects">Subject Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
          <TabsTrigger value="improved">Most Improved</TabsTrigger>
        </TabsList>

        {/* School Rankings */}
        <TabsContent value="schools" className="space-y-6">
          {/* Filters */}
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
                    <SelectItem value="Greater Accra">Greater Accra</SelectItem>
                    <SelectItem value="Ashanti">Ashanti</SelectItem>
                    <SelectItem value="Central">Central</SelectItem>
                    <SelectItem value="Eastern">Eastern</SelectItem>
                    <SelectItem value="Western">Western</SelectItem>
                    <SelectItem value="Northern">Northern</SelectItem>
                    <SelectItem value="Volta">Volta</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Public">Public</SelectItem>
                    <SelectItem value="Private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Top 3 Schools */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Performing Schools</CardTitle>
                <CardDescription>Based on average student scores and pass rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3 mb-6">
                  {filteredSchools.slice(0, 3).map((school, idx) => (
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
                      <div className="flex items-center justify-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{school.students} students</span>
                        <span>|</span>
                        <span>{school.passRate}% pass</span>
                      </div>
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
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Students</TableHead>
                      <TableHead className="text-right">Avg Score</TableHead>
                      <TableHead className="text-right">Pass Rate</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchools.map((school) => (
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
                          <Badge variant={school.type === "Public" ? "secondary" : "outline"}>
                            {school.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{school.students.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${school.avgScore >= 85 ? "text-emerald-600" : school.avgScore >= 75 ? "text-amber-600" : ""}`}>
                            {school.avgScore}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{school.passRate}%</TableCell>
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

            {/* School Type Distribution */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">School Distribution</CardTitle>
                  <CardDescription>Public vs Private schools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={schoolTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {schoolTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {schoolTypeData.map((type, idx) => (
                      <div key={type.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                          <span className="text-sm">{type.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{type.value}</span>
                          <span className="text-xs text-muted-foreground ml-2">({type.avgScore}% avg)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Regional Leaders</CardTitle>
                  <CardDescription>Top school per region</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {regionData.slice(0, 5).map((region, idx) => (
                    <div key={region.region} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{region.region}</p>
                        <p className="text-xs text-muted-foreground">{region.schools} schools</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{region.avgScore}%</p>
                        <p className={`text-xs ${region.change > 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {region.change > 0 ? "+" : ""}{region.change}%
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Student Rankings */}
        <TabsContent value="students" className="space-y-6">
          {/* Filters */}
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
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={studentType} onValueChange={setStudentType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Students" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="School">School Students</SelectItem>
                    <SelectItem value="Independent">Independent Students</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="Greater Accra">Greater Accra</SelectItem>
                    <SelectItem value="Ashanti">Ashanti</SelectItem>
                    <SelectItem value="Central">Central</SelectItem>
                    <SelectItem value="Eastern">Eastern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Students Nationally</CardTitle>
              <CardDescription>School and independent students ranked by performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>School/Status</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Exams</TableHead>
                    <TableHead className="text-right">Subjects</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
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
                        <span className={student.type === "Independent" ? "text-purple-600" : ""}>
                          {student.school}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {student.region}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.type === "School" ? "secondary" : "default"} className={student.type === "Independent" ? "bg-purple-500/10 text-purple-600" : ""}>
                          {student.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{student.exams}</TableCell>
                      <TableCell className="text-right">{student.subjects}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-primary">{student.score}%</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Analysis */}
        <TabsContent value="regions" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance</CardTitle>
                <CardDescription>Average scores and pass rates by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionData} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="region" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="avgScore" name="Avg Score" fill="hsl(var(--primary))" />
                      <Bar dataKey="passRate" name="Pass Rate" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
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
                      <TableHead className="text-right">Students</TableHead>
                      <TableHead className="text-right">Avg Score</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regionData.map((region) => (
                      <TableRow key={region.region}>
                        <TableCell className="font-medium">{region.region}</TableCell>
                        <TableCell className="text-right">{region.schools}</TableCell>
                        <TableCell className="text-right">{region.students.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${region.avgScore >= 75 ? "text-emerald-600" : region.avgScore >= 70 ? "text-amber-600" : ""}`}>
                            {region.avgScore}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`text-sm ${region.change > 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {region.change > 0 ? "+" : ""}{region.change}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subject Performance */}
        <TabsContent value="subjects" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {subjectPerformance.map((subject) => (
              <Card key={subject.subject}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    {subject.subject}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">National Average</span>
                    <span className="font-bold">{subject.avgScore}%</span>
                  </div>
                  <Progress value={subject.avgScore} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pass Rate</span>
                    <span className="text-emerald-600">{subject.passRate}%</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Top School</p>
                    <p className="text-sm font-medium">{subject.topSchool}</p>
                    <p className="text-xs text-primary font-bold">{subject.topScore}%</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trends & Analytics */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Average scores and pass rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[60, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="avgScore" name="Avg Score" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line type="monotone" dataKey="passRate" name="Pass Rate" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>School Growth</CardTitle>
                <CardDescription>Number of participating schools over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="schools" name="Schools" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Most Improved */}
        <TabsContent value="improved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Most Improved Schools</CardTitle>
              <CardDescription>Schools showing the greatest improvement this term</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mostImprovedSchools.map((school) => (
                  <div key={school.rank} className="flex items-center gap-4 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">#{school.rank}</span>
                        <span className="font-medium">{school.name}</span>
                        <Badge variant="secondary">{school.region}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>Previous: {school.previousAvg}%</span>
                        <span>Current: {school.currentAvg}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">+{school.improvement}%</p>
                      <p className="text-xs text-muted-foreground">improvement</p>
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
