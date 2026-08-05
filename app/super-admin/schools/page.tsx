import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { AddSchoolDialog } from "./add-school-dialog"
import { SchoolsTable } from "./schools-table"

export default async function SchoolsPage() {
  const schools = await prisma.school.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { students: true } },
      subscription: { include: { plan: true } },
    },
  })

  const totalSchools = schools.length
  const activeCount = schools.filter((s) => s.status === "active").length
  const pendingCount = schools.filter((s) => s.status === "pending").length
  const suspendedCount = schools.filter((s) => s.status === "suspended").length
  const enterpriseCount = schools.filter((s) => s.subscription?.plan.name === "Enterprise").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schools</h1>
          <p className="text-muted-foreground">
            Manage all registered schools on the platform
          </p>
        </div>
        <AddSchoolDialog />
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-5">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Schools</p>
            <p className="text-2xl font-bold">{totalSchools}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending Approval</p>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Suspended</p>
            <p className="text-2xl font-bold text-red-600">{suspendedCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Enterprise Plans</p>
            <p className="text-2xl font-bold text-primary">{enterpriseCount}</p>
          </CardContent>
        </Card>
      </div>

      <SchoolsTable schools={schools} />
    </div>
  )
}
