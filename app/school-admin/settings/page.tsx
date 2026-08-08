import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { SettingsView } from "./settings-view"

export default async function SettingsPage() {
  const session = await auth()
  const schoolAdmin = await prisma.schoolAdmin.findUnique({
    where: { userId: session!.user.id },
    select: { schoolId: true, isPrimary: true },
  })
  if (!schoolAdmin) notFound()

  const [school, admins, invitations, me] = await Promise.all([
    prisma.school.findUnique({ where: { id: schoolAdmin.schoolId } }),
    prisma.schoolAdmin.findMany({
      where: { schoolId: schoolAdmin.schoolId },
      include: { user: true },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    }),
    prisma.invitation.findMany({
      where: { schoolId: schoolAdmin.schoolId, status: "pending" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({ where: { id: session!.user.id } }),
  ])

  if (!school || !me) notFound()
  const { passwordHash: _passwordHash, ...safeMe } = me
  const safeAdmins = admins.map((admin) => {
    const { passwordHash: _adminPasswordHash, ...safeUser } = admin.user
    return { ...admin, user: safeUser }
  })

  return (
    <SettingsView
      school={school}
      admins={safeAdmins}
      invitations={invitations}
      isPrimary={schoolAdmin.isPrimary}
      me={safeMe}
    />
  )
}
