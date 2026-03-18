"use client"

import { useState } from "react"
import {
  Download,
  FileText,
  Calendar,
  TrendingUp,
  Users,
  School,
  BookOpen,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from "recharts"

const monthlyData = [
  { month: "Jan", students: 8500, exams: 45000, revenue: 42500 },
  { month: "Feb", students: 9200, exams: 52000, revenue: 46000 },
  { month: "Mar", students: 9800, exams: 58000, revenue: 49000 },
  { month: "Apr", students: 10200, exams: 48000, revenue: 51000 },
  { month: "May", students: 10800, exams: 42000, revenue: 54000 },
  { month: "Jun", students: 11200, exams: 38000, revenue: 56000 },
  { month: "Jul", students: 10500, exams: 25000, revenue: 52500 },
  { month: "Aug", students: 10800, exams: 28000, revenue: 54000 },
  { month: "Sep", students: 12000, exams: 65000, revenue: 60000 },
  { month: "Oct", students: 12400, exams: 72000, revenue: 62000 },
  { month: "Nov", students: 12700, exams: 78000, revenue: 63500 },
  { month: "Dec", students: 12847, exams: 82000, revenue: 64235 },
]

const subjectPerformance = [
  { subject: "Mathematics", avgScore: 68, examsTaken: 18500 },
  { subject: "English", avgScore: 72, examsTaken: 17800 },
  { subject: "Science", avgScore: 65, examsTaken: 16200 },
  { subject: "Social Studies", avgScore: 74, examsTaken: 15900 },
  { subject: "ICT", avgScore: 78, examsTaken: 12400 },
  { subject: "RME", avgScore: 76, examsTaken: 11800 },
  { subject: "French", avgScore: 62, examsTaken: 8500 },
  { subject: "Ghanaian Lang", avgScore: 71, examsTaken: 7200 },
]

const regionDistribution = [
  { name: "Greater Accra", value: 35, color: "#0D9488" },
  { name: "Ashanti", value: 25, color: "#14B8A6" },
  { name: "Central", value: 12, color: "#2DD4BF" },
  { name: "Western", value: 10, color: "#5EEAD4" },
  { name: "Eastern", value: 8, color: "#99F6E4" },
  { name: "Others", value: 10, color: "#CCFBF1" },
]

const planDistribution = [
  { name: "Starter", value: 45, color: "#94A3B8" },
  { name: "Professional", value: 68, color: "#0D9488" },
  { name: "Enterprise", value: 14, color: "#F59E0B" },
]

const reportTemplates = [
  {
    id: 1,
    name: "Monthly Performance Report",
    description: "Comprehensive overview of platform performance",
    lastGenerated: "Dec 1, 2025",
    format: "PDF",
    icon: FileText,
  },
  {
    id: 2,
    name: "Revenue Analysis",
    description: "Detailed breakdown of revenue by plan and region",
    lastGenerated: "Dec 1, 2025",
    format: "Excel",
    icon: TrendingUp,
  },
  {
    id: 3,
    name: "Student Engagement Report",
    description: "Analysis of student activity and exam completion",
    lastGenerated: "Nov 28, 2025",
    format: "PDF",
    icon: Users,
  },
  {
    id: 4,
    name: "School Performance Ranking",
    description: "Comparative analysis of school performance",
    lastGenerated: "Nov 25, 2025",
    format: "PDF",
    icon: School,
  },
  {
    id: 5,
    name: "Subject Analysis Report",
    description: "Performance breakdown by subject and topic",
    lastGenerated: "Nov 20, 2025",
    format: "Excel",
    icon: BookOpen,
  },
]

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("year")
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Platform-wide analytics and downloadable reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="downloads">Report Downloads</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Growth Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Student Growth
                </CardTitle>
                <CardDescription>Total registered students over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="students"
                        stroke="#0D9488"
                        fill="url(#studentGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Revenue
                </CardTitle>
                <CardDescription>Revenue in GHS by month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`GHS ${value.toLocaleString()}`, "Revenue"]}
                      />
                      <Bar dataKey="revenue" fill="#0D9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribution Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Schools by Region
                </CardTitle>
                <CardDescription>Geographic distribution of schools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={regionDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {regionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Subscription Distribution
                </CardTitle>
                <CardDescription>Schools by subscription plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={planDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={false}
                      >
                        {planDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance Analysis</CardTitle>
              <CardDescription>
                Average scores and exam completion by subject
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" domain={[0, 100]} stroke="#6B7280" fontSize={12} />
                    <YAxis type="category" dataKey="subject" stroke="#6B7280" fontSize={12} width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="avgScore" fill="#0D9488" radius={[0, 4, 4, 0]} name="Avg Score %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {subjectPerformance.slice(0, 4).map((subject) => (
              <Card key={subject.subject}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{subject.subject}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subject.avgScore}%</div>
                  <p className="text-xs text-muted-foreground">
                    {subject.examsTaken.toLocaleString()} exams taken
                  </p>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${subject.avgScore}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="downloads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>
                Generate and download pre-configured reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportTemplates.map((report) => {
                  const Icon = report.icon
                  return (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {report.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant="outline">{report.format}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last: {report.lastGenerated}
                          </p>
                        </div>
                        <Button>
                          <Download className="mr-2 h-4 w-4" />
                          Generate
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>
                Create a custom report with specific metrics and date ranges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Performance Report</SelectItem>
                    <SelectItem value="revenue">Revenue Report</SelectItem>
                    <SelectItem value="engagement">Engagement Report</SelectItem>
                    <SelectItem value="schools">Schools Report</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Export format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end mt-4">
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Custom Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
