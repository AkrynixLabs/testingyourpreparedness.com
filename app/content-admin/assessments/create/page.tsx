import { prisma } from "@/lib/prisma"
import { CreateAssessmentForm } from "./create-assessment-form"

export default async function CreateAssessmentPage() {
  const [subjects, questions] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.question.findMany({
      where: { status: "approved", isActive: true },
      include: { subject: true, topic: true },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return <CreateAssessmentForm subjects={subjects} questions={questions} />
}
