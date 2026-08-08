"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

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

  revalidatePath("/super-admin/courses")
  revalidatePath(`/super-admin/courses/${courseId}`)
}
