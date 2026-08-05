import { auth } from "@/auth"
import { SchoolAdminShell } from "./school-admin-shell"

export default async function SchoolAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <SchoolAdminShell
      userName={session?.user?.name ?? "School Admin"}
      userEmail={session?.user?.email ?? ""}
    >
      {children}
    </SchoolAdminShell>
  )
}
