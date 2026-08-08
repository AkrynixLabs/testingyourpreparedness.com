import { prisma } from "@/lib/prisma"
import { CreateQuestionForm } from "./create-question-form"

export default async function CreateQuestionPage() {
  const subjects = await prisma.subject.findMany({
    include: { topics: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  })

  return <CreateQuestionForm subjects={subjects} />
}
