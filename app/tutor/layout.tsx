import { auth } from "@/auth"
import { TutorShell } from "./tutor-shell"

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <TutorShell userName={session?.user?.name ?? "Tutor"} userEmail={session?.user?.email ?? ""}>
      {children}
    </TutorShell>
  )
}
