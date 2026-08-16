import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateMobileRequest } from "@/lib/mobile-auth"

export async function GET(request: Request) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const student = await prisma.student.findUnique({
    where: { userId: authUser.id },
    include: { school: { select: { name: true } }, class: { select: { displayName: true } }, user: true },
  })
  if (!student) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 })
  }

  return NextResponse.json({
    id: student.id,
    name: authUser.name,
    email: authUser.email,
    enrollmentType: student.enrollmentType,
    schoolName: student.school?.name ?? null,
    className: student.class?.displayName ?? null,
    // Added 2026-08-16 alongside mobile account deletion - null unless a
    // deletion is currently pending, same field the web Settings page reads.
    scheduledDeletionAt: student.user.scheduledDeletionAt,
  })
}
