"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function deleteAssessment(assessmentId: string) {
  const session = await auth()
  if (session?.user?.role !== "content_admin") {
    throw new Error("Not authorized")
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { _count: { select: { assignments: true } } },
  })

  if (!assessment || assessment.createdById !== session.user.id) {
    throw new Error("Not authorized")
  }
  if (assessment.status !== "draft") {
    throw new Error("Only draft assessments can be deleted — submitted/published assessments must go through review, not deletion.")
  }
  if (assessment._count.assignments > 0) {
    throw new Error("Cannot delete an assessment that's already been assigned to a school.")
  }

  await prisma.assessment.delete({ where: { id: assessmentId } })
  revalidatePath("/content-admin/assessments")
}

export async function submitAssessmentForReview(assessmentId: string) {
  const session = await auth()
  if (session?.user?.role !== "content_admin") {
    throw new Error("Not authorized")
  }

  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } })

  if (!assessment || assessment.createdById !== session.user.id) {
    throw new Error("Not authorized")
  }
  if (assessment.status !== "draft") {
    throw new Error("Only draft assessments can be submitted for review.")
  }

  await prisma.assessment.update({
    where: { id: assessmentId },
    data: { status: "pending" },
  })
  revalidatePath("/content-admin/assessments")
}
