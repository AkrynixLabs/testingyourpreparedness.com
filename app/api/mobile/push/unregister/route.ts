import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateMobileRequest } from "@/lib/mobile-auth"

// Called on logout - removes this device's token so a signed-out device
// stops receiving push for the account it just left. Deliberately scoped to
// the caller's own studentId in the delete filter (not just the token
// alone), even though a token is already globally unique - defense in
// depth, never lets an authenticated request delete a row it doesn't own.
export async function POST(request: Request) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const token = typeof body?.token === "string" ? body.token : null
  if (!token) {
    return NextResponse.json({ error: "token is required." }, { status: 400 })
  }

  const student = await prisma.student.findUnique({ where: { userId: authUser.id }, select: { id: true } })
  if (!student) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 })
  }

  await prisma.deviceToken.deleteMany({ where: { token, studentId: student.id } })

  return NextResponse.json({ success: true })
}
