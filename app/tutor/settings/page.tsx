import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { TutorSettingsView } from "./tutor-settings-view"

export default async function TutorSettingsPage() {
  const session = await auth()
  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId: session!.user.id },
    include: { user: true },
  })
  if (!tutor) notFound()

  // Never pass passwordHash across the RSC boundary, even unrendered - same
  // rule enforced on every other settings page in this project.
  const { passwordHash: _passwordHash, ...safeUser } = tutor.user

  return (
    <TutorSettingsView
      user={safeUser}
      tutorProfile={{
        headline: tutor.headline ?? "",
        bio: tutor.bio ?? "",
        expertiseAreas: (tutor.expertiseAreas as string[]) ?? [],
      }}
      paystackSubaccountCode={tutor.paystackSubaccountCode}
    />
  )
}
