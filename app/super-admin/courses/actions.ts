"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendEmailBestEffort } from "@/lib/email/resend"
import { courseModeratedEmail } from "@/lib/email/templates"
import { TUTOR_SUSPENSION_CASCADE_REASON } from "./constants"

async function requireSuperAdmin() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") {
    throw new Error("Not authorized")
  }
  return session.user.id
}

export async function flagCourse(courseId: string, reason: string) {
  const actorId = await requireSuperAdmin()

  const course = await prisma.course.update({
    where: { id: courseId },
    data: { status: "flagged" },
    include: { tutor: { include: { user: true } } },
  })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "update",
      category: "content",
      description: `Flagged course "${course.title}" by ${course.tutor.user.name}`,
      details: { type: "course", courseId, status: "flagged", reason },
    },
  })

  // Skip the individual per-course email when this flag is part of a tutor
  // suspension cascade (setTutorStatus in ../tutors/actions.ts) - that
  // action already sends its own "your account was suspended" email, and a
  // tutor with many published courses would otherwise get one email per
  // course on top of it.
  if (reason !== TUTOR_SUSPENSION_CASCADE_REASON) {
    const { subject, html } = courseModeratedEmail({
      tutorName: course.tutor.user.name,
      courseTitle: course.title,
      action: "flagged",
      reason,
    })
    await sendEmailBestEffort({ to: course.tutor.user.email, subject, html })
  }

  revalidatePath("/super-admin/courses")
  revalidatePath(`/super-admin/courses/${courseId}`)
}

export async function unflagCourse(courseId: string) {
  const actorId = await requireSuperAdmin()

  const course = await prisma.course.update({
    where: { id: courseId },
    data: { status: "published" },
    include: { tutor: { include: { user: true } } },
  })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "update",
      category: "content",
      description: `Unflagged course "${course.title}" by ${course.tutor.user.name}`,
      details: { type: "course", courseId, status: "published" },
    },
  })

  revalidatePath("/super-admin/courses")
  revalidatePath(`/super-admin/courses/${courseId}`)
}

export async function removeCourse(courseId: string, reason: string) {
  const actorId = await requireSuperAdmin()

  const course = await prisma.course.update({
    where: { id: courseId },
    data: { status: "removed" },
    include: { tutor: { include: { user: true } } },
  })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "update",
      category: "content",
      description: `Removed course "${course.title}" by ${course.tutor.user.name}`,
      details: { type: "course", courseId, status: "removed", reason },
    },
  })

  const { subject, html } = courseModeratedEmail({
    tutorName: course.tutor.user.name,
    courseTitle: course.title,
    action: "removed",
    reason,
  })
  await sendEmailBestEffort({ to: course.tutor.user.email, subject, html })

  revalidatePath("/super-admin/courses")
  revalidatePath(`/super-admin/courses/${courseId}`)
}
