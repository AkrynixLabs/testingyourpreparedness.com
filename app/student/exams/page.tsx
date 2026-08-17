import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getStudentExams } from "@/lib/student/exams"
import { FREE_TIER_MONTHLY_ATTEMPT_LIMIT } from "@/lib/student/entitlement"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Lock } from "lucide-react"
import { ExamsTabs } from "./exams-tabs"

export default async function StudentExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ blocked?: string }>
}) {
  const { blocked } = await searchParams
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

      {blocked === "free_tier_limit" && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>Free plan limit reached</AlertTitle>
          <AlertDescription>
            You&apos;ve used all {FREE_TIER_MONTHLY_ATTEMPT_LIMIT} free practice tests for this 30-day period.{" "}
            <Link href="/student/settings" className="underline underline-offset-2">
              Upgrade your plan
            </Link>{" "}
            for unlimited practice tests and detailed score reports.
          </AlertDescription>
        </Alert>
      )}

      <ExamsTabs available={available} scheduled={scheduled} completed={completed} />
    </div>
  )
}
