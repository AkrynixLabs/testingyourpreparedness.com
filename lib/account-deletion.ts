// Self-service account deletion (student/tutor only), added 2026-08-15.
// Anonymizes rather than hard-deletes - see prisma/schema.prisma's own note
// on User.deletedAt for why (Course.tutorId/Enrollment.studentId are ON
// DELETE RESTRICT, and a real hard delete has real consequences for other
// people's data). A 30-day grace period between requestAccountDeletion and
// the daily cron (app/api/cron/process-account-deletions/route.ts) actually
// anonymizing the row, with a real cancelAccountDeletion in between.

import bcrypt from "bcryptjs"
import crypto from "node:crypto"
import { prisma } from "@/lib/prisma"
import { sendEmailBestEffort } from "@/lib/email/resend"
import {
  accountDeletionRequestedEmail,
  accountDeletionCancelledEmail,
  accountDeletedEmail,
} from "@/lib/email/templates"

export const DELETION_GRACE_DAYS = 30

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}

export async function requestAccountDeletion(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tutorProfile: { include: { courses: true } } },
  })
  if (!user) throw new Error("Not authorized")
  if (user.role !== "student" && user.role !== "tutor") {
    throw new Error("Account deletion isn't available for this role yet - contact us.")
  }
  if (user.deletionRequestedAt) throw new Error("Account deletion is already scheduled.")

  // Policy choice, not a technical requirement (anonymizing doesn't touch
  // Course rows) - a tutor with active students shouldn't be able to just
  // disappear without winding those courses down first. Only blocks on
  // live content (published/flagged), not already-removed courses.
  if (user.role === "tutor") {
    const liveCourses = (user.tutorProfile?.courses ?? []).filter(
      (c) => c.status === "published" || c.status === "flagged"
    )
    if (liveCourses.length > 0) {
      throw new Error(
        `You have ${liveCourses.length} active course${liveCourses.length === 1 ? "" : "s"}. Remove or unpublish ${liveCourses.length === 1 ? "it" : "them"} before deleting your account.`
      )
    }
  }

  const scheduledDeletionAt = new Date(Date.now() + DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000)
  await prisma.user.update({
    where: { id: userId },
    data: { deletionRequestedAt: new Date(), scheduledDeletionAt },
  })

  const { subject, html } = accountDeletionRequestedEmail({
    name: user.name,
    scheduledDate: formatDate(scheduledDeletionAt),
  })
  await sendEmailBestEffort({ to: user.email, subject, html })

  return { scheduledDeletionAt }
}

export async function cancelAccountDeletion(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error("Not authorized")
  if (!user.deletionRequestedAt) throw new Error("No deletion is currently scheduled.")

  await prisma.user.update({
    where: { id: userId },
    data: { deletionRequestedAt: null, scheduledDeletionAt: null },
  })

  const { subject, html } = accountDeletionCancelledEmail({ name: user.name })
  await sendEmailBestEffort({ to: user.email, subject, html })
}

// Called by the daily cron. Re-checks the tutor live-course rule
// defensively (in case a course was republished during the 30-day window,
// e.g. by a super admin un-flagging it) - anything still blocked is simply
// left scheduled for the next run rather than forced through.
export async function processScheduledDeletions(): Promise<{ processed: number; skipped: number }> {
  const due = await prisma.user.findMany({
    where: { scheduledDeletionAt: { lte: new Date() }, deletedAt: null },
    include: {
      tutorProfile: { include: { courses: true } },
      student: { include: { guardian: true } },
    },
  })

  let processed = 0
  let skipped = 0

  for (const user of due) {
    if (user.role === "tutor") {
      const liveCourses = (user.tutorProfile?.courses ?? []).filter(
        (c) => c.status === "published" || c.status === "flagged"
      )
      if (liveCourses.length > 0) {
        skipped++
        continue
      }
    }

    const { subject, html } = accountDeletedEmail({ name: user.name })
    await sendEmailBestEffort({ to: user.email, subject, html })

    const anonymizedEmail = `deleted-${user.id}@deleted.testingyourpreparedness.com`
    const inertPasswordHash = await bcrypt.hash(crypto.randomUUID(), 10)

    await prisma.$transaction(async (tx) => {
      if (user.student?.guardian) {
        await tx.guardian.delete({ where: { studentId: user.student.id } })
      }
      if (user.tutorProfile) {
        await tx.tutorProfile.update({
          where: { id: user.tutorProfile.id },
          data: { bio: null, headline: null, expertiseAreas: [] },
        })
      }
      if (user.student) {
        await tx.student.update({
          where: { id: user.student.id },
          data: { address: null, notes: null, dateOfBirth: null },
        })
      }
      await tx.user.update({
        where: { id: user.id },
        data: {
          name: "Deleted User",
          email: anonymizedEmail,
          avatar: null,
          passwordHash: inertPasswordHash,
          deletionRequestedAt: null,
          scheduledDeletionAt: null,
          deletedAt: new Date(),
        },
      })
    })

    await prisma.auditLog.create({
      data: {
        actorId: null,
        action: "delete",
        category: "user",
        description: `Anonymized account (self-requested deletion, role: ${user.role})`,
        details: { type: "account_deletion", userId: user.id, role: user.role },
      },
    })

    processed++
  }

  return { processed, skipped }
}
