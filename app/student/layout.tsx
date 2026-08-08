import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { StudentShell } from "./student-shell"

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const student = session?.user?.id
    ? await prisma.student.findUnique({ where: { userId: session.user.id } })
    : null

  const [availableExams, myCourses] = student
    ? await Promise.all([getAvailableExamsCount(student), prisma.enrollment.count({ where: { studentId: student.id } })])
    : [0, 0]

  return (
    <StudentShell
      userName={session?.user?.name ?? "Student"}
      userEmail={session?.user?.email ?? ""}
      counts={{ availableExams, myCourses }}
    >
      {children}
    </StudentShell>
  )
}

// This layout wraps every student page, so it deliberately does NOT
// reproduce student/exams's full eligibility engine (per-assignment
// attempt-limit checks) here - that would add real query cost to every
// single page load, not just the exams page. Approximates instead: for a
// school-provisioned student, counts active assignments within their date
// window without checking attemptsUsed/maxAttempts, so this can be a hair
// HIGHER than the real "available" list if a student has exhausted their
// attempts on an otherwise-open assignment. For an independent student it's
// exact (open access, no assignment/attempt concept at all - matches
// student/exams's own documented branch).
async function getAvailableExamsCount(student: { id: string; enrollmentType: string; schoolId: string | null; classId: string | null }) {
  if (student.enrollmentType === "school" && student.schoolId) {
    const now = new Date()
    return prisma.assessmentAssignment.count({
      where: {
        schoolId: student.schoolId,
        status: "active",
        startDate: { lte: now },
        endDate: { gte: now },
        OR: [
          { students: { some: { studentId: student.id } } },
          ...(student.classId ? [{ classes: { some: { classId: student.classId } } }] : []),
        ],
      },
    })
  }
  return prisma.assessment.count({ where: { status: "published" } })
}
