import { NextResponse } from "next/server"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { changePasswordForUser } from "@/lib/student/change-password"

// Mobile equivalent of the web Settings "Change Password" action (see
// app/student/settings/actions.ts's updatePassword, which calls the same
// shared lib/student/change-password.ts function) - same sibling pattern as
// app/api/mobile/account/delete. Closes a real gap: mobile had no way to
// change a password at all before this (confirmed with the user 2026-08-19).
export async function POST(request: Request) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : null
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : null
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Current and new password are required." }, { status: 400 })
  }

  try {
    await changePasswordForUser(authUser.id, currentPassword, newPassword)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not change your password." },
      { status: 400 }
    )
  }
}
