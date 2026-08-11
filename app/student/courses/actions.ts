"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import {
  enrollInFreeCourseForStudent,
  initializeCoursePurchaseForStudent,
  submitCourseReviewForStudent,
} from "@/lib/student/courses"

async function requireStudent() {
  const session = await auth()
  if (!session?.user || session.user.role !== "student") throw new Error("Not authorized")
  const student = await prisma.student.findUnique({ where: { userId: session.user.id } })
  if (!student) throw new Error("Not authorized")
  return { student, email: session.user.email! }
}

export async function enrollInFreeCourse(courseId: string) {
  const { student } = await requireStudent()
  return enrollInFreeCourseForStudent(student.id, courseId)
}

// Same "registration/purchase and payment confirmation are separate steps"
// split used everywhere else in this app - the Enrollment is only created by
// the webhook once the charge actually succeeds (see
// app/api/webhooks/paystack/route.ts's handleCoursePurchaseSuccess), a
// client-side redirect back to the callback page is never trusted alone.
export async function initializeCoursePurchase(courseId: string) {
  const { student, email } = await requireStudent()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const { authorizationUrl } = await initializeCoursePurchaseForStudent(
    student.id,
    email,
    courseId,
    `${appUrl}/student/courses/checkout/callback`
  )
  return { authorizationUrl }
}

export async function submitCourseReview(input: { courseId: string; rating: number; comment: string }) {
  const { student } = await requireStudent()
  return submitCourseReviewForStudent(student.id, input)
}
