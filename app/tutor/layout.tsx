import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { TutorShell } from "./tutor-shell"

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const tutor = session?.user?.id
    ? await prisma.tutorProfile.findUnique({ where: { userId: session.user.id } })
    : null
  const myCourses = tutor ? await prisma.course.count({ where: { tutorId: tutor.id } }) : 0

  return (
    <TutorShell userName={session?.user?.name ?? "Tutor"} userEmail={session?.user?.email ?? ""} counts={{ myCourses }}>
      {children}
    </TutorShell>
  )
}
