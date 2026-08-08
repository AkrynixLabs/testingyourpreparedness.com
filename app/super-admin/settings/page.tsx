import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getPlatformFeePercent } from "@/lib/platform-settings"
import { SettingsView } from "./settings-view"

export default async function SuperAdminSettingsPage() {
  const session = await auth()
  const [user, platformFeePercent] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session!.user.id } }),
    getPlatformFeePercent(),
  ])
  const { passwordHash: _passwordHash, ...safeUser } = user

  return <SettingsView user={safeUser} platformFeePercent={platformFeePercent} />
}
