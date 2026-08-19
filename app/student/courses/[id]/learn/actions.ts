"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { markLessonCompleteForStudent } from "@/lib/student/lesson-progress"

async function requireStudent() {
  const session = await auth()
  if (!session?.user || session.user.role !== "student") throw new Error("Not authorized")
  const student = await prisma.student.findUnique({ where: { userId: session.user.id } })
  if (!student) throw new Error("Not authorized")
  return student
}

export async function markLessonComplete(lessonId: string) {
  const student = await requireStudent()
  return markLessonCompleteForStudent(student.id, lessonId)
}
