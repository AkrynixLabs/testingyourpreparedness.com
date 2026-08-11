import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { getCourseDetail } from "@/lib/student/courses"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const student = await prisma.student.findUnique({ where: { userId: authUser.id } })
  const { id } = await params
  const course = await getCourseDetail(id, student?.id ?? null)
  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 })
  }

  return NextResponse.json(course)
}
