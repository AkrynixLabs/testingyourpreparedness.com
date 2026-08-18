import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateMobileRequest } from "@/lib/mobile-auth"

// Backs the mobile course catalog's program filter - returns every active
// Program (not just ones with published courses), same "always show all 5,
// real or empty" behavior as the web catalog's filter, per the 2026-08-18
// course-taxonomy decision. Deliberately still auth-gated, matching every
// other mobile route - this app has no unauthenticated browsing at all.
export async function GET(request: Request) {
  const authUser = await authenticateMobileRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const programs = await prisma.program.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })
  return NextResponse.json({ programs })
}
