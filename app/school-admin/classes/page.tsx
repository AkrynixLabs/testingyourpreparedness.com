"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  MoreHorizontal,
  Users,
  GraduationCap,
  Pencil,
  Trash2,
  UserPlus,
  Search,
  ChevronRight,
} from "lucide-react"

// Demo data
const classes = [
  {
    id: "1",
    name: "JHS 1A",
    form: "JHS 1",
    students: 45,
    teacher: "Mr. Emmanuel Adjei",
    academicYear: "2024/2025",
    subjects: 8,
    avgPerformance: 72,
  },
  {
    id: "2",
    name: "JHS 1B",
    form: "JHS 1",
    students: 42,
    teacher: "Mrs. Abigail Mensah",
    academicYear: "2024/2025",
    subjects: 8,
    avgPerformance: 68,
  },
  {
    id: "3",
    name: "JHS 2A",
    form: "JHS 2",
    students: 40,
    teacher: "Mr. Patrick Owusu",
    academicYear: "2024/2025",
    subjects: 8,
    avgPerformance: 75,
  },
  {
    id: "4",
    name: "JHS 2B",
    form: "JHS 2",
    students: 38,
    teacher: "Ms. Grace Asante",
    academicYear: "2024/2025",
    subjects: 8,
    avgPerformance: 70,
  },
  {
    id: "5",
    name: "JHS 3A",
    form: "JHS 3",
    students: 44,
    teacher: "Mr. Samuel Boateng",
    academicYear: "2024/2025",
    subjects: 8,
    avgPerformance: 78,
  },
  {
    id: "6",
    name: "JHS 3B",
    form: "JHS 3",
    students: 41,
    teacher: "Mrs. Elizabeth Darko",
    academicYear: "2024/2025",
    subjects: 8,
    avgPerformance: 74,
  },
]

const formSummary = [
  { form: "JHS 1", classes: 2, totalStudents: 87, avgPerformance: 70 },
  { form: "JHS 2", classes: 2, totalStudents: 78, avgPerformance: 72.5 },
  { form: "JHS 3", classes: 2, totalStudents: 85, avgPerformance: 76 },
]

export default function ClassesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterForm, setFilterForm] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newClass, setNewClass] = useState({
    name: "",
    form: "",
    teacher: "",
  })

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.teacher.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesForm = filterForm === "all" || cls.form === filterForm
    return matchesSearch && matchesForm
  })

  const totalStudents = classes.reduce((sum, cls) => sum + cls.students, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Classes & Forms</h1>
          <p className="text-muted-foreground">
            Manage your school classes and student groups
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
              <DialogDescription>
                Create a new class for your school. You can add students after creating the class.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="className">Class Name</Label>
                <Input
                  id="className"
                  placeholder="e.g., JHS 1C"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="form">Form/Level</Label>
                <Select
                  value={newClass.form}
                  onValueChange={(value) => setNewClass({ ...newClass, form: value })}
                >
                  <SelectTrigger id="form">
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JHS 1">JHS 1</SelectItem>
                    <SelectItem value="JHS 2">JHS 2</SelectItem>
                    <SelectItem value="JHS 3">JHS 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teacher">Class Teacher</Label>
                <Input
                  id="teacher"
                  placeholder="e.g., Mr. John Mensah"
                  value={newClass.teacher}
                  onChange={(e) => setNewClass({ ...newClass, teacher: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>
                Create Class
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Form Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground">Across 3 forms</p>
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
            <div className="text-2xl font-bold">{Math.round(totalStudents / classes.length)}</div>
            <p className="text-xs text-muted-foreground">Students per class</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(classes.reduce((sum, cls) => sum + cls.avgPerformance, 0) / classes.length)}%
            </div>
            <p className="text-xs text-muted-foreground">School-wide average</p>
          </CardContent>
        </Card>
      </div>

      {/* Form Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Form Overview</CardTitle>
          <CardDescription>Summary of students by form level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {formSummary.map((form) => (
              <div
                key={form.form}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="space-y-1">
                  <p className="font-medium">{form.form}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{form.classes} classes</span>
                    <span>{form.totalStudents} students</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={form.avgPerformance >= 75 ? "default" : "secondary"}>
                    {form.avgPerformance}% avg
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>All Classes</CardTitle>
              <CardDescription>View and manage individual classes</CardDescription>
            </div>
            <div className="flex items-center gap-2">
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
                  <SelectItem value="JHS 1">JHS 1</SelectItem>
                  <SelectItem value="JHS 2">JHS 2</SelectItem>
                  <SelectItem value="JHS 3">JHS 3</SelectItem>
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
                <TableHead className="text-center">Subjects</TableHead>
                <TableHead className="text-center">Avg Performance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{cls.form}</Badge>
                  </TableCell>
                  <TableCell>{cls.teacher}</TableCell>
                  <TableCell className="text-center">{cls.students}</TableCell>
                  <TableCell className="text-center">{cls.subjects}</TableCell>
                  <TableCell className="text-center">
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
                        <DropdownMenuItem>
                          <Users className="mr-2 h-4 w-4" />
                          View Students
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add Students
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Class
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
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
            <div className="text-center py-8 text-muted-foreground">
              No classes found matching your search criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
