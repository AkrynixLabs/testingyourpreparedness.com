import { auth } from "@/auth"
import { ContentAdminShell } from "./content-admin-shell"

export default async function ContentAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <ContentAdminShell
      userName={session?.user?.name ?? "Content Admin"}
      userEmail={session?.user?.email ?? ""}
    >
      {children}
    </ContentAdminShell>
  )
}
