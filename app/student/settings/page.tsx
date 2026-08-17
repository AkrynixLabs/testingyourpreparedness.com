import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getStudentTier } from "@/lib/student/entitlement"
import { StudentSettingsView } from "./settings-view"

export default async function StudentSettingsPage() {
  const session = await auth()
  const student = await prisma.student.findUnique({
    where: { userId: session!.user.id },
    include: { user: true, class: true, school: true, guardian: true, subscription: { include: { plan: true } } },
  })

  if (!student) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">No student profile found for this account.</p>
      </div>
    )
  }

  const { passwordHash: _passwordHash, ...safeUser } = student.user

  // Independent-student-only: subscription tab. School-provisioned students
  // have no personal billing (their school pays), so this stays null for
  // them and the view hides the tab entirely.
  let subscriptionInfo = null
  if (student.enrollmentType === "independent") {
    const tier = await getStudentTier(student)
    subscriptionInfo = {
      tier,
      planName: student.subscription?.plan.name ?? "Free",
      renewalDate: student.subscription?.renewalDate ?? null,
      plans: await prisma.subscriptionPlan.findMany({
        where: { audience: "independent", id: { not: "student-free" } },
        orderBy: { monthlyPrice: "asc" },
      }),
    }
  }

  return (
    <StudentSettingsView
      user={safeUser}
      schoolName={student.school?.name ?? null}
      className={student.class?.displayName ?? null}
      guardian={student.guardian}
      referralCode={student.referralCode}
      subscription={subscriptionInfo}
      studentId={student.id}
    />
  )
}
