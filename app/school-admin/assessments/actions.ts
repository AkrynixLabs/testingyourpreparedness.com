"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function resolveAssignment(assignmentId: string, userId: string) {
  const schoolAdmin = await prisma.schoolAdmin.findUnique({ where: { userId }, select: { schoolId: true } })
  if (!schoolAdmin) throw new Error("Not authorized")

  const assignment = await prisma.assessmentAssignment.findUnique({ where: { id: assignmentId } })
  if (!assignment || assignment.schoolId !== schoolAdmin.schoolId) throw new Error("Not authorized")
  return assignment
}

export async function pauseAssignment(assignmentId: string) {
  const session = await auth()
  if (session?.user?.role !== "school_admin") throw new Error("Not authorized")
  const assignment = await resolveAssignment(assignmentId, session.user.id)
  if (assignment.status !== "active") throw new Error("Only an active assignment can be paused.")

  await prisma.assessmentAssignment.update({ where: { id: assignmentId }, data: { status: "paused" } })
  revalidatePath("/school-admin/assessments")
}

export async function resumeAssignment(assignmentId: string) {
  const session = await auth()
  if (session?.user?.role !== "school_admin") throw new Error("Not authorized")
  const assignment = await resolveAssignment(assignmentId, session.user.id)
  if (assignment.status !== "paused") throw new Error("Only a paused assignment can be resumed.")

  await prisma.assessmentAssignment.update({ where: { id: assignmentId }, data: { status: "active" } })
  revalidatePath("/school-admin/assessments")
}

export async function deleteAssignment(assignmentId: string) {
  const session = await auth()
  if (session?.user?.role !== "school_admin") throw new Error("Not authorized")
  await resolveAssignment(assignmentId, session.user.id)

  const attemptCount = await prisma.examAttempt.count({ where: { assignmentId } })
  if (attemptCount > 0) {
    throw new Error("Cannot delete an assignment that already has student attempts.")
  }

  // AssessmentAssignmentClass/Student both cascade on their assignment FK.
  await prisma.assessmentAssignment.delete({ where: { id: assignmentId } })
  revalidatePath("/school-admin/assessments")
}
