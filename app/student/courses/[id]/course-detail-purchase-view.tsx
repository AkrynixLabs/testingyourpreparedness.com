"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PlayCircle, FileText, Users, CheckCircle2, Star, Video, Calendar, ExternalLink, Lock } from "lucide-react"
import { enrollInFreeCourse, initializeCoursePurchase, submitCourseReview } from "../actions"
import { StarRatingDisplay, StarRatingInput } from "../star-rating"

type Review = {
  id: string
  studentName: string
  rating: number
  comment: string | null
  createdAt: string
  isMine: boolean
}

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
  averageRating: number | null
  reviews: Review[]
  myReview: { rating: number; comment: string } | null
  virtualSessions: {
    id: string
    title: string
    description: string | null
    scheduledAt: string
    durationMinutes: number
    mode: string
    dailyRoomUrl: string | null
    externalMeetingUrl: string | null
  }[]
}

export function CourseDetailPurchaseView({ course }: { course: CourseDetail }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [reviewRating, setReviewRating] = useState(course.myReview?.rating ?? 0)
  const [reviewComment, setReviewComment] = useState(course.myReview?.comment ?? "")
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [isReviewPending, startReviewTransition] = useTransition()

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

  const handleSubmitReview = () => {
    setReviewError(null)
    if (reviewRating < 1) {
      setReviewError("Select a star rating.")
      return
    }
    startReviewTransition(async () => {
      try {
        await submitCourseReview({ courseId: course.id, rating: reviewRating, comment: reviewComment })
        setReviewSubmitted(true)
        router.refresh()
      } catch (err) {
        setReviewError(err instanceof Error ? err.message : "Failed to submit review.")
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
          {course.averageRating !== null && (
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{course.averageRating.toFixed(1)}</span>
              <span>({course.reviews.length} review{course.reviews.length === 1 ? "" : "s"})</span>
            </span>
          )}
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

      {course.virtualSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {course.virtualSessions.map((s) => {
              const joinUrl = s.mode === "daily" ? s.dailyRoomUrl : s.externalMeetingUrl
              return (
                <div key={s.id} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Video className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{s.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(s.scheduledAt).toLocaleString()} - {s.durationMinutes} min
                      </p>
                    </div>
                  </div>
                  {course.isEnrolled && joinUrl ? (
                    <Button asChild size="sm" className="shrink-0">
                      <a href={joinUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Join
                      </a>
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="shrink-0">
                      <Lock className="h-3 w-3 mr-1" />
                      Enrolled students only
                    </Badge>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

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

      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {course.isEnrolled && (
            <div className="rounded-lg border p-4 space-y-3">
              <p className="font-medium text-sm">{course.myReview ? "Edit your review" : "Leave a review"}</p>
              {reviewError && (
                <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {reviewError}
                </p>
              )}
              {reviewSubmitted && !reviewError && (
                <p className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3 text-sm text-emerald-600">
                  Review saved.
                </p>
              )}
              <StarRatingInput value={reviewRating} onChange={setReviewRating} />
              <Textarea
                placeholder="What did you think of this course? (optional)"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
              />
              <Button size="sm" onClick={handleSubmitReview} disabled={isReviewPending}>
                {isReviewPending ? "Saving..." : course.myReview ? "Update Review" : "Submit Review"}
              </Button>
            </div>
          )}

          {course.reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {course.reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">
                      {review.studentName} {review.isMine && <span className="text-muted-foreground">(you)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="mt-1">
                    <StarRatingDisplay rating={review.rating} />
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
