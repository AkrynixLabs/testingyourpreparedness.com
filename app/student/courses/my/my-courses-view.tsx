"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, PlayCircle } from "lucide-react"

type EnrollmentRow = {
  courseId: string
  title: string
  category: string
  tutorName: string
  enrolledAt: string
  lessonCount: number
  courseRemoved: boolean
}

export function MyCoursesView({ enrollments }: { enrollments: EnrollmentRow[] }) {
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

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {enrollments.map((e) => (
        <Card key={e.courseId}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <Badge variant="secondary">{e.category}</Badge>
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
  )
}
