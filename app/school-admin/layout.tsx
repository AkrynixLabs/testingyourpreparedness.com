import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { SchoolAdminShell } from "./school-admin-shell"

export default async function SchoolAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const schoolAdmin = session?.user?.id
    ? await prisma.schoolAdmin.findUnique({ where: { userId: session.user.id }, select: { schoolId: true } })
    : null

  // Tenant-scoped to this admin's own school, same resolution pattern as
  // every other school-admin page (never trust a client-supplied schoolId).
  const [allStudents, classes, assignedTests, flaggedAttempts] = schoolAdmin
    ? await Promise.all([
        prisma.student.count({ where: { schoolId: schoolAdmin.schoolId } }),
        prisma.class.count({ where: { schoolId: schoolAdmin.schoolId } }),
        prisma.assessmentAssignment.count({ where: { schoolId: schoolAdmin.schoolId } }),
        // Same definition as app/school-admin/flagged-attempts's own
        // "Flagged for Review" stat, not the looser "any tab switch" one -
        // matches this file's existing nav-badge convention of reusing the
        // destination page's own real count.
        prisma.examAttempt.count({ where: { student: { schoolId: schoolAdmin.schoolId }, flaggedForReview: true } }),
      ])
    : [0, 0, 0, 0]

  return (
    <SchoolAdminShell
      userName={session?.user?.name ?? "School Admin"}
      userEmail={session?.user?.email ?? ""}
      counts={{ allStudents, classes, assignedTests, flaggedAttempts }}
    >
      {children}
    </SchoolAdminShell>
  )
}
