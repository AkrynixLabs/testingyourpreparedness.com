"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, MoreHorizontal, Users, GraduationCap, Pencil, Trash2, UserPlus, Search } from "lucide-react"
import { createClass, updateClassTeacher, deleteClass } from "./actions"

export type ClassRow = {
  id: string
  displayName: string
  form: number
  section: string
  teacherName: string | null
  academicYear: string
  studentCount: number
  avgPerformance: number | null
}

export type FormSummaryRow = { form: number; classCount: number; totalStudents: number; avgPerformance: number | null }

const currentAcademicYear = () => {
  const now = new Date()
  const year = now.getFullYear()
  // Ghanaian school year runs Sept-Aug; before September, we're still in last year's year.
  const startYear = now.getMonth() >= 8 ? year : year - 1
  return `${startYear}/${startYear + 1}`
}

export function ClassesView({ classes, formSummary }: { classes: ClassRow[]; formSummary: FormSummaryRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterForm, setFilterForm] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [newClass, setNewClass] = useState({ form: "", section: "", teacherName: "", academicYear: currentAcademicYear() })

  const [editTarget, setEditTarget] = useState<ClassRow | null>(null)
  const [editTeacherName, setEditTeacherName] = useState("")
  const [editError, setEditError] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<ClassRow | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.teacherName ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesForm = filterForm === "all" || String(cls.form) === filterForm
    return matchesSearch && matchesForm
  })

  const totalStudents = classes.reduce((sum, cls) => sum + cls.studentCount, 0)
  const scoredClasses = classes.filter((c) => c.avgPerformance !== null)
  const avgPerformance =
    scoredClasses.length > 0
      ? Math.round(scoredClasses.reduce((sum, c) => sum + c.avgPerformance!, 0) / scoredClasses.length)
      : null

  const handleCreate = () => {
    setAddError(null)
    startTransition(async () => {
      try {
        await createClass({
          form: Number(newClass.form),
          section: newClass.section,
          teacherName: newClass.teacherName,
          academicYear: newClass.academicYear,
        })
        setIsAddDialogOpen(false)
        setNewClass({ form: "", section: "", teacherName: "", academicYear: currentAcademicYear() })
        router.refresh()
      } catch (err) {
        setAddError(err instanceof Error ? err.message : "Failed to create class.")
      }
    })
  }

  const handleEditSave = () => {
    if (!editTarget) return
    setEditError(null)
    startTransition(async () => {
      try {
        await updateClassTeacher(editTarget.id, editTeacherName)
        setEditTarget(null)
        router.refresh()
      } catch (err) {
        setEditError(err instanceof Error ? err.message : "Failed to update class.")
      }
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setDeleteError(null)
    startTransition(async () => {
      try {
        await deleteClass(deleteTarget.id)
        setDeleteTarget(null)
        router.refresh()
      } catch (err) {
        setDeleteError(err instanceof Error ? err.message : "Failed to delete class.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Classes & Forms</h1>
          <p className="text-muted-foreground">Manage your school classes and student groups</p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) setAddError(null)
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
              <DialogDescription>Create a new class for your school. You can add students after creating the class.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {addError && <p className="text-sm text-destructive">{addError}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="form">Form/Level</Label>
                  <Select value={newClass.form} onValueChange={(value) => setNewClass({ ...newClass, form: value })}>
                    <SelectTrigger id="form">
                      <SelectValue placeholder="Select form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Form 1</SelectItem>
                      <SelectItem value="2">Form 2</SelectItem>
                      <SelectItem value="3">Form 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    placeholder="e.g., C"
                    maxLength={1}
                    value={newClass.section}
                    onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teacher">Class Teacher</Label>
                <Input
                  id="teacher"
                  placeholder="e.g., Mr. John Mensah"
                  value={newClass.teacherName}
                  onChange={(e) => setNewClass({ ...newClass, teacherName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  placeholder="e.g., 2026/2027"
                  value={newClass.academicYear}
                  onChange={(e) => setNewClass({ ...newClass, academicYear: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isPending || !newClass.form || !newClass.section}>
                {isPending ? "Creating..." : "Create Class"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground">Across {formSummary.length} form{formSummary.length !== 1 ? "s" : ""}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled this year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Class Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length > 0 ? Math.round(totalStudents / classes.length) : 0}</div>
            <p className="text-xs text-muted-foreground">Students per class</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPerformance !== null ? `${avgPerformance}%` : "-"}</div>
            <p className="text-xs text-muted-foreground">School-wide average</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Overview</CardTitle>
          <CardDescription>Summary of students by form level</CardDescription>
        </CardHeader>
        <CardContent>
          {formSummary.length === 0 ? (
            <p className="text-sm text-muted-foreground">No classes yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {formSummary.map((form) => (
                <div key={form.form} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Form {form.form}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{form.classCount} class{form.classCount !== 1 ? "es" : ""}</span>
                      <span>{form.totalStudents} students</span>
                    </div>
                  </div>
                  <Badge variant={form.avgPerformance !== null && form.avgPerformance >= 75 ? "default" : "secondary"}>
                    {form.avgPerformance !== null ? `${form.avgPerformance}% avg` : "No data"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>All Classes</CardTitle>
              <CardDescription>View and manage individual classes</CardDescription>
            </div>
            {/* flex-wrap added - a 200px Input + 130px Select in a
                non-wrapping row overflows a narrow phone viewport with
                no fallback. Found by a static mobile-audit pass
                2026-08-08 (see docs/build-log.md). */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search classes..."
                  className="pl-8 w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterForm} onValueChange={setFilterForm}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter by form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Forms</SelectItem>
                  <SelectItem value="1">Form 1</SelectItem>
                  <SelectItem value="2">Form 2</SelectItem>
                  <SelectItem value="3">Form 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Form</TableHead>
                <TableHead>Class Teacher</TableHead>
                <TableHead className="text-center">Students</TableHead>
                <TableHead className="text-center">Avg Performance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.displayName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Form {cls.form}</Badge>
                  </TableCell>
                  <TableCell>{cls.teacherName ?? "-"}</TableCell>
                  <TableCell className="text-center">{cls.studentCount}</TableCell>
                  <TableCell className="text-center">
                    {cls.avgPerformance !== null ? (
                      <span
                        className={
                          cls.avgPerformance >= 75
                            ? "text-emerald-600"
                            : cls.avgPerformance >= 60
                            ? "text-amber-600"
                            : "text-red-600"
                        }
                      >
                        {cls.avgPerformance}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href="/school-admin/students">
                            <Users className="mr-2 h-4 w-4" />
                            View Students
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/school-admin/students/add">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Students
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditTarget(cls)
                            setEditTeacherName(cls.teacherName ?? "")
                            setEditError(null)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Class Teacher
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          disabled={cls.studentCount > 0}
                          onClick={() => {
                            setDeleteError(null)
                            setDeleteTarget(cls)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Class
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredClasses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No classes found matching your search criteria.</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editTarget !== null} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editTarget?.displayName}</DialogTitle>
            <DialogDescription>Update the class teacher for this class.</DialogDescription>
          </DialogHeader>
          {editError && <p className="text-sm text-destructive">{editError}</p>}
          <div className="grid gap-2 py-2">
            <Label htmlFor="editTeacher">Class Teacher</Label>
            <Input id="editTeacher" value={editTeacherName} onChange={(e) => setEditTeacherName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.displayName}?</AlertDialogTitle>
            <AlertDialogDescription>This permanently deletes the class. This can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
