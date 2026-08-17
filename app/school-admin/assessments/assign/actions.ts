"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendEmailBestEffort } from "@/lib/email/resend"
import { assignmentNotificationEmail } from "@/lib/email/templates"
import { sendPushToStudentBestEffort } from "@/lib/push/fcm"

export type AssignAssessmentInput = {
  assessmentId: string
  assignmentType: "classes" | "students"
  classIds: string[]
  studentIds: string[]
  startDate: string // ISO
  endDate: string // ISO
  shuffleQuestions: boolean
  shuffleOptions: boolean
  showResults: boolean
  showAnswers: boolean
  passingScore: number | null
  allowRetake: boolean
  maxAttempts: number | null
  sendNotification: boolean
}

export async function createAssessmentAssignment(input: AssignAssessmentInput) {
  const session = await auth()
  if (session?.user?.role !== "school_admin") {
    throw new Error("Not authorized")
  }

  const schoolAdmin = await prisma.schoolAdmin.findUnique({
    where: { userId: session.user.id },
    select: { schoolId: true },
  })
  if (!schoolAdmin) throw new Error("Not authorized")

  const assessment = await prisma.assessment.findUnique({ where: { id: input.assessmentId } })
  if (!assessment || assessment.status !== "published") {
    throw new Error("This assessment isn't available to assign.")
  }

  const startDate = new Date(input.startDate)
  const endDate = new Date(input.endDate)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
    throw new Error("End date must be after the start date.")
  }

  const classIds = input.assignmentType === "classes" ? input.classIds : []
  const studentIds = input.assignmentType === "students" ? input.studentIds : []
  if (classIds.length === 0 && studentIds.length === 0) {
    throw new Error("Select at least one class or student.")
  }

  // Re-verify every target actually belongs to this admin's school - never
  // trust class/student ids supplied by the client at face value.
  if (classIds.length > 0) {
    const validClasses = await prisma.class.count({
      where: { id: { in: classIds }, schoolId: schoolAdmin.schoolId },
    })
    if (validClasses !== classIds.length) throw new Error("One or more classes are invalid.")
  }
  if (studentIds.length > 0) {
    const validStudents = await prisma.student.count({
      where: { id: { in: studentIds }, schoolId: schoolAdmin.schoolId },
    })
    if (validStudents !== studentIds.length) throw new Error("One or more students are invalid.")
  }

  const assignment = await prisma.assessmentAssignment.create({
    data: {
      assessmentId: input.assessmentId,
      schoolId: schoolAdmin.schoolId,
      startDate,
      endDate,
      status: "scheduled",
      shuffleQuestions: input.shuffleQuestions,
      shuffleOptions: input.shuffleOptions,
      showResults: input.showResults,
      showAnswers: input.showAnswers,
      passingScore: input.passingScore,
      allowRetake: input.allowRetake,
      maxAttempts: input.allowRetake ? input.maxAttempts : null,
      sendNotification: input.sendNotification,
      classes: { create: classIds.map((classId) => ({ classId })) },
      students: { create: studentIds.map((studentId) => ({ studentId })) },
    },
  })

  // sendNotification was a real stored boolean with nothing behind it until
  // now - resolve the actual set of affected students (direct targets plus
  // everyone in a targeted class) and email each one best-effort. Sent
  // sequentially, not batched - assignments target a bounded set of
  // students (one school's classes), nowhere near bulk-import's scale, so
  // this doesn't need the same "defer until background jobs exist" call.
  if (input.sendNotification) {
    const targetStudents = await prisma.student.findMany({
      where: {
        OR: [
          { id: { in: studentIds } },
          ...(classIds.length > 0 ? [{ classId: { in: classIds } }] : []),
        ],
      },
      include: { user: true },
    })
    for (const s of targetStudents) {
      const { subject, html } = assignmentNotificationEmail({
        studentName: s.user.name,
        assessmentTitle: assessment.title,
        startDate,
        endDate,
      })
      await sendEmailBestEffort({ to: s.user.email, subject, html })
      // Mobile push, same trigger/audience as the email above - scope
      // confirmed with the user 2026-08-16 as "exam-related only" for v1
      // (new exam assigned, results ready - see submitExamAttempt for the
      // other half). No-ops for a student with no registered device token.
      await sendPushToStudentBestEffort(s.id, {
        title: "New exam assigned",
        body: `${assessment.title} is now available - due ${endDate.toLocaleDateString("en-GB")}.`,
        data: { type: "exam_assigned", assessmentId: assessment.id },
      })
    }
  }

  revalidatePath("/school-admin/assessments")
  return { assignmentId: assignment.id }
}
