"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { Role } from "@/lib/generated/prisma/client"

export type AcceptInvitationInput = {
  token: string
  name: string
  password: string
}

// Real invite redemption, added 2026-08-08 - Invitation previously had no
// way to actually be accepted (accepted/expired already existed on
// InvitationStatus with nothing that ever set them). Re-verifies the token
// server-side rather than trusting whatever the page-load check already
// showed - same "never trust client-cached state for a write" rule used
// everywhere else in this app (e.g. app/join's registerJoinedStudent
// re-verifying the school code).
export async function acceptInvitation(input: AcceptInvitationInput) {
  const name = input.name.trim()
  if (!name) throw new Error("Name is required.")
  if (input.password.length < 8) throw new Error("Password must be at least 8 characters.")

  const invitation = await prisma.invitation.findUnique({ where: { token: input.token } })
  if (!invitation) throw new Error("This invitation link is invalid.")
  if (invitation.status !== "pending") throw new Error("This invitation has already been used or cancelled.")
  if (invitation.expiresAt < new Date()) {
    await prisma.invitation.update({ where: { id: invitation.id }, data: { status: "expired" } })
    throw new Error("This invitation has expired. Ask your school administrator to send a new one.")
  }

  const existing = await prisma.user.findUnique({ where: { email: invitation.email } })
  if (existing) throw new Error("An account with that email already exists. Try logging in instead.")

  const passwordHash = await bcrypt.hash(input.password, 10)

  await prisma.$transaction([
    prisma.user.create({
      data: {
        name,
        email: invitation.email,
        passwordHash,
        role: Role.school_admin,
        schoolAdmin: {
          // Not primary - the inviting admin already holds that slot; this
          // just adds another regular admin to the same school.
          create: { schoolId: invitation.schoolId, isPrimary: false },
        },
      },
    }),
    prisma.invitation.update({ where: { id: invitation.id }, data: { status: "accepted" } }),
  ])

  return { email: invitation.email }
}
