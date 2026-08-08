import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ResultsView } from "./results-view"

export default async function ResultsPage() {
  const session = await auth()
  const schoolAdmin = await prisma.schoolAdmin.findUnique({
    where: { userId: session!.user.id },
    select: { schoolId: true },
  })
  if (!schoolAdmin) notFound()

  const [students, classes, subjects] = await Promise.all([
    prisma.student.findMany({
      where: { schoolId: schoolAdmin.schoolId },
      select: {
        classId: true,
        class: { select: { displayName: true } },
        examAttempts: {
          where: { submittedAt: { not: null } },
          select: {
            score: true,
            totalMarks: true,
            submittedAt: true,
            answers: true,
            assessment: {
              select: {
                subject: { select: { id: true, name: true } },
                questions: {
                  select: {
                    question: {
                      select: { id: true, correctAnswerIndex: true, topic: { select: { name: true } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.class.findMany({ where: { schoolId: schoolAdmin.schoolId }, orderBy: [{ form: "asc" }, { section: "asc" }] }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ])

  const attempts = students.flatMap((s) =>
    s.examAttempts
      .filter((a) => a.score !== null && a.totalMarks)
      .map((a) => {
        const answers = a.answers as Record<string, number>
        const questionResults = a.assessment.questions.map((aq) => ({
          topicName: aq.question.topic.name,
          correct: answers[aq.question.id] === aq.question.correctAnswerIndex,
        }))
        return {
          classId: s.classId,
          className: s.class?.displayName ?? "No class",
          subjectId: a.assessment.subject.id,
          subjectName: a.assessment.subject.name,
          score: a.score!,
          totalMarks: a.totalMarks!,
          submittedAt: a.submittedAt!.toISOString(),
          questionResults,
        }
      })
  )

  return <ResultsView attempts={attempts} classes={classes} subjects={subjects} />
}
