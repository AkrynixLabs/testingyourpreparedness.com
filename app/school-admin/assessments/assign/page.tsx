import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { AssignAssessmentWizard } from "./assign-assessment-wizard"

export default async function AssignAssessmentPage() {
  const session = await auth()

  // Tenant scoping: resolved server-side from the SchoolAdmin record, never
  // from a client-supplied schoolId - same pattern as school-admin/students.
  const schoolAdmin = await prisma.schoolAdmin.findUnique({
    where: { userId: session!.user.id },
    select: { schoolId: true },
  })
  if (!schoolAdmin) notFound()

  const [assessments, classes, students] = await Promise.all([
    prisma.assessment.findMany({
      where: { status: "published" },
      include: { subject: true, _count: { select: { questions: true } } },
      orderBy: { title: "asc" },
    }),
    prisma.class.findMany({
      where: { schoolId: schoolAdmin.schoolId },
      include: { _count: { select: { students: true } } },
      orderBy: { displayName: "asc" },
    }),
    prisma.student.findMany({
      where: { schoolId: schoolAdmin.schoolId },
      include: { user: true, class: true },
      orderBy: { user: { name: "asc" } },
    }),
  ])

  // Strip passwordHash off each student's nested user before crossing the
  // RSC boundary - found by a security audit 2026-08-08 (see docs/build-log.md).
  const safeStudents = students.map((s) => {
    const { passwordHash: _pwHash, ...safeUser } = s.user
    return { ...s, user: safeUser }
  })

  return <AssignAssessmentWizard assessments={assessments} classes={classes} students={safeStudents} />
}
