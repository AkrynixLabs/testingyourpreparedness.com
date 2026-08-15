"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendEmailBestEffort } from "@/lib/email/resend"
import { contentRejectedEmail } from "@/lib/email/templates"

async function requireSuperAdmin() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") {
    throw new Error("Not authorized")
  }
  return session.user.id
}

export async function approveQuestion(questionId: string) {
  const actorId = await requireSuperAdmin()

  const question = await prisma.question.update({
    where: { id: questionId },
    data: { status: "approved", reviewedById: actorId, rejectionReason: null },
    include: { subject: true },
  })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "approve",
      category: "content",
      description: `Approved question in ${question.subject.name}`,
      details: { type: "question", questionId },
    },
  })

  revalidatePath("/super-admin/review-queue")
}

export async function rejectQuestion(questionId: string, reason: string) {
  const actorId = await requireSuperAdmin()

  const question = await prisma.question.update({
    where: { id: questionId },
    data: { status: "rejected", reviewedById: actorId, rejectionReason: reason },
    include: { subject: true, createdBy: true },
  })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "reject",
      category: "content",
      description: `Rejected question in ${question.subject.name}`,
      details: { type: "question", questionId, reason },
    },
  })

  const { subject: emailSubject, html } = contentRejectedEmail({
    name: question.createdBy.name,
    contentType: "question",
    excerpt: question.text.length > 120 ? `${question.text.slice(0, 120)}...` : question.text,
    reason,
  })
  await sendEmailBestEffort({ to: question.createdBy.email, subject: emailSubject, html })

  revalidatePath("/super-admin/review-queue")
}

export async function bulkApproveQuestions(questionIds: string[]) {
  const actorId = await requireSuperAdmin()

  await prisma.question.updateMany({
    where: { id: { in: questionIds }, status: "pending" },
    data: { status: "approved", reviewedById: actorId, rejectionReason: null },
  })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "approve",
      category: "content",
      description: `Bulk-approved ${questionIds.length} question(s)`,
      details: { type: "question", questionIds },
    },
  })

  revalidatePath("/super-admin/review-queue")
}

// Assessment has no rejectionReason/reviewedBy column (unlike Question) - see
// docs/data-model.md. AuditLog.details is where the reason and reviewer
// actually live for assessments; the "review history" list on this page
// reads from AuditLog, not from Assessment's own fields.
export async function approveAssessment(assessmentId: string) {
  const actorId = await requireSuperAdmin()

  const assessment = await prisma.assessment.update({
    where: { id: assessmentId },
    data: { status: "published" },
    include: { subject: true },
  })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "approve",
      category: "content",
      description: `Approved & published assessment "${assessment.title}"`,
      details: { type: "assessment", assessmentId, title: assessment.title, subject: assessment.subject.name },
    },
  })

  revalidatePath("/super-admin/review-queue")
}

export async function rejectAssessment(assessmentId: string, reason: string) {
  const actorId = await requireSuperAdmin()

  const assessment = await prisma.assessment.update({
    where: { id: assessmentId },
    data: { status: "draft" },
    include: { subject: true, createdBy: true },
  })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "reject",
      category: "content",
      description: `Rejected assessment "${assessment.title}"`,
      details: { type: "assessment", assessmentId, title: assessment.title, subject: assessment.subject.name, reason },
    },
  })

  const { subject: emailSubject, html } = contentRejectedEmail({
    name: assessment.createdBy.name,
    contentType: "assessment",
    excerpt: assessment.title,
    reason,
  })
  await sendEmailBestEffort({ to: assessment.createdBy.email, subject: emailSubject, html })

  revalidatePath("/super-admin/review-queue")
}

export async function bulkApproveAssessments(assessmentIds: string[]) {
  const actorId = await requireSuperAdmin()

  await prisma.assessment.updateMany({
    where: { id: { in: assessmentIds }, status: "pending" },
    data: { status: "published" },
  })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "approve",
      category: "content",
      description: `Bulk-approved ${assessmentIds.length} assessment(s)`,
      details: { type: "assessment", assessmentIds },
    },
  })

  revalidatePath("/super-admin/review-queue")
}
