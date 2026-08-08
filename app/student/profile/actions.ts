"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function updateStudentProfile(input: { name: string; email: string }) {
  const session = await auth()
  const student = await prisma.student.findUnique({ where: { userId: session!.user.id } })
  if (!student) throw new Error("Not authorized")

  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  if (!name) throw new Error("Name is required.")
  if (!email) throw new Error("Email is required.")

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing && existing.id !== session!.user.id) {
    throw new Error("That email is already in use.")
  }

  await prisma.user.update({ where: { id: session!.user.id }, data: { name, email } })
  revalidatePath("/student/profile")
}
