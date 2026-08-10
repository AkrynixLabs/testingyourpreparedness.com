import { encode, decode } from "next-auth/jwt"
import type { Role } from "@/lib/generated/prisma/client"

// The web app uses Auth.js cookie-based sessions, which a native app can't
// hold onto - there's no browser to store the cookie. Rather than inventing
// a parallel auth system with its own secret/algorithm to manage, this
// reuses Auth.js's own encode/decode (AUTH_SECRET, the same JWE algorithm
// auth.ts's cookie sessions already use) and just hands the encrypted token
// back in the response body instead of a Set-Cookie header. The mobile app
// stores it and sends it back as `Authorization: Bearer <token>` - the same
// header @auth/core's own getToken() already knows how to read.
const SALT = "authjs.session-token"
const MOBILE_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days - a signed-out phone app is a worse experience than a signed-out browser tab, so mobile sessions are intentionally longer-lived than the web default.

export type MobileTokenPayload = {
  id: string
  email: string
  name: string
  role: Role
}

function requireAuthSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured - required for both web sessions and mobile tokens.")
  }
  return secret
}

export async function signMobileToken(user: MobileTokenPayload): Promise<string> {
  const secret = requireAuthSecret()
  return encode({
    token: { sub: user.id, id: user.id, email: user.email, name: user.name, role: user.role },
    secret,
    salt: SALT,
    maxAge: MOBILE_TOKEN_MAX_AGE_SECONDS,
  })
}

export async function verifyMobileToken(token: string): Promise<MobileTokenPayload | null> {
  const secret = requireAuthSecret()
  try {
    const payload = await decode({ token, secret, salt: SALT })
    if (!payload?.id || !payload.email || !payload.role) return null
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: (payload.name as string) ?? "",
      role: payload.role as Role,
    }
  } catch {
    return null
  }
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization")
  if (!header?.startsWith("Bearer ")) return null
  return header.slice("Bearer ".length)
}

// Shared entry point for every app/api/mobile/** route - reads the
// Authorization header, verifies it, and returns the decoded user or null.
// Deliberately does NOT throw, so callers decide the exact 401 response
// shape rather than this helper dictating one.
export async function authenticateMobileRequest(request: Request): Promise<MobileTokenPayload | null> {
  const token = getBearerToken(request)
  if (!token) return null
  return verifyMobileToken(token)
}
