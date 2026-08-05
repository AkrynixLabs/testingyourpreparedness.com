import { auth } from "@/auth"
import { SuperAdminShell } from "./super-admin-shell"

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <SuperAdminShell
      userName={session?.user?.name ?? "Super Admin"}
      userEmail={session?.user?.email ?? ""}
    >
      {children}
    </SuperAdminShell>
  )
}
