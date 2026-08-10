import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getStudentExams } from "@/lib/student/exams"
import { ExamsTabs } from "./exams-tabs"

export default async function StudentExamsPage() {
  const session = await auth()

  const student = await prisma.student.findUnique({
    where: { userId: session!.user.id },
  })

  if (!student) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
        <p className="text-muted-foreground">No student profile found for this account.</p>
      </div>
    )
  }

  const { available, scheduled, completed } = await getStudentExams(student.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
        <p className="text-muted-foreground mt-1">
          View and take your available assessments
        </p>
      </div>

      <ExamsTabs available={available} scheduled={scheduled} completed={completed} />
    </div>
  )
}
