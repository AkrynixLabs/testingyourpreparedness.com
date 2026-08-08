"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { StudyGoalUnit } from "@/lib/generated/prisma/client"

export async function createStudyGoal(input: { goal: string; unit: StudyGoalUnit; total: number; dueDate: string | null }) {
  const session = await auth()
  const student = await prisma.student.findUnique({ where: { userId: session!.user.id } })
  if (!student) throw new Error("Not authorized")

  const goal = input.goal.trim()
  if (!goal) throw new Error("Goal description is required.")
  if (!input.total || input.total < 1) throw new Error("Target must be at least 1.")

  await prisma.studyGoal.create({
    data: {
      studentId: student.id,
      goal,
      unit: input.unit,
      progress: 0,
      total: input.total,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    },
  })

  revalidatePath("/student/progress")
}
