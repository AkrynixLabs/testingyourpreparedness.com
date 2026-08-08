import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PendingApprovalView } from "./pending-approval-view"

export default async function PendingApprovalPage() {
  const session = await auth()

  const [pendingQuestions, reviewedQuestions] = await Promise.all([
    prisma.question.findMany({
      where: { createdById: session!.user.id, status: "pending" },
      include: { subject: true, topic: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.question.findMany({
      where: { createdById: session!.user.id, status: { in: ["approved", "rejected"] } },
      include: { subject: true, topic: true, reviewedBy: true },
      orderBy: { updatedAt: "desc" },
    }),
  ])

  const approvedCount = reviewedQuestions.filter((q) => q.status === "approved").length
  const rejectedCount = reviewedQuestions.filter((q) => q.status === "rejected").length

  const reviewDurationsMs = reviewedQuestions.map((q) => q.updatedAt.getTime() - q.createdAt.getTime())
  const avgReviewDays =
    reviewDurationsMs.length > 0
      ? (reviewDurationsMs.reduce((sum, ms) => sum + ms, 0) / reviewDurationsMs.length / (1000 * 60 * 60 * 24)).toFixed(1)
      : null

  return (
    <PendingApprovalView
      pendingQuestions={pendingQuestions}
      reviewedQuestions={reviewedQuestions}
      stats={{ approvedCount, rejectedCount, avgReviewDays }}
    />
  )
}
