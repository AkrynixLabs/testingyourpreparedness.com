"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { initializeTransaction } from "@/lib/payments/paystack"
import { generateCoursePurchaseId } from "@/lib/payments/ids"
import { getPlatformFeePercent } from "@/lib/platform-settings"

async function requireStudent() {
  const session = await auth()
  if (!session?.user || session.user.role !== "student") throw new Error("Not authorized")
  const student = await prisma.student.findUnique({ where: { userId: session.user.id } })
  if (!student) throw new Error("Not authorized")
  return { student, email: session.user.email! }
}

// Free courses (price = 0) skip Paystack entirely and enroll directly - same
// "don't call a payment provider for a GHS 0 charge" call already made for
// the student-free subscription plan in signup/independent.
export async function enrollInFreeCourse(courseId: string) {
  const { student } = await requireStudent()

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course || course.status !== "published") throw new Error("Course not available.")
  if (course.price !== 0) throw new Error("This course isn't free.")

  const existing = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId: student.id } },
  })
  if (existing) return { alreadyEnrolled: true }

  await prisma.enrollment.create({ data: { courseId, studentId: student.id } })
  return { alreadyEnrolled: false }
}

// Only creates a pending CoursePurchase and starts the Paystack transaction -
// same "registration/purchase and payment confirmation are separate steps"
// split used everywhere else in this app. The Enrollment is only created by
// the webhook once the charge actually succeeds (see
// app/api/webhooks/paystack/route.ts's handleCoursePurchaseSuccess) - a
// client-side redirect back to the callback page is never trusted alone.
export async function initializeCoursePurchase(courseId: string) {
  const { student, email } = await requireStudent()

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { tutor: true },
  })
  if (!course || course.status !== "published") throw new Error("Course not available.")
  if (course.price === 0) throw new Error("This course is free - use enrollInFreeCourse instead.")

  const existing = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId: student.id } },
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
      studentId: student.id,
      amount: course.price,
      platformFee,
      tutorPayout,
      status: "pending",
      paystackReference: purchaseId,
    },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const { authorizationUrl } = await initializeTransaction({
    email,
    amountGhs: course.price,
    reference: purchaseId,
    callbackUrl: `${appUrl}/student/courses/checkout/callback`,
    metadata: { courseId: course.id, studentId: student.id },
    // Only set when the tutor has completed Paystack subaccount setup
    // (app/tutor/settings's Payouts tab) - otherwise the full charge goes to
    // the platform's main account and platformFee/tutorPayout above are kept
    // as a record for manual reconciliation. transactionChargeGhs/bearer
    // force the actual Paystack split to match our own computed platformFee
    // exactly, rather than whatever default percentage_charge the
    // subaccount was created with (which can drift if the platform fee
    // changes later).
    subaccountCode: course.tutor.paystackSubaccountCode ?? undefined,
    transactionChargeGhs: course.tutor.paystackSubaccountCode ? platformFee : undefined,
    bearer: course.tutor.paystackSubaccountCode ? "subaccount" : undefined,
  })

  return { authorizationUrl }
}
