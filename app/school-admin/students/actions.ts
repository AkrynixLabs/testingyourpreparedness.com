"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { approveJoinRequest, rejectJoinRequest } from "@/lib/student/join-approval"

export async function approveStudentJoinRequest(studentId: string) {
  const session = await auth()
  if (session?.user?.role !== "school_admin") throw new Error("Not authorized")

  await approveJoinRequest(studentId, session.user.id)
  revalidatePath("/school-admin/students")
}

export async function rejectStudentJoinRequest(studentId: string) {
  const session = await auth()
  if (session?.user?.role !== "school_admin") throw new Error("Not authorized")

  await rejectJoinRequest(studentId, session.user.id)
  revalidatePath("/school-admin/students")
}
