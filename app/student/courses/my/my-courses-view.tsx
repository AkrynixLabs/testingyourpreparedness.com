"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, PlayCircle, ChevronLeft, ChevronRight } from "lucide-react"

const PAGE_SIZE = 9

type EnrollmentRow = {
  courseId: string
  title: string
  programName: string | null
  tutorName: string
  enrolledAt: string
  lessonCount: number
  courseRemoved: boolean
}

export function MyCoursesView({ enrollments }: { enrollments: EnrollmentRow[] }) {
  const [page, setPage] = useState(1)

  if (enrollments.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">You haven&apos;t enrolled in any courses yet.</p>
          <Button asChild>
            <Link href="/student/courses">Browse Courses</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Client-side pagination, same reasoning as the catalog's own (2026-08-19,
  // user-requested "apply the pagination bit to web too") - the query
  // already returns every enrollment in one shot.
  const totalPages = Math.max(1, Math.ceil(enrollments.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = enrollments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.map((e) => (
          <Card key={e.courseId}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="secondary">{e.programName ?? "Uncategorized"}</Badge>
                {e.courseRemoved && <Badge variant="destructive">No longer available</Badge>}
              </div>
              <CardTitle className="text-lg leading-tight mt-2">{e.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">by {e.tutorName}</p>
              <p className="text-xs text-muted-foreground">
                {e.lessonCount} lessons · Enrolled {new Date(e.enrolledAt).toLocaleDateString()}
              </p>
              <Button asChild className="w-full">
                <Link href={`/student/courses/${e.courseId}/learn`}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Continue Learning
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
