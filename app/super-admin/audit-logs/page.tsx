import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { StatCard } from "@/components/stat-card"
import { Shield, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import { AuditLogsTable } from "./audit-logs-table"

export default async function AuditLogsPage() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") notFound()

  // actor scoped with `select`, not `include: true` - only .name/.role are
  // rendered. Found by a security audit 2026-08-08 (see docs/build-log.md).
  const logs = await prisma.auditLog.findMany({
    include: { actor: { select: { id: true, name: true, role: true } } },
    orderBy: { timestamp: "desc" },
    take: 500,
  })

  const totalLogs = logs.length
  const successLogs = logs.filter((l) => l.status === "success").length
  const warningLogs = logs.filter((l) => l.status === "warning").length
  const errorLogs = logs.filter((l) => l.status === "error").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track all system activities and administrative actions
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Events" value={totalLogs.toString()} changeLabel="Most recent 500" icon={Shield} />
        <StatCard title="Successful" value={successLogs.toString()} changeLabel="Events completed" icon={CheckCircle2} />
        <StatCard title="Warnings" value={warningLogs.toString()} changeLabel="Needs review" icon={AlertTriangle} />
        <StatCard title="Errors" value={errorLogs.toString()} changeLabel="Failed events" icon={XCircle} />
      </div>

      <AuditLogsTable logs={logs} />
    </div>
  )
}
