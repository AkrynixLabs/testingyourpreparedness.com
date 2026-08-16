import { NextResponse } from "next/server"
import { authenticateMobileRequest } from "@/lib/mobile-auth"
import { cancelAccountDeletion } from "@/lib/account-deletion"

export async function POST(request: Request) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await cancelAccountDeletion(authUser.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to cancel account deletion." },
      { status: 400 }
    )
  }
}
