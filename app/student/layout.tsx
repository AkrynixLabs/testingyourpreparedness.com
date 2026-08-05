import { auth } from "@/auth"
import { StudentShell } from "./student-shell"

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <StudentShell
      userName={session?.user?.name ?? "Student"}
      userEmail={session?.user?.email ?? ""}
    >
      {children}
    </StudentShell>
  )
}
