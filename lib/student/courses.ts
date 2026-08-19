import { prisma } from "@/lib/prisma"
import { initializeTransaction, verifyTransaction } from "@/lib/payments/paystack"
import { generateCoursePurchaseId } from "@/lib/payments/ids"
import { getPlatformFeePercent } from "@/lib/platform-settings"
import { getCompletedLessonIds } from "./lesson-progress"

// Extracted from app/student/courses/{page,[id]/page,my/page,[id]/learn/page,actions}.tsx
// (unchanged logic) so app/api/mobile/courses/** can call the exact same
// catalog/detail/eligibility/purchase logic the web app's own student pages
// do, rather than a second, driftable copy - same "one function, two
// callers" pattern as lib/student/exams.ts and exam-attempt.ts. The web
// pages/actions were refactored to call these too; their output is unchanged.

export type CourseCatalogRow = {
  id: string
  title: string
  description: string
  programId: string | null
  programName: string | null
  price: number
  thumbnailUrl: string | null
  tutorName: string
  studentCount: number
  moduleCount: number
  isEnrolled: boolean
  reviewCount: number
  averageRating: number | null
}

export async function getCourseCatalog(studentId: string | null): Promise<CourseCatalogRow[]> {
  const [courses, myEnrollments] = await Promise.all([
    prisma.course.findMany({
      where: { status: "published" },
      include: {
        tutor: { include: { user: true } },
        program: true,
        _count: { select: { enrollments: true, modules: true, reviews: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { publishedAt: "desc" },
    }),
    studentId
      ? prisma.enrollment.findMany({ where: { studentId }, select: { courseId: true } })
      : Promise.resolve([]),
  ])

  const enrolledIds = new Set(myEnrollments.map((e) => e.courseId))

  return courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    programId: c.programId,
    programName: c.program?.name ?? null,
    price: c.price,
    thumbnailUrl: c.thumbnailUrl,
    tutorName: c.tutor.user.name,
    studentCount: c._count.enrollments,
    moduleCount: c._count.modules,
    isEnrolled: enrolledIds.has(c.id),
    reviewCount: c._count.reviews,
    averageRating: c.reviews.length > 0 ? c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length : null,
  }))
}

export type CourseDetail = {
  id: string
  title: string
  description: string
  programId: string | null
  programName: string | null
  price: number
  tutorName: string
  tutorHeadline: string | null
  tutorBio: string | null
  studentCount: number
  modules: { id: string; title: string; lessons: { id: string; title: string; type: string }[] }[]
  isEnrolled: boolean
  averageRating: number | null
  reviews: { id: string; studentName: string; rating: number; comment: string | null; createdAt: Date; isMine: boolean }[]
  myReview: { rating: number; comment: string } | null
  virtualSessions: {
    id: string
    title: string
    description: string | null
    scheduledAt: Date
    durationMinutes: number
    mode: string
    dailyRoomUrl: string | null
    externalMeetingUrl: string | null
  }[]
}

// Returns null for "removed or nonexistent" - a flagged course is still
// viewable (moderation review, not a takedown), matching CourseStatus's own
// schema comment. Caller decides 404 vs. something else.
export async function getCourseDetail(courseId: string, studentId: string | null): Promise<CourseDetail | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      tutor: { include: { user: true } },
      program: true,
      modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
      _count: { select: { enrollments: true } },
      reviews: { include: { student: { include: { user: true } } }, orderBy: { createdAt: "desc" } },
      virtualSessions: {
        where: { status: { not: "cancelled" }, scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: "asc" },
      },
    },
  })
  if (!course || course.status === "removed") return null

  const enrollment = studentId
    ? await prisma.enrollment.findUnique({ where: { courseId_studentId: { courseId: course.id, studentId } } })
    : null

  const myReview = studentId ? course.reviews.find((r) => r.studentId === studentId) : undefined
  const averageRating =
    course.reviews.length > 0 ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length : null

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    programId: course.programId,
    programName: course.program?.name ?? null,
    price: course.price,
    tutorName: course.tutor.user.name,
    tutorHeadline: course.tutor.headline,
    tutorBio: course.tutor.bio,
    studentCount: course._count.enrollments,
    modules: course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      lessons: m.lessons.map((l) => ({ id: l.id, title: l.title, type: l.type })),
    })),
    isEnrolled: !!enrollment,
    averageRating,
    reviews: course.reviews.map((r) => ({
      id: r.id,
      studentName: r.student.user.name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      isMine: r.studentId === studentId,
    })),
    myReview: myReview ? { rating: myReview.rating, comment: myReview.comment ?? "" } : null,
    // Join details (dailyRoomUrl/externalMeetingUrl) are only meaningful to
    // an enrolled student - included for everyone here since the page-level
    // `isEnrolled` flag already gates whether the UI shows a join button at
    // all, matching this function's existing "return full data, gate in the
    // view" pattern for reviews/myReview above.
    virtualSessions: course.virtualSessions.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      scheduledAt: s.scheduledAt,
      durationMinutes: s.durationMinutes,
      mode: s.mode,
      dailyRoomUrl: s.dailyRoomUrl,
      externalMeetingUrl: s.externalMeetingUrl,
    })),
  }
}

export type MyCourseRow = {
  courseId: string
  title: string
  programName: string | null
  tutorName: string
  enrolledAt: Date
  lessonCount: number
  courseRemoved: boolean
}

