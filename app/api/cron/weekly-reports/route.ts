import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getReportsData, buildReportsWorkbookBuffer, buildReportsPdfBuffer } from "@/lib/reports/generate"
import { sendEmail } from "@/lib/email/resend"
import { weeklyPlatformReportEmail } from "@/lib/email/templates"

// Background-jobs decision (2026-08-08, see docs/build-log.md): scheduled
// work uses Vercel Cron - a native platform feature (this app already
// deploys on Vercel), not a new vendor/dependency, so it doesn't trip this
// project's "no vendor lock-in without confirming" rule the way adding a
// message-queue service would have. vercel.json's crons entry points here.
//
// Vercel invokes cron routes with `Authorization: Bearer $CRON_SECRET` when
// CRON_SECRET is set on the project - verified below. If CRON_SECRET isn't
// set (e.g. this dev sandbox), the check is skipped so the route stays
// manually testable without provisioning a secret first.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const superAdmins = await prisma.user.findMany({
    where: { role: "super_admin" },
    select: { id: true, name: true, email: true },
  })

  if (superAdmins.length === 0) {
    return NextResponse.json({ sent: 0, note: "No super admins to send to." })
  }

  const data = await getReportsData()
  const workbook = buildReportsWorkbookBuffer(data)
  const pdf = buildReportsPdfBuffer(data)
  const weekOf = new Date().toISOString().slice(0, 10)
  const { subject, html } = weeklyPlatformReportEmail({ weekOf })

  const attachments = [
    { filename: `typ-platform-report-${weekOf}.xlsx`, content: workbook },
    { filename: `typ-platform-report-${weekOf}.pdf`, content: pdf },
  ]

  const results = await Promise.allSettled(
    superAdmins.map((admin) => sendEmail({ to: admin.email, subject, html, attachments }))
  )
  const sent = results.filter((r) => r.status === "fulfilled").length
  const failed = results.length - sent

  // Reuses AuditLog as the run-history record rather than a new
  // ScheduledJobRun entity - same "AuditLog as source of truth" pattern
  // already used for course/tutor moderation history. actorId is null since
  // this is a system-triggered run, not a specific user's action -
  // AuditLog.actorId is nullable for exactly this kind of case.
  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: "export",
      category: "data",
      description: `Weekly platform report emailed to ${sent}/${superAdmins.length} super admin(s)`,
      details: { type: "scheduled_report", sent, failed, weekOf },
    },
  })

  return NextResponse.json({ sent, failed, total: superAdmins.length })
}
