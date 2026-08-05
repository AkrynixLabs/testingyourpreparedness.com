import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "./auth.config"

// Deliberately built on the edge-safe authConfig (no Prisma/bcrypt) rather
// than importing from auth.ts - proxy runs on every request, so it should
// only verify the JWT, never touch the database.
const { auth } = NextAuth(authConfig)

const ROLE_HOME: Record<string, string> = {
  super_admin: "/super-admin",
  content_admin: "/content-admin",
  school_admin: "/school-admin",
  student: "/student",
}

const PROTECTED_PREFIXES = Object.entries(ROLE_HOME)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const matchedPrefix = PROTECTED_PREFIXES.find(([, prefix]) => pathname.startsWith(prefix))

  if (!matchedPrefix) {
    // Not a role-gated route (public marketing pages, /login, /signup, etc.)
    return NextResponse.next()
  }

  const [requiredRole, prefix] = matchedPrefix

  if (!session?.user) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (session.user.role !== requiredRole) {
    // Signed in, but as the wrong role for this dashboard - send them to
    // their own dashboard instead of a confusing 403 or an infinite loop.
    const ownHome = ROLE_HOME[session.user.role] ?? "/login"
    return NextResponse.redirect(new URL(ownHome, req.url))
  }

  void prefix
  return NextResponse.next()
})

export const config = {
  matcher: [
    "/super-admin/:path*",
    "/content-admin/:path*",
    "/school-admin/:path*",
    "/student/:path*",
  ],
}
