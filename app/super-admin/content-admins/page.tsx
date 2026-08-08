import { prisma } from "@/lib/prisma"
import { StatCard } from "@/components/stat-card"
import { Shield, CheckCircle2, FileQuestion } from "lucide-react"
import { ContentAdminsView } from "./content-admins-view"

export default async function ContentAdminsPage() {
  const [profiles, subjects, questionCounts] = await Promise.all([
    prisma.contentAdminProfile.findMany({
      include: { user: true, subjects: { include: { subject: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.question.groupBy({
      by: ["createdById", "status"],
      _count: { _all: true },
    }),
  ])

  const countsByUser = new Map<string, { created: number; approved: number; pending: number; rejected: number }>()
  for (const row of questionCounts) {
    const entry = countsByUser.get(row.createdById) ?? { created: 0, approved: 0, pending: 0, rejected: 0 }
    entry.created += row._count._all
    if (row.status === "approved") entry.approved += row._count._all
    if (row.status === "pending") entry.pending += row._count._all
    if (row.status === "rejected") entry.rejected += row._count._all
    countsByUser.set(row.createdById, entry)
  }

  const admins = profiles.map((profile) => ({
    ...profile,
    counts: countsByUser.get(profile.userId) ?? { created: 0, approved: 0, pending: 0, rejected: 0 },
  }))

  const totalAdmins = admins.length
  const activeAdmins = admins.filter((a) => a.status === "active").length
  const totalQuestions = admins.reduce((sum, a) => sum + a.counts.created, 0)
  const totalApproved = admins.reduce((sum, a) => sum + a.counts.approved, 0)
  const approvalRate = totalQuestions > 0 ? Math.round((totalApproved / totalQuestions) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content Administrators</h1>
        <p className="text-muted-foreground">
          Manage content admins who create and submit questions for approval
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Content Admins" value={totalAdmins.toString()} changeLabel="Managing content" icon={Shield} />
        <StatCard title="Active Admins" value={activeAdmins.toString()} changeLabel="Currently active" icon={CheckCircle2} />
        <StatCard title="Questions Created" value={totalQuestions.toLocaleString()} changeLabel="Total submissions" icon={FileQuestion} />
        <StatCard title="Approval Rate" value={`${approvalRate}%`} changeLabel="Questions approved" icon={CheckCircle2} />
      </div>

      <ContentAdminsView admins={admins} subjects={subjects} />
    </div>
  )
}
