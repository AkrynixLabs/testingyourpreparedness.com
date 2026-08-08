"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RefreshCw, PieChart, Download, ChevronDown } from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from "recharts"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const REGION_COLORS = ["#0D9488", "#14B8A6", "#2DD4BF", "#5EEAD4", "#99F6E4", "#CCFBF1"]
const PLAN_COLORS = ["#94A3B8", "#0D9488", "#F59E0B"]

// Same client-side Blob/URL.createObjectURL pattern as school-admin/leaderboard's
// CSV export - no server route, no new dependency.
function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// `xlsx` (SheetJS) is already a dependency in this repo (content-admin's bulk
// question upload parser) - reused here for writing, not just parsing, so
// Excel export needed zero new dependencies. Same header-row + data-rows
// shape as downloadCsv, just written via SheetJS's own APIs.
function downloadExcel(filename: string, sheetName: string, rows: (string | number)[][]) {
  const worksheet = XLSX.utils.aoa_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, filename)
}

// jsPDF + jspdf-autotable - the standard lightweight combo for flat tabular
// data -> downloadable PDF, added specifically for this task (see
// docs/build-log.md). All 3 datasets are flat tables, so a table-only PDF is
// the honest shape - no charts/images rendered into the PDF.
function downloadPdf(filename: string, title: string, rows: (string | number)[][]) {
  const doc = new jsPDF()
  doc.setFontSize(14)
  doc.text(title, 14, 16)
  doc.setFontSize(9)
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 22)
  autoTable(doc, {
    head: [rows[0]],
    body: rows.slice(1),
    startY: 28,
    headStyles: { fillColor: [13, 148, 136] },
  })
  doc.save(filename)
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

function ExportMenu({ disabled, onExport }: { disabled: boolean; onExport: (format: "csv" | "excel" | "pdf") => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Download className="h-4 w-4 mr-2" />
          Export
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onExport("csv")}>CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("excel")}>Excel</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("pdf")}>PDF</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ReportsView({
  regionDistribution,
  planDistribution,
  subjectPerformance,
}: {
  regionDistribution: { name: string; count: number }[]
  planDistribution: { name: string; count: number }[]
  subjectPerformance: { subject: string; avgScore: number; examsTaken: number }[]
}) {
  const router = useRouter()

  const regionRows: (string | number)[][] = [
    ["Region", "Schools"],
    ...regionDistribution.map((r) => [r.name, r.count]),
  ]
  const planRows: (string | number)[][] = [
    ["Plan", "Schools"],
    ...planDistribution.map((p) => [p.name, p.count]),
  ]
  const subjectRows: (string | number)[][] = [
    ["Subject", "Avg Score %", "Exams Taken"],
    ...subjectPerformance.map((s) => [s.subject, s.avgScore, s.examsTaken]),
  ]

  const exportRegion = (format: "csv" | "excel" | "pdf") => {
    const stamp = todayStamp()
    if (format === "csv") downloadCsv(`schools-by-region-${stamp}.csv`, regionRows)
    else if (format === "excel") downloadExcel(`schools-by-region-${stamp}.xlsx`, "Schools by Region", regionRows)
    else downloadPdf(`schools-by-region-${stamp}.pdf`, "Schools by Region", regionRows)
  }

  const exportPlan = (format: "csv" | "excel" | "pdf") => {
    const stamp = todayStamp()
    if (format === "csv") downloadCsv(`subscription-distribution-${stamp}.csv`, planRows)
    else if (format === "excel") downloadExcel(`subscription-distribution-${stamp}.xlsx`, "Subscription Distribution", planRows)
    else downloadPdf(`subscription-distribution-${stamp}.pdf`, "Subscription Distribution", planRows)
  }

  const exportSubjectPerformance = (format: "csv" | "excel" | "pdf") => {
    const stamp = todayStamp()
    if (format === "csv") downloadCsv(`subject-performance-${stamp}.csv`, subjectRows)
    else if (format === "excel") downloadExcel(`subject-performance-${stamp}.xlsx`, "Subject Performance", subjectRows)
    else downloadPdf(`subject-performance-${stamp}.pdf`, "Subject Performance Analysis", subjectRows)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Real platform data - snapshot as of this page load</p>
        </div>
        <Button variant="outline" onClick={() => router.refresh()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Schools by Region
                  </CardTitle>
                  <CardDescription>Geographic distribution of schools</CardDescription>
                </div>
                <ExportMenu disabled={regionDistribution.length === 0} onExport={exportRegion} />
              </CardHeader>
              <CardContent>
                {regionDistribution.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-12 text-center">No schools yet.</p>
                ) : (
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
                          dataKey="count"
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={false}
                        >
                          {regionDistribution.map((entry, index) => (
                            <Cell key={entry.name} fill={REGION_COLORS[index % REGION_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Subscription Distribution
                  </CardTitle>
                  <CardDescription>Schools by subscription plan</CardDescription>
                </div>
                <ExportMenu disabled={planDistribution.length === 0} onExport={exportPlan} />
              </CardHeader>
              <CardContent>
                {planDistribution.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-12 text-center">No school subscriptions yet.</p>
                ) : (
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
                          dataKey="count"
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={false}
                        >
                          {planDistribution.map((entry, index) => (
                            <Cell key={entry.name} fill={PLAN_COLORS[index % PLAN_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle>Subject Performance Analysis</CardTitle>
                <CardDescription>Average correctness and exams taken by subject, from real exam attempts</CardDescription>
              </div>
              <ExportMenu disabled={subjectPerformance.length === 0} onExport={exportSubjectPerformance} />
            </CardHeader>
            <CardContent>
              {subjectPerformance.length === 0 ? (
                <p className="text-sm text-muted-foreground py-12 text-center">No answered questions yet.</p>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis type="number" domain={[0, 100]} stroke="#6B7280" fontSize={12} />
                      <YAxis type="category" dataKey="subject" stroke="#6B7280" fontSize={12} width={100} />
                      <Tooltip formatter={(value: number) => [`${value}%`, "Avg Score"]} />
                      <Bar dataKey="avgScore" fill="#0D9488" radius={[0, 4, 4, 0]} name="Avg Score %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {subjectPerformance.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {subjectPerformance.slice(0, 4).map((subject) => (
                <Card key={subject.subject}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{subject.subject}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{subject.avgScore}%</div>
                    <p className="text-xs text-muted-foreground">
                      {subject.examsTaken} exam{subject.examsTaken === 1 ? "" : "s"} taken
                    </p>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${subject.avgScore}%` }} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