export async function getMyCourses(studentId: string): Promise<MyCourseRow[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: {
        include: {
          tutor: { include: { user: true } },
          program: true,
          modules: { include: { lessons: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  })

  return enrollments.map((e) => ({
    courseId: e.course.id,
    title: e.course.title,
    programName: e.course.program?.name ?? null,
    tutorName: e.course.tutor.user.name,
    enrolledAt: e.enrolledAt,
    lessonCount: e.course.modules.reduce((sum, m) => sum + m.lessons.length, 0),
    courseRemoved: e.course.status === "removed",
  }))
}

export type LearnCourse = {
  id: string
  title: string
  modules: {
    id: string
    title: string
    lessons: {
      id: string
      title: string
      type: string
      videoUrl: string | null
      content: string | null
      videoSource: string | null
      muxPlaybackId: string | null
      muxStatus: string | null
      isCompleted: boolean
    }[]
  }[]
}

// Returns null when the student isn't enrolled (caller redirects/403s) or
// the course doesn't exist - enrollment is re-verified here independently of
// any list page's own display logic, same "never trust that a link only
// appeared because a list page filtered it correctly" rule as exam-taking.
export async function getLearnContent(courseId: string, studentId: string): Promise<LearnCourse | null> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId } },
  })
  if (!enrollment) return null

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
    },
  })
  if (!course) return null

  const completedIds = await getCompletedLessonIds(studentId, courseId)

  return {
    id: course.id,
    title: course.title,
    modules: course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      lessons: m.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        type: l.type,
        videoUrl: l.videoUrl,
        content: l.content,
        videoSource: l.videoSource,
        muxPlaybackId: l.muxPlaybackId,
        muxStatus: l.muxStatus,
        isCompleted: completedIds.has(l.id),
      })),
    })),
  }
}

// Free courses (price = 0) skip Paystack entirely and enroll directly - same
// "don't call a payment provider for a GHS 0 charge" call already made for
// the student-free subscription plan in signup/independent.
export async function enrollInFreeCourseForStudent(
  studentId: string,
  courseId: string
): Promise<{ alreadyEnrolled: boolean }> {
  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course || course.status !== "published") throw new Error("Course not available.")
  if (course.price !== 0) throw new Error("This course isn't free.")

  const existing = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId } },
  })
  if (existing) return { alreadyEnrolled: true }

  await prisma.enrollment.create({ data: { courseId, studentId } })
  return { alreadyEnrolled: false }
}

// Only creates a pending CoursePurchase and starts the Paystack transaction -
// the Enrollment is only created by the webhook once the charge actually
// succeeds (app/api/webhooks/paystack/route.ts's handleCoursePurchaseSuccess)
// - a client-side redirect back to the callback page is never trusted alone.
export async function initializeCoursePurchaseForStudent(
  studentId: string,
  email: string,
  courseId: string,
  callbackUrl: string
): Promise<{ authorizationUrl: string; reference: string }> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { tutor: true },
  })
  if (!course || course.status !== "published") throw new Error("Course not available.")
  if (course.price === 0) throw new Error("This course is free - use the free-enroll endpoint instead.")

  const existing = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId } },
  })
  if (existing) throw new Error("You're already enrolled in this course.")

  const platformFeePercent = await getPlatformFeePercent()
  const platformFee = Math.round((course.price * platformFeePercent) / 100)
  const tutorPayout = course.price - platformFee

  const purchaseId = generateCoursePurchaseId()
  await prisma.coursePurchase.create({
    data: {
      id: purchaseId,
      courseId: course.id,
      studentId,
      amount: course.price,
      platformFee,
      tutorPayout,
      status: "pending",
      paystackReference: purchaseId,
    },
  })

  const { authorizationUrl, reference } = await initializeTransaction({
    email,
    amountGhs: course.price,
    reference: purchaseId,
    callbackUrl,
    metadata: { courseId: course.id, studentId },
    // Only set when the tutor has completed Paystack subaccount setup - see
    // lib/payments/paystack.ts's own InitializeTransactionInput doc comment.
    subaccountCode: course.tutor.paystackSubaccountCode ?? undefined,
    transactionChargeGhs: course.tutor.paystackSubaccountCode ? platformFee : undefined,
    bearer: course.tutor.paystackSubaccountCode ? "subaccount" : undefined,
  })

  return { authorizationUrl, reference }
}

// Best-effort UX confirmation only, same pattern as the web checkout
// callback page - the webhook remains the sole source of truth for actually
// creating the Enrollment, this just tells the caller what to show.
export async function verifyCoursePurchaseForStudent(reference: string): Promise<"success" | "failed" | "unverifiable"> {
  try {
    const result = await verifyTransaction(reference)
    return result.status === "success" ? "success" : "failed"
  } catch {
    return "unverifiable"
  }
}

// Upsert, not a one-time submission - a student can revise their own
// rating/comment later (no "lock it forever" precedent elsewhere in this
// app). Gated on a real Enrollment existing, checked here rather than via a
// schema-level FK - a review isn't tied to *which* purchase, just that the
// student actually has access to the course.
export async function submitCourseReviewForStudent(
  studentId: string,
  input: { courseId: string; rating: number; comment: string }
): Promise<void> {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    throw new Error("Rating must be between 1 and 5.")
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId: input.courseId, studentId } },
  })
  if (!enrollment) throw new Error("You can only review a course you're enrolled in.")

  await prisma.courseReview.upsert({
    where: { courseId_studentId: { courseId: input.courseId, studentId } },
    create: { courseId: input.courseId, studentId, rating: input.rating, comment: input.comment.trim() || null },
    update: { rating: input.rating, comment: input.comment.trim() || null },
  })
}
