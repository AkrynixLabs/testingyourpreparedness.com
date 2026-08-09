"use server"

import { prisma } from "@/lib/prisma"

// Real guardian approval, added 2026-08-08 - Guardian.approvedAt previously
// only ever came from the student's own self-attestation checkbox at
// signup, with no actual confirmation from the guardian. Re-verifies the
// token server-side rather than trusting whatever the page-load check
// already showed - same "never trust client-cached state for a write" rule
// as app/invite/accept's acceptInvitation.
export async function approveGuardianship(token: string) {
  const guardian = await prisma.guardian.findUnique({ where: { approvalToken: token } })
  if (!guardian) throw new Error("This approval link is invalid.")
  if (guardian.approvedAt) throw new Error("This registration has already been approved.")
  if (!guardian.approvalTokenExpiresAt || guardian.approvalTokenExpiresAt < new Date()) {
    throw new Error("This approval link has expired.")
  }

  await prisma.guardian.update({
    where: { id: guardian.id },
    // Cleared so the token can't be replayed, same as Invitation's status
    // flip to "accepted" - here there's no separate status enum, so nulling
    // the token itself is what prevents reuse.
    data: { approvedAt: new Date(), approvalToken: null, approvalTokenExpiresAt: null },
  })
}
