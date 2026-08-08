"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlayCircle, FileText, Users, CheckCircle2 } from "lucide-react"
import { enrollInFreeCourse, initializeCoursePurchase } from "../actions"

type CourseDetail = {
  id: string
  title: string
  description: string
  category: string
  price: number
  tutorName: string
  tutorHeadline: string | null
  tutorBio: string | null
  studentCount: number
  modules: { id: string; title: string; lessons: { id: string; title: string; type: string }[] }[]
  isEnrolled: boolean
}

export function CourseDetailPurchaseView({ course }: { course: CourseDetail }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleEnroll = () => {
    setError(null)
    startTransition(async () => {
      try {
        if (course.price === 0) {
          await enrollInFreeCourse(course.id)
          router.push(`/student/courses/${course.id}/learn`)
        } else {
          const { authorizationUrl } = await initializeCoursePurchase(course.id)
          window.location.href = authorizationUrl
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to enroll.")
      }
    })
  }

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary">{course.category}</Badge>
        <h1 className="text-3xl font-bold tracking-tight mt-2">{course.title}</h1>
        <p className="text-muted-foreground mt-2">{course.description}</p>
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {course.studentCount} students enrolled
          </span>
          <span>{course.modules.length} modules · {totalLessons} lessons</span>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-2xl font-bold text-primary">{course.price === 0 ? "Free" : `GHS ${course.price}`}</p>
            <p className="text-sm text-muted-foreground">One-time purchase - lifetime access</p>
          </div>
          {course.isEnrolled ? (
            <Button asChild size="lg">
              <Link href={`/student/courses/${course.id}/learn`}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Continue Learning
              </Link>
            </Button>
          ) : (
            <Button size="lg" onClick={handleEnroll} disabled={isPending}>
              {isPending ? "Processing..." : course.price === 0 ? "Enroll for Free" : "Buy Course"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About the Tutor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{course.tutorName}</p>
          {course.tutorHeadline && <p className="text-sm text-muted-foreground">{course.tutorHeadline}</p>}
          {course.tutorBio && <p className="text-sm text-muted-foreground mt-2">{course.tutorBio}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Curriculum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {course.modules.map((module, index) => (
            <div key={module.id} className="rounded-lg border p-4">
              <p className="font-medium mb-2">
                Module {index + 1}: {module.title}
              </p>
              <div className="space-y-1 pl-4">
                {module.lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                    {lesson.type === "video" ? <PlayCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    {lesson.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
