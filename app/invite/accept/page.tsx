import { prisma } from "@/lib/prisma"
import { AcceptInvitationForm } from "./accept-invitation-form"

type InvitationState =
  | { status: "valid"; email: string; schoolName: string }
  | { status: "invalid" | "expired" | "used" }

async function resolveInvitation(token: string | undefined): Promise<InvitationState> {
  if (!token) return { status: "invalid" }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { school: { select: { name: true } } },
  })
  if (!invitation) return { status: "invalid" }
  if (invitation.status === "accepted") return { status: "used" }
  if (invitation.status === "expired" || invitation.expiresAt < new Date()) return { status: "expired" }

  return { status: "valid", email: invitation.email, schoolName: invitation.school.name }
}

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const invitation = await resolveInvitation(token)

  return <AcceptInvitationForm token={token ?? ""} invitation={invitation} />
}
