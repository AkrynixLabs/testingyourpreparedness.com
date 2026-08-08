"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  MoreHorizontal,
  Flag,
  FlagOff,
  Trash2,
  Users,
  Wallet,
  Layers,
  PlayCircle,
  FileText,
  Video,
} from "lucide-react"
import { flagCourse, unflagCourse, removeCourse } from "../actions"
import type {
  Course,
  TutorProfile,
  User,
  Module,
  Lesson,
  Enrollment,
  Student,
  CoursePurchase,
} from "@/lib/generated/prisma/client"

type CourseWithRelations = Course & {
  tutor: TutorProfile & { user: User }
  modules: (Module & { lessons: Lesson[] })[]
  enrollments: (Enrollment & { student: Student & { user: User } })[]
  purchases: CoursePurchase[]
}

export function CourseDetailView({
  course,
  stats,
}: {
  course: CourseWithRelations
  stats: {
    totalRevenue: number
    totalPlatformFee: number
    totalTutorPayout: number
    enrollmentCount: number
    moduleCount: number
    lessonCount: number
  }
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [flagOpen, setFlagOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [reason, setReason] = useState("")

  const runAction = (action: () => Promise<void>) => {
    setError(null)
    startTransition(async () => {
      try {
        await action()
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed")
      }
    })
  }

  const handleUnflag = () => runAction(() => unflagCourse(course.id))
  const handleFlagSubmit = () => {
    runAction(() => flagCourse(course.id, reason))
    setFlagOpen(false)
    setReason("")
  }
  const handleRemoveSubmit = () => {
    runAction(() => removeCourse(course.id, reason))
    setRemoveOpen(false)
    setReason("")
  }

  const statusBadgeClass =
    course.status === "published"
      ? "bg-emerald-100 text-emerald-700"
      : course.status === "flagged"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/super-admin/courses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
              <Badge variant="secondary" className={statusBadgeClass}>
                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground">{course.category} · by {course.tutor.user.name}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isPending}>
              <MoreHorizontal className="mr-2 h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {course.status === "flagged" ? (
              <DropdownMenuItem className="text-emerald-600" onClick={handleUnflag}>
                <FlagOff className="mr-2 h-4 w-4" />
                Unflag
              </DropdownMenuItem>
            ) : course.status === "published" ? (
              <DropdownMenuItem
                className="text-amber-600"
                onClick={() => {
                  setReason("")
                  setFlagOpen(true)
                }}
              >
                <Flag className="mr-2 h-4 w-4" />
                Flag
              </DropdownMenuItem>
            ) : null}
            {course.status !== "removed" && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setReason("")
                  setRemoveOpen(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-2xl font-bold">GHS {course.price}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" /> Enrollments
            </div>
            <p className="text-2xl font-bold">{stats.enrollmentCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="h-4 w-4" /> Curriculum
            </div>
            <p className="text-2xl font-bold">
              {stats.moduleCount} modules / {stats.lessonCount} lessons
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4" /> Total Revenue
            </div>
            <p className="text-2xl font-bold">GHS {stats.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>Sum of every completed CoursePurchase for this course</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Charged</p>
              <p className="text-xl font-semibold">GHS {stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Platform Fee</p>
              <p className="text-xl font-semibold text-primary">GHS {stats.totalPlatformFee.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tutor Payout</p>
              <p className="text-xl font-semibold text-emerald-600">GHS {stats.totalTutorPayout.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Curriculum</CardTitle>
            <CardDescription>Every module and lesson in this course</CardDescription>
          </CardHeader>
          <CardContent>
            {course.modules.length === 0 ? (
              <p className="text-sm text-muted-foreground">No modules yet.</p>
            ) : (
              <Accordion type="multiple" className="w-full">
                {course.modules.map((module, idx) => (
                  <AccordionItem key={module.id} value={module.id}>
                    <AccordionTrigger>
                      {idx + 1}. {module.title} ({module.lessons.length} lessons)
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center gap-2 text-sm">
                            {lesson.type === "video" ? (
                              <Video className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            )}
                            {lesson.title}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Enrolled Students</CardTitle>
            <CardDescription>{course.enrollments.length} students enrolled</CardDescription>
          </CardHeader>
          <CardContent>
            {course.enrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No enrollments yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Enrolled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {course.enrollments.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {e.student.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{e.student.user.name}</p>
                            <p className="text-xs text-muted-foreground">{e.student.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{e.enrolledAt.toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={flagOpen} onOpenChange={setFlagOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Course</DialogTitle>
            <DialogDescription>
              Flagging "{course.title}" keeps it visible but marks it for review. Provide a reason for the record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="flag-reason">Reason</Label>
            <Textarea
              id="flag-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Reported for misleading course description"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlagOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFlagSubmit} disabled={!reason.trim()}>
              Flag Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Course</DialogTitle>
            <DialogDescription>
              Removing "{course.title}" is a stronger action than flagging - the course is treated as taken down. Provide a reason
              for the record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="remove-reason">Reason</Label>
            <Textarea
              id="remove-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Confirmed policy violation"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveSubmit} disabled={!reason.trim()}>
              Remove Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
