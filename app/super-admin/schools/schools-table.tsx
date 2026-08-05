"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Ban, CheckCircle } from "lucide-react"
import { setSchoolStatus } from "./actions"
import type { School, SchoolStatus } from "@/lib/generated/prisma/client"

export type SchoolRow = School & {
  _count: { students: number }
  subscription: { plan: { name: string } } | null
}

export function SchoolsTable({ schools }: { schools: SchoolRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)

  const handleSetStatus = (schoolId: string, status: SchoolStatus) => {
    setPendingId(schoolId)
    startTransition(async () => {
      await setSchoolStatus(schoolId, status)
      router.refresh()
      setPendingId(null)
    })
  }

  const columns = [
    {
      key: "name",
      header: "School Name",
      render: (school: SchoolRow) => (
        <div>
          <p className="font-medium">{school.name}</p>
          <p className="text-sm text-muted-foreground">{school.town}, {school.region}</p>
        </div>
      ),
    },
    {
      key: "students",
      header: "Students",
      render: (school: SchoolRow) => school._count.students.toLocaleString(),
    },
    {
      key: "plan",
      header: "Plan",
      render: (school: SchoolRow) => (
        <Badge variant={school.subscription?.plan.name === "Enterprise" ? "default" : "secondary"}>
          {school.subscription?.plan.name ?? "No plan"}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (school: SchoolRow) => (
        <Badge
          variant="secondary"
          className={
            school.status === "active"
              ? "bg-emerald-100 text-emerald-700"
              : school.status === "suspended"
              ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-700"
          }
        >
          {school.status === "active" ? "Active" : school.status === "suspended" ? "Suspended" : "Pending"}
        </Badge>
      ),
    },
  ]

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>All Schools</CardTitle>
        <CardDescription>View and manage school registrations</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={schools}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search schools..."
          actions={(school) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isPending && pendingId === school.id}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                {school.status === "pending" && (
                  <DropdownMenuItem
                    className="text-emerald-600"
                    onClick={() => handleSetStatus(school.id, "active")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </DropdownMenuItem>
                )}
                {school.status === "suspended" ? (
                  <DropdownMenuItem
                    className="text-emerald-600"
                    onClick={() => handleSetStatus(school.id, "active")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Reactivate
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleSetStatus(school.id, "suspended")}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </CardContent>
    </Card>
  )
}
