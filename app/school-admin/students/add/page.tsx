import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getSchoolStudentCapacity } from "@/lib/school/capacity"
import { AddStudentForm } from "./add-student-form"

export default async function AddStudentsPage() {
  const session = await auth()
  const schoolAdmin = await prisma.schoolAdmin.findUnique({
    where: { userId: session!.user.id },
    select: { schoolId: true },
  })
  if (!schoolAdmin) notFound()

  const [classes, capacity] = await Promise.all([
    prisma.class.findMany({
      where: { schoolId: schoolAdmin.schoolId },
      orderBy: { displayName: "asc" },
    }),
    getSchoolStudentCapacity(schoolAdmin.schoolId),
  ])

  return <AddStudentForm classes={classes} capacity={capacity} />
}
