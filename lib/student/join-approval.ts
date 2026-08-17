// Approve/reject a school-code join request (added 2026-08-16). Closes a
// real gap found during a user walkthrough: a school's join code is a short,
// guessable string (a name-derived prefix + a 3-digit suffix, 900 possible
// values for a known school) with a rate-limited lookup but no other
// protection - previously joining created an instantly-active account with
// zero notice to the school, so anyone who knew or guessed the code could
// join unnoticed. createJoinedStudent (lib/student/join.ts) now creates the
// Student with status "pending" instead of "active" and emails the school;
// these two functions are what actually let a school admin resolve it.

import { prisma } from "@/lib/prisma"
import { sendEmailBestEffort } from "@/lib/email/resend"
import { joinRequestApprovedEmail, joinRequestRejectedEmail } from "@/lib/email/templates"

async function resolvePendingRequest(studentId: string, schoolAdminUserId: string) {
  const schoolAdmin = await prisma.schoolAdmin.findUnique({
    where: { userId: schoolAdminUserId },
    select: { schoolId: true },
  })
  if (!schoolAdmin) throw new Error("Not authorized")

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: true, school: { select: { name: true } } },
  })
  if (!student || student.schoolId !== schoolAdmin.schoolId) throw new Error("Not authorized")
  if (student.status !== "pending") throw new Error("This request has already been resolved.")

  return student
}

export async function approveJoinRequest(studentId: string, schoolAdminUserId: string) {
  const student = await resolvePendingRequest(studentId, schoolAdminUserId)

  await prisma.student.update({ where: { id: student.id }, data: { status: "active" } })

  const { subject, html } = joinRequestApprovedEmail({
    name: student.user.name,
    schoolName: student.school?.name ?? "your school",
  })
  await sendEmailBestEffort({ to: student.user.email, subject, html })

  await prisma.auditLog.create({
    data: {
      actorId: schoolAdminUserId,
      action: "approve",
      category: "school",
      description: `Approved join request: ${student.user.name}`,
      details: { type: "join_request", studentId: student.id, schoolId: student.schoolId },
    },
  })
}

// Hard-deletes the account (cascades via User.id) rather than just marking
// it rejected - a declined join request was never a real member of the
// school, so there's no reason to keep a User row with a real email/password
// sitting around. Email is sent *before* the delete since the row (and its
// email address) won't exist to read from afterward.
export async function rejectJoinRequest(studentId: string, schoolAdminUserId: string) {
  const student = await resolvePendingRequest(studentId, schoolAdminUserId)

  const { subject, html } = joinRequestRejectedEmail({
    name: student.user.name,
    schoolName: student.school?.name ?? "your school",
  })
  await sendEmailBestEffort({ to: student.user.email, subject, html })

  await prisma.auditLog.create({
    data: {
      actorId: schoolAdminUserId,
      action: "reject",
      category: "school",
      description: `Rejected join request: ${student.user.name}`,
      details: { type: "join_request", studentId: student.id, schoolId: student.schoolId },
    },
  })

  await prisma.user.delete({ where: { id: student.userId } })
}
