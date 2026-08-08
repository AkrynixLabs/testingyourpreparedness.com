"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { TutorStatus } from "@/lib/generated/prisma/client"
import { flagCourse, unflagCourse } from "../courses/actions"
import { TUTOR_SUSPENSION_CASCADE_REASON } from "../courses/constants"

async function requireSuperAdmin() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") {
    throw new Error("Not authorized")
  }
  return session.user.id
}

export async function setTutorStatus(tutorId: string, status: TutorStatus) {
  const actorId = await requireSuperAdmin()

  const tutor = await prisma.tutorProfile.update({
    where: { id: tutorId },
    data: { status },
    include: { user: true, courses: true },
  })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "update",
      category: "content",
      description: `${status === "suspended" ? "Suspended" : "Reactivated"} tutor ${tutor.user.name}`,
      details: { type: "tutor", tutorId, status },
    },
  })

  // Decided 2026-08-08: suspending a tutor cascades to their courses - flag
  // every currently-published one (reversible, not the stronger "removed")
  // so it stops surfacing in the catalog while they're suspended. Reuses
  // flagCourse/unflagCourse's own write + AuditLog shape rather than
  // duplicating the logic here.
  if (status === "suspended") {
    for (const course of tutor.courses.filter((c) => c.status === "published")) {
      await flagCourse(course.id, TUTOR_SUSPENSION_CASCADE_REASON)
    }
  } else {
    // Only auto-unflag a course if THIS cascade was the last thing to touch
    // it - never a course a moderator separately flagged for an unrelated
    // reason. Determined per-course from AuditLog (the same "AuditLog as
    // source of truth for review history" pattern already used for
    // Question/Assessment), not a stored field on Course.
    for (const course of tutor.courses.filter((c) => c.status === "flagged")) {
      const latestLog = await prisma.auditLog.findFirst({
        where: {
          category: "content",
          AND: [
            { details: { path: ["type"], equals: "course" } },
            { details: { path: ["courseId"], equals: course.id } },
          ],
        },
        orderBy: { timestamp: "desc" },
      })
      const details = latestLog?.details as { reason?: string; status?: string } | null
      if (details?.status === "flagged" && details.reason === TUTOR_SUSPENSION_CASCADE_REASON) {
        await unflagCourse(course.id)
      }
    }
  }

  revalidatePath("/super-admin/tutors")
  revalidatePath(`/super-admin/tutors/${tutorId}`)
}
