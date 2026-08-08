import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ContentAdminShell } from "./content-admin-shell"

export default async function ContentAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const userId = session?.user?.id

  // Creator-scoped, matching "My Questions"/"Pending Approval"'s own real
  // scoping (content-admin/questions and .../pending) - "All Assessments" is
  // deliberately platform-wide here, matching that page's own real scope
  // (unlike questions, content-admin/assessments has no createdById filter).
  const [myQuestions, pendingApproval, allAssessments] = userId
    ? await Promise.all([
        prisma.question.count({ where: { createdById: userId } }),
        prisma.question.count({ where: { createdById: userId, status: "pending" } }),
        prisma.assessment.count(),
      ])
    : [0, 0, 0]

  return (
    <ContentAdminShell
      userName={session?.user?.name ?? "Content Admin"}
      userEmail={session?.user?.email ?? ""}
      counts={{ myQuestions, pendingApproval, allAssessments }}
    >
      {children}
    </ContentAdminShell>
  )
}
