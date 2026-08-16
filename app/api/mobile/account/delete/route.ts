import { NextResponse } from "next/server"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { requestAccountDeletion } from "@/lib/account-deletion"

// Mobile equivalent of the web Settings "Delete My Account" action (see
// app/student/settings/actions.ts's deleteAccount, which calls the same
// shared lib/account-deletion.ts function). Mobile v1 is student-only, so
// this route only ever sees student accounts in practice - the shared
// function itself still supports tutor too, for when mobile grows a tutor
// role.
export async function POST(request: Request) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { scheduledDeletionAt } = await requestAccountDeletion(authUser.id)
    return NextResponse.json({ scheduledDeletionAt })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to schedule account deletion." },
      { status: 400 }
    )
  }
}
