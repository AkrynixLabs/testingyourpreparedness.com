"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/stat-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  FileQuestion,
  School,
  Calendar,
  Download,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const platformGrowth = [
  { month: "Sep", students: 8500, schools: 42, assessments: 320 },
  { month: "Oct", students: 9200, schools: 48, assessments: 410 },
  { month: "Nov", students: 10100, schools: 55, assessments: 520 },
  { month: "Dec", students: 10800, schools: 58, assessments: 480 },
  { month: "Jan", students: 11500, schools: 62, assessments: 590 },
  { month: "Feb", students: 12200, schools: 65, assessments: 680 },
  { month: "Mar", students: 12847, schools: 68, assessments: 750 },
]

const subjectPerformance = [
  { subject: "Mathematics", avgScore: 72, attempts: 45200 },
  { subject: "English", avgScore: 68, attempts: 42100 },
  { subject: "Science", avgScore: 74, attempts: 38900 },
  { subject: "Social Studies", avgScore: 65, attempts: 36500 },
  { subject: "ICT", avgScore: 78, attempts: 28700 },
  { subject: "RME", avgScore: 71, attempts: 25400 },
]

const regionDistribution = [
  { name: "Greater Accra", value: 35, color: "#0d9488" },
  { name: "Ashanti", value: 28, color: "#14b8a6" },
  { name: "Western", value: 15, color: "#2dd4bf" },
  { name: "Eastern", value: 12, color: "#5eead4" },
  { name: "Others", value: 10, color: "#99f6e4" },
]

const topSchools = [
  { name: "Mfantsipim School", region: "Central", students: 412, avgScore: 82 },
  { name: "Wesley Girls High", region: "Central", students: 189, avgScore: 79 },
  { name: "Prempeh College", region: "Ashanti", students: 385, avgScore: 77 },
  { name: "Accra Academy", region: "Greater Accra", students: 156, avgScore: 76 },
  { name: "Achimota School", region: "Greater Accra", students: 45, avgScore: 74 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into platform usage and performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30d">
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value="12,847"
          changeLabel="Across all schools"
          icon={Users}
          change={18}
        />
        <StatCard
          title="Active Schools"
          value="68"
          changeLabel="+6 this month"
          icon={School}
          change={9.7}
        />
        <StatCard
          title="Questions in Bank"
          value="15,420"
          changeLabel="Across 8 subjects"
          icon={FileQuestion}
          change={12}
        />
        <StatCard
          title="Exams Completed"
          value="89,234"
          changeLabel="This academic year"
          icon={BookOpen}
          change={24}
        />
      </div>

      {/* Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Platform Growth
          </CardTitle>
          <CardDescription>Student enrollment and activity trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={platformGrowth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="students"
                  name="Students"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="assessments"
                  name="Assessments"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Subject Performance & Regional Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Subject Performance
            </CardTitle>
            <CardDescription>Average scores by subject across all schools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" domain={[0, 100]} className="text-xs" />
                  <YAxis dataKey="subject" type="category" width={100} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}%`, "Avg Score"]}
                  />
                  <Bar
                    dataKey="avgScore"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              Regional Distribution
            </CardTitle>
            <CardDescription>Schools by region in Ghana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
                  >
                    {regionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Schools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-primary" />
            Top Performing Schools
          </CardTitle>
          <CardDescription>Schools with highest average student scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topSchools.map((school, index) => (
              <div
                key={school.name}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${
                      index === 0
                        ? "bg-amber-500"
                        : index === 1
                        ? "bg-slate-400"
                        : index === 2
                        ? "bg-amber-700"
                        : "bg-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{school.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {school.region} - {school.students} students
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{school.avgScore}%</p>
                    <p className="text-xs text-muted-foreground">avg score</p>
                  </div>
                  {index < 3 && (
                    <Badge className="bg-emerald-500/10 text-emerald-600">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      Top Performer
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Heatmap Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity Pattern</CardTitle>
          <CardDescription>Student exam activity throughout the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-center">
                <p className="text-sm font-medium mb-2">{day}</p>
                <div className="space-y-1">
                  {[...Array(5)].map((_, i) => {
                    const intensity = Math.random()
                    return (
                      <div
                        key={i}
                        className="h-8 rounded"
                        style={{
                          backgroundColor: `hsl(var(--primary) / ${0.1 + intensity * 0.9})`,
                        }}
                        title={`${Math.round(intensity * 1000)} activities`}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity) => (
                <div
                  key={opacity}
                  className="h-4 w-4 rounded"
                  style={{ backgroundColor: `hsl(var(--primary) / ${opacity})` }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
