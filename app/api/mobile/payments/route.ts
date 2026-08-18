import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { getStudentPaymentHistory } from "@/lib/student/payments"

// Backs the mobile app's Payments tab (Profile screen) - first client for
// lib/student/payments.ts, no web equivalent exists yet (see that file's
// own comment).
export async function GET(request: Request) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const student = await prisma.student.findUnique({ where: { userId: authUser.id } })
  if (!student) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 })
  }

  const history = await getStudentPaymentHistory(student.id)
  return NextResponse.json({ payments: history })
}
