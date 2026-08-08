"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function resolveSchoolId(userId: string) {
  const schoolAdmin = await prisma.schoolAdmin.findUnique({ where: { userId }, select: { schoolId: true } })
  if (!schoolAdmin) throw new Error("Not authorized")
  return schoolAdmin.schoolId
}

export type CreateClassInput = {
  form: number
  section: string
  teacherName: string
  academicYear: string
}

export async function createClass(input: CreateClassInput) {
  const session = await auth()
  if (session?.user?.role !== "school_admin") throw new Error("Not authorized")
  const schoolId = await resolveSchoolId(session.user.id)

  if (input.form < 1 || input.form > 3) throw new Error("Form must be 1, 2, or 3.")
  const section = input.section.trim().toUpperCase()
  if (!section) throw new Error("Section is required.")
  const academicYear = input.academicYear.trim()
  if (!academicYear) throw new Error("Academic year is required.")

  const existing = await prisma.class.findUnique({
    where: { schoolId_form_section_academicYear: { schoolId, form: input.form, section, academicYear } },
  })
  if (existing) throw new Error(`Form ${input.form}${section} already exists for ${academicYear}.`)

  const cls = await prisma.class.create({
    data: {
      schoolId,
      form: input.form,
      section,
      displayName: `Form ${input.form}${section}`,
      teacherName: input.teacherName.trim() || null,
      academicYear,
    },
  })

  revalidatePath("/school-admin/classes")
  return { classId: cls.id }
}

export async function updateClassTeacher(classId: string, teacherName: string) {
  const session = await auth()
  if (session?.user?.role !== "school_admin") throw new Error("Not authorized")
  const schoolId = await resolveSchoolId(session.user.id)

  const cls = await prisma.class.findUnique({ where: { id: classId } })
  if (!cls || cls.schoolId !== schoolId) throw new Error("Not authorized")

  await prisma.class.update({ where: { id: classId }, data: { teacherName: teacherName.trim() || null } })
  revalidatePath("/school-admin/classes")
}

export async function deleteClass(classId: string) {
  const session = await auth()
  if (session?.user?.role !== "school_admin") throw new Error("Not authorized")
  const schoolId = await resolveSchoolId(session.user.id)

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    include: { _count: { select: { students: true } } },
  })
  if (!cls || cls.schoolId !== schoolId) throw new Error("Not authorized")
  if (cls._count.students > 0) {
    throw new Error("Cannot delete a class that still has students. Move or remove its students first.")
  }

  await prisma.class.delete({ where: { id: classId } })
  revalidatePath("/school-admin/classes")
}
