import { prisma } from "@/lib/prisma"
import { GuardianApproveForm } from "./guardian-approve-form"

type ApprovalState =
  | { status: "valid"; guardianName: string; studentName: string }
  | { status: "invalid" | "expired" | "used" }

async function resolveApproval(token: string | undefined): Promise<ApprovalState> {
  if (!token) return { status: "invalid" }

  const guardian = await prisma.guardian.findUnique({
    where: { approvalToken: token },
    include: { student: { include: { user: true } } },
  })
  if (!guardian) return { status: "invalid" }
  if (guardian.approvedAt) return { status: "used" }
  if (!guardian.approvalTokenExpiresAt || guardian.approvalTokenExpiresAt < new Date()) return { status: "expired" }

  return { status: "valid", guardianName: guardian.name, studentName: guardian.student.user.name }
}

export default async function GuardianApprovePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const approval = await resolveApproval(token)

  return <GuardianApproveForm token={token ?? ""} approval={approval} />
}
