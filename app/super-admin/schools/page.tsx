"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import { schools } from "@/lib/demo-data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, MoreHorizontal, Eye, Edit, Ban, CheckCircle } from "lucide-react"

export default function SchoolsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const columns = [
    {
      key: "name",
      header: "School Name",
      render: (school: typeof schools[0]) => (
        <div>
          <p className="font-medium">{school.name}</p>
          <p className="text-sm text-muted-foreground">{school.location}</p>
        </div>
      ),
    },
    {
      key: "students",
      header: "Students",
      render: (school: typeof schools[0]) => school.students.toLocaleString(),
    },
    {
      key: "plan",
      header: "Plan",
      render: (school: typeof schools[0]) => (
        <Badge variant={school.plan === "Premium" ? "default" : "secondary"}>
          {school.plan}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (school: typeof schools[0]) => (
        <Badge
          variant="secondary"
          className={
            school.status === "active"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }
        >
          {school.status === "active" ? "Active" : "Pending"}
        </Badge>
      ),
    },
    {
      key: "avgScore",
      header: "Avg. Score",
      render: (school: typeof schools[0]) =>
        school.avgScore > 0 ? `${school.avgScore}%` : "-",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schools</h1>
          <p className="text-muted-foreground">
            Manage all registered schools on the platform
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add School
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New School</DialogTitle>
              <DialogDescription>
                Register a new school to the platform
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setDialogOpen(false) }}>
              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input id="schoolName" placeholder="Enter school name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="City/Region" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Subscription Plan</Label>
                <Select>
                  <SelectTrigger id="plan">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input id="adminEmail" type="email" placeholder="admin@school.edu.gh" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add School</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Schools</p>
            <p className="text-2xl font-bold">{schools.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-emerald-600">
              {schools.filter((s) => s.status === "active").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending Approval</p>
            <p className="text-2xl font-bold text-amber-600">
              {schools.filter((s) => s.status === "pending").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Premium Plans</p>
            <p className="text-2xl font-bold text-primary">
              {schools.filter((s) => s.plan === "Premium").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Schools table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>All Schools</CardTitle>
          <CardDescription>
            View and manage school registrations
          </CardDescription>
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
                  <Button variant="ghost" size="icon">
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
                    <DropdownMenuItem className="text-emerald-600">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-destructive">
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}
