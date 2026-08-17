import { NextResponse } from "next/server"
import { processScheduledDeletions } from "@/lib/account-deletion"

// Daily Vercel Cron job (see vercel.json) that actually executes account
// deletions once their 30-day grace period has elapsed - the same "Vercel
// Cron, no new vendor" pattern and CRON_SECRET check as
// app/api/cron/weekly-reports/route.ts.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const { processed, skipped } = await processScheduledDeletions()
  return NextResponse.json({ processed, skipped })
}
