import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateMobileRequest } from "@/lib/mobile-auth"

// Registers/refreshes the calling device's FCM token, called on login and
// on every cold start (see mobile's PushNotificationService) - an upsert on
// the token itself (not on studentId), since FCM occasionally reissues a
// token (reinstall, token rotation) and the same physical device re-
// registering shouldn't create a second stale row. If the token somehow
// already belongs to a different student (e.g. two accounts used on the
// same device without logging out first), this reassigns it to the caller -
// correct, since a push should always go to whoever is signed in *now*, not
// whoever registered the token first.
export async function POST(request: Request) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const token = typeof body?.token === "string" ? body.token : null
  const platform = typeof body?.platform === "string" ? body.platform : null
  if (!token || !platform) {
    return NextResponse.json({ error: "token and platform are required." }, { status: 400 })
  }

  const student = await prisma.student.findUnique({ where: { userId: authUser.id }, select: { id: true } })
  if (!student) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 })
  }

  await prisma.deviceToken.upsert({
    where: { token },
    create: { token, platform, studentId: student.id },
    update: { studentId: student.id, platform },
  })

  return NextResponse.json({ success: true })
}
