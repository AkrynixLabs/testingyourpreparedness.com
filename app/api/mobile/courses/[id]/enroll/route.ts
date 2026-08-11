import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { enrollInFreeCourseForStudent } from "@/lib/student/courses"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const student = await prisma.student.findUnique({ where: { userId: authUser.id } })
  if (!student) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 })
  }

  const { id } = await params
  try {
    const result = await enrollInFreeCourseForStudent(student.id, id)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not enroll."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
