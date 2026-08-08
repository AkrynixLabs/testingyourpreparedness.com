import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { StudentSettingsView } from "./settings-view"

export default async function StudentSettingsPage() {
  const session = await auth()
  const student = await prisma.student.findUnique({
    where: { userId: session!.user.id },
    include: { user: true, class: true, school: true, guardian: true },
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

  return (
    <StudentSettingsView
      user={safeUser}
      schoolName={student.school?.name ?? null}
      className={student.class?.displayName ?? null}
      guardian={student.guardian}
    />
  )
}
