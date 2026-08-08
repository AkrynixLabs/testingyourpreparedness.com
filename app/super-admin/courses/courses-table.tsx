"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { MoreHorizontal, Flag, FlagOff, Trash2, Eye } from "lucide-react"
import { flagCourse, unflagCourse, removeCourse } from "./actions"
import type { Course, TutorProfile, User } from "@/lib/generated/prisma/client"

export type CourseRow = Course & {
  tutor: TutorProfile & { user: User }
  _count: { enrollments: number }
}

export function CoursesTable({ courses }: { courses: CourseRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [flagTarget, setFlagTarget] = useState<CourseRow | null>(null)
  const [removeTarget, setRemoveTarget] = useState<CourseRow | null>(null)
  const [reason, setReason] = useState("")

  const runAction = (courseId: string, action: () => Promise<void>) => {
    setError(null)
    setPendingId(courseId)
    startTransition(async () => {
      try {
        await action()
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed")
      } finally {
        setPendingId(null)
      }
    })
  }

  const handleUnflag = (course: CourseRow) => runAction(course.id, () => unflagCourse(course.id))

  const handleFlagSubmit = () => {
    if (!flagTarget) return
    const target = flagTarget
    runAction(target.id, () => flagCourse(target.id, reason))
    setFlagTarget(null)
    setReason("")
  }

  const handleRemoveSubmit = () => {
    if (!removeTarget) return
    const target = removeTarget
    runAction(target.id, () => removeCourse(target.id, reason))
    setRemoveTarget(null)
    setReason("")
  }

  const columns = [
    {
      key: "title",
      header: "Course",
      render: (course: CourseRow) => (
        <Link href={`/super-admin/courses/${course.id}`} className="hover:underline">
          <p className="font-medium">{course.title}</p>
          <p className="text-sm text-muted-foreground">{course.category}</p>
        </Link>
      ),
    },
    {
      key: "tutor",
      header: "Tutor",
      render: (course: CourseRow) => (
        <div>
          <p className="text-sm font-medium">{course.tutor.user.name}</p>
          <p className="text-xs text-muted-foreground">{course.tutor.user.email}</p>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (course: CourseRow) => `GHS ${course.price}`,
    },
    {
      key: "enrollments",
      header: "Enrollments",
      render: (course: CourseRow) => course._count.enrollments.toLocaleString(),
    },
    {
      key: "status",
      header: "Status",
      render: (course: CourseRow) => (
        <Badge
          variant="secondary"
          className={
            course.status === "published"
              ? "bg-emerald-100 text-emerald-700"
              : course.status === "flagged"
              ? "bg-amber-100 text-amber-700"
              : "bg-red-100 text-red-700"
          }
        >
          {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "publishedAt",
      header: "Published",
      render: (course: CourseRow) => course.publishedAt.toLocaleDateString(),
    },
  ]

  return (
    <>
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>Every course across every tutor - flag or remove content that violates platform standards</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={courses}
            columns={columns}
            searchKey="title"
            searchPlaceholder="Search courses..."
            actions={(course) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isPending && pendingId === course.id}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/super-admin/courses/${course.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  {course.status === "flagged" ? (
                    <DropdownMenuItem className="text-emerald-600" onClick={() => handleUnflag(course)}>
                      <FlagOff className="mr-2 h-4 w-4" />
                      Unflag
                    </DropdownMenuItem>
                  ) : course.status === "published" ? (
                    <DropdownMenuItem
                      className="text-amber-600"
                      onClick={() => {
                        setFlagTarget(course)
                        setReason("")
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
                        setRemoveTarget(course)
                        setReason("")
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={!!flagTarget} onOpenChange={(open) => !open && setFlagTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Course</DialogTitle>
            <DialogDescription>
              Flagging "{flagTarget?.title}" keeps it visible but marks it for review. Provide a reason for the record.
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
            <Button variant="outline" onClick={() => setFlagTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleFlagSubmit} disabled={!reason.trim()}>
              Flag Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Course</DialogTitle>
            <DialogDescription>
              Removing "{removeTarget?.title}" is a stronger action than flagging - the course is treated as taken down. Provide a
              reason for the record.
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
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveSubmit} disabled={!reason.trim()}>
              Remove Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
