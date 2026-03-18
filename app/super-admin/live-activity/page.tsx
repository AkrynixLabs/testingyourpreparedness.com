"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatCard } from "@/components/stat-card"
import {
  Activity,
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  MonitorPlay,
  Zap,
  Globe,
  RefreshCw,
  Circle,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

// Simulated live data
const initialActiveUsers = 2847
const initialActiveExams = 342

const realtimeData = [
  { time: "10:00", users: 1850, exams: 220 },
  { time: "10:15", users: 2100, exams: 258 },
  { time: "10:30", users: 2350, exams: 290 },
  { time: "10:45", users: 2580, exams: 315 },
  { time: "11:00", users: 2720, exams: 328 },
  { time: "11:15", users: 2847, exams: 342 },
]

const activeSchools = [
  { name: "Presec Legon", activeStudents: 156, examsInProgress: 42, region: "Greater Accra" },
  { name: "Wesley Girls", activeStudents: 134, examsInProgress: 38, region: "Central" },
  { name: "Achimota School", activeStudents: 128, examsInProgress: 35, region: "Greater Accra" },
  { name: "Holy Child", activeStudents: 112, examsInProgress: 28, region: "Central" },
  { name: "Mfantsipim", activeStudents: 98, examsInProgress: 25, region: "Central" },
  { name: "Adisadel College", activeStudents: 94, examsInProgress: 24, region: "Central" },
  { name: "Opoku Ware", activeStudents: 88, examsInProgress: 22, region: "Ashanti" },
  { name: "St. Peter's", activeStudents: 82, examsInProgress: 20, region: "Eastern" },
]

const examsBySubject = [
  { subject: "Mathematics", active: 98, color: "oklch(0.55 0.15 170)" },
  { subject: "English", active: 85, color: "oklch(0.65 0.15 50)" },
  { subject: "Science", active: 72, color: "oklch(0.55 0.15 280)" },
  { subject: "Social Studies", active: 52, color: "oklch(0.65 0.15 220)" },
  { subject: "RME", active: 35, color: "oklch(0.55 0.15 30)" },
]

const recentEvents = [
  { id: 1, type: "exam_started", student: "Kwame A.", school: "Presec Legon", subject: "Mathematics", time: "Just now" },
  { id: 2, type: "exam_completed", student: "Abena D.", school: "Wesley Girls", subject: "English", score: 85, time: "30s ago" },
  { id: 3, type: "login", student: "Kofi O.", school: "Achimota School", time: "1m ago" },
  { id: 4, type: "exam_started", student: "Esi A.", school: "Holy Child", subject: "Science", time: "1m ago" },
  { id: 5, type: "exam_completed", student: "Yaw B.", school: "Mfantsipim", subject: "Mathematics", score: 72, time: "2m ago" },
  { id: 6, type: "registration", student: "Akua M.", school: "St. Augustine's", time: "3m ago" },
  { id: 7, type: "exam_started", student: "Kweku F.", school: "Opoku Ware", subject: "Social Studies", time: "3m ago" },
  { id: 8, type: "exam_completed", student: "Adwoa S.", school: "Adisadel", subject: "RME", score: 91, time: "4m ago" },
]

const regionActivity = [
  { region: "Greater Accra", activeUsers: 1245, percentage: 43.7 },
  { region: "Ashanti", activeUsers: 542, percentage: 19.0 },
  { region: "Central", activeUsers: 485, percentage: 17.0 },
  { region: "Eastern", activeUsers: 245, percentage: 8.6 },
  { region: "Western", activeUsers: 180, percentage: 6.3 },
  { region: "Others", activeUsers: 150, percentage: 5.3 },
]

export default function LiveActivityPage() {
  const [activeUsers, setActiveUsers] = useState(initialActiveUsers)
  const [activeExams, setActiveExams] = useState(initialActiveExams)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Simulate live updates
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 20) - 8)
      setActiveExams(prev => Math.max(0, prev + Math.floor(Math.random() * 10) - 4))
      setLastUpdated(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Live Activity</h1>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 animate-pulse">
              <Circle className="h-2 w-2 mr-1 fill-current" />
              Live
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Real-time platform activity and monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users Now</p>
                <p className="text-3xl font-bold">{activeUsers.toLocaleString()}</p>
                <p className="text-xs text-emerald-600 flex items-center mt-1">
                  <Zap className="h-3 w-3 mr-1" />
                  Live count
                </p>
              </div>
              <Users className="h-10 w-10 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Exams In Progress</p>
                <p className="text-3xl font-bold">{activeExams}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <MonitorPlay className="h-3 w-3 mr-1" />
                  Currently active
                </p>
              </div>
              <BookOpen className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Schools</p>
                <p className="text-3xl font-bold">68</p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <Globe className="h-3 w-3 mr-1" />
                  Across 10 regions
                </p>
              </div>
              <Activity className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Session Time</p>
                <p className="text-3xl font-bold">38m</p>
                <p className="text-xs text-amber-600 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Today's average
                </p>
              </div>
              <Clock className="h-10 w-10 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity chart */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Real-time Activity</CardTitle>
            <CardDescription>Users and exams over the last hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={realtimeData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.55 0.15 170)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.55 0.15 170)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExams" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.65 0.15 220)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.65 0.15 220)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="oklch(0.55 0.15 170)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    name="Active Users"
                  />
                  <Area
                    type="monotone"
                    dataKey="exams"
                    stroke="oklch(0.65 0.15 220)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExams)"
                    name="Active Exams"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Live feed */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Live Feed
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </CardTitle>
            <CardDescription>Recent platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[320px] overflow-y-auto">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`h-2 w-2 mt-2 rounded-full flex-shrink-0 ${
                    event.type === "exam_started" ? "bg-blue-500" :
                    event.type === "exam_completed" ? "bg-emerald-500" :
                    event.type === "login" ? "bg-purple-500" :
                    "bg-amber-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {event.type === "exam_started" && `${event.student} started ${event.subject} exam`}
                      {event.type === "exam_completed" && `${event.student} completed ${event.subject} (${event.score}%)`}
                      {event.type === "login" && `${event.student} logged in`}
                      {event.type === "registration" && `${event.student} registered`}
                    </p>
                    <p className="text-xs text-muted-foreground">{event.school} - {event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active schools and exams by subject */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active schools */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Most Active Schools</CardTitle>
            <CardDescription>Schools with most active students right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSchools.map((school, index) => (
                <div key={school.name} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{school.name}</p>
                    <p className="text-xs text-muted-foreground">{school.region}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">{school.activeStudents}</p>
                    <p className="text-xs text-muted-foreground">{school.examsInProgress} exams</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Exams by subject */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Active Exams by Subject</CardTitle>
            <CardDescription>Distribution of ongoing exams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={examsBySubject} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis dataKey="subject" type="category" stroke="var(--muted-foreground)" fontSize={12} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="active" fill="oklch(0.55 0.15 170)" radius={[0, 4, 4, 0]} name="Active Exams" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional activity */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Activity by Region</CardTitle>
          <CardDescription>Geographic distribution of active users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {regionActivity.map((region) => (
              <div key={region.region} className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{region.region}</span>
                  <Badge variant="secondary">{region.percentage}%</Badge>
                </div>
                <p className="text-2xl font-bold text-primary">{region.activeUsers.toLocaleString()}</p>
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${region.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
