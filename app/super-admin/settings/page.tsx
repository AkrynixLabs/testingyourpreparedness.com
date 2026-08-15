import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getPlatformSettings } from "@/lib/platform-settings"
import { SettingsView } from "./settings-view"

export default async function SuperAdminSettingsPage() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") notFound()

  const [user, platformSettings] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session!.user.id } }),
    getPlatformSettings(),
  ])
  const { passwordHash: _passwordHash, ...safeUser } = user

  return (
    <SettingsView
      user={safeUser}
      platformFeePercent={platformSettings.platformFeePercent}
      platformName={platformSettings.platformName}
      supportEmail={platformSettings.supportEmail}
    />
  )
}
