import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export type RegionRow = { name: string; count: number }
export type PlanRow = { name: string; count: number }
export type SubjectPerformanceRow = { subject: string; avgScore: number; examsTaken: number }

export type ReportsData = {
  regionDistribution: RegionRow[]
  planDistribution: PlanRow[]
  subjectPerformance: SubjectPerformanceRow[]
}

// The exact same 3 real datasets and aggregation logic super-admin/reports's
// page.tsx has always computed - extracted here so the weekly cron job (see
// app/api/cron/weekly-reports/route.ts) can reuse the real business logic
// instead of duplicating it. page.tsx now calls this too.
export async function getReportsData(): Promise<ReportsData> {
  const [schools, subscriptions, students, questions, subjects] = await Promise.all([
    prisma.school.findMany({ select: { region: true } }),
    prisma.subscription.findMany({ where: { schoolId: { not: null } }, include: { plan: true } }),
    prisma.student.findMany({ include: { examAttempts: true } }),
    prisma.question.findMany({ select: { id: true, subjectId: true, correctAnswerIndex: true } }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ])

  const regionCounts = new Map<string, number>()
  for (const s of schools) {
    regionCounts.set(s.region, (regionCounts.get(s.region) ?? 0) + 1)
  }
  const regionDistribution = Array.from(regionCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const planCounts = new Map<string, number>()
  for (const sub of subscriptions) {
    planCounts.set(sub.plan.name, (planCounts.get(sub.plan.name) ?? 0) + 1)
  }
  const planDistribution = Array.from(planCounts.entries()).map(([name, count]) => ({ name, count }))

  const questionMap = new Map(questions.map((q) => [q.id, q]))
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]))
  const subjectAgg = new Map<string, { correct: number; total: number; exams: number }>()
  for (const student of students) {
    for (const attempt of student.examAttempts) {
      if (!attempt.submittedAt) continue
      const answers = attempt.answers as Record<string, number>
      const touchedSubjects = new Set<string>()
      for (const [questionId, selected] of Object.entries(answers)) {
        const q = questionMap.get(questionId)
        if (!q) continue
        const agg = subjectAgg.get(q.subjectId) ?? { correct: 0, total: 0, exams: 0 }
        agg.total += 1
        if (selected === q.correctAnswerIndex) agg.correct += 1
        touchedSubjects.add(q.subjectId)
        subjectAgg.set(q.subjectId, agg)
      }
      for (const subjectId of touchedSubjects) {
        subjectAgg.get(subjectId)!.exams += 1
      }
    }
  }
  const subjectPerformance = Array.from(subjectAgg.entries())
    .map(([subjectId, agg]) => ({
      subject: subjectMap.get(subjectId) ?? "Unknown",
      avgScore: Math.round((agg.correct / agg.total) * 100),
      examsTaken: agg.exams,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)

  return { regionDistribution, planDistribution, subjectPerformance }
}

function toRows(data: ReportsData) {
  return {
    region: [["Region", "Schools"], ...data.regionDistribution.map((r) => [r.name, r.count])] as (string | number)[][],
    plan: [["Plan", "Schools"], ...data.planDistribution.map((p) => [p.name, p.count])] as (string | number)[][],
    subject: [
      ["Subject", "Avg Score %", "Exams Taken"],
      ...data.subjectPerformance.map((s) => [s.subject, s.avgScore, s.examsTaken]),
    ] as (string | number)[][],
  }
}

// Server-side (Node, not browser) equivalent of reports-view.tsx's
// downloadExcel - same XLSX APIs, but returns a Buffer instead of triggering
// a browser download, since this runs in a cron route with no browser.
export function buildReportsWorkbookBuffer(data: ReportsData): Buffer {
  const rows = toRows(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows.region), "Schools by Region")
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows.plan), "Subscription Distribution")
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows.subject), "Subject Performance")
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer
}

// Server-side equivalent of reports-view.tsx's downloadPdf - jsPDF works
// identically in Node (confirmed when PDF export was first verified, see
// docs/build-log.md), just returning a Buffer via .output("arraybuffer")
// instead of calling .save() (a browser-only download trigger).
export function buildReportsPdfBuffer(data: ReportsData): Buffer {
  const rows = toRows(data)
  const doc = new jsPDF()
  let y = 16

  const section = (title: string, tableRows: (string | number)[][]) => {
    doc.setFontSize(14)
    doc.text(title, 14, y)
    y += 6
    autoTable(doc, {
      head: [tableRows[0]],
      body: tableRows.slice(1),
      startY: y,
      headStyles: { fillColor: [13, 148, 136] },
    })
    // @ts-expect-error - jspdf-autotable augments doc with lastAutoTable at runtime
    y = doc.lastAutoTable.finalY + 14
  }

  doc.setFontSize(18)
  doc.text("TYP Platform Report", 14, y)
  y += 6
  doc.setFontSize(9)
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, y)
  y += 10

  section("Schools by Region", rows.region)
  section("Subscription Distribution", rows.plan)
  section("Subject Performance", rows.subject)

  return Buffer.from(doc.output("arraybuffer"))
}
