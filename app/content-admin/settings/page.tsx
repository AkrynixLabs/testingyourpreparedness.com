import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ContentSettingsView } from "./content-settings-view"

export default async function ContentSettingsPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } })
  const { passwordHash: _passwordHash, ...safeUser } = user!

  return <ContentSettingsView user={safeUser} />
}
