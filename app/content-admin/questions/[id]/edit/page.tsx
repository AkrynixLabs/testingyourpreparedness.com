import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { EditQuestionForm } from "./edit-question-form"

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (session?.user?.role !== "content_admin") notFound()

  const [question, subjects] = await Promise.all([
    prisma.question.findUnique({ where: { id } }),
    prisma.subject.findMany({ include: { topics: { orderBy: { name: "asc" } } }, orderBy: { name: "asc" } }),
  ])

  if (!question || question.createdById !== session.user.id) notFound()

  // Only draft/rejected are editable here - pending is mid-review (a super
  // admin is actively looking at the current version), and approved is
  // already live in assessments, where editing it out from under students
  // who may have already attempted it is a different, bigger problem than
  // this task's scope (see docs/build-log.md for the full reasoning).
  if (question.status !== "draft" && question.status !== "rejected") {
    redirect("/content-admin/questions")
  }

  return <EditQuestionForm question={question} subjects={subjects} />
}
