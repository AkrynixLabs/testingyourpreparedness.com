import { headers } from "next/headers"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Vercel's serverless model means in-memory rate limiting doesn't work (no
// shared state across instances/regions) - Upstash Redis is the backend,
// confirmed with the user (see CLAUDE.md). Same "safe to ship without real
// keys" pattern as lib/payments/paystack.ts / lib/email/resend.ts: no client
// is built at all when the env vars are missing.
function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

const redis = getRedis()

// One named limiter per protected surface, tuned to how abuse actually looks
// for each: login needs the tightest window (credential stuffing is
// high-volume automated guessing), forgot-password next (repeated requests
// double as an email-enumeration/spam vector), signup/contact looser (a
// real human filling out a form slowly shouldn't get caught, but automated
// flooding still should).
const LIMITS = {
  login: { limit: 5, window: "5 m" as const },
  signup: { limit: 5, window: "1 h" as const },
  "forgot-password": { limit: 3, window: "15 m" as const },
  contact: { limit: 5, window: "1 h" as const },
  newsletter: { limit: 5, window: "1 h" as const },
} satisfies Record<string, { limit: number; window: `${number} ${"s" | "m" | "h"}` }>

export type RateLimitName = keyof typeof LIMITS

const limiters = new Map<RateLimitName, Ratelimit>()

function getLimiter(name: RateLimitName): Ratelimit | null {
  if (!redis) return null
  let limiter = limiters.get(name)
  if (!limiter) {
    const { limit, window } = LIMITS[name]
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `ratelimit:${name}`,
    })
    limiters.set(name, limiter)
  }
  return limiter
}

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number }

// Decision, stated explicitly per the task's own instruction: FAILS OPEN.
// If Upstash isn't configured (no real keys in this environment, same
// deliberate choice as Paystack/Resend) or a real Upstash call errors (an
// outage, a network blip), the request is allowed through rather than
// blocked. Reasoning: rate limiting here is a defense-in-depth layer on top
// of already-real validation (password checks, uniqueness checks, etc.) -
// it reduces the *rate* of abuse, it isn't the only thing standing between
// this app and a compromised account. A misconfigured or down rate limiter
// failing closed would mean a Redis outage silently takes down login/signup
// for every real user platform-wide - a strictly worse failure mode than
// "abuse protection is temporarily degraded to the same unprotected state
// this app has always shipped in prior to this task." Fail-closed would be
// the right call for something where the check itself IS the security
// boundary (e.g. an auth check) - it is not the right call for a rate
// limiter sitting in front of one.
export async function checkRateLimit(name: RateLimitName, identifier: string): Promise<RateLimitResult> {
  const limiter = getLimiter(name)
  if (!limiter) {
    return { allowed: true }
  }

  try {
    const result = await limiter.limit(identifier)
    if (result.success) return { allowed: true }
    return { allowed: false, retryAfterSeconds: Math.max(0, Math.ceil((result.reset - Date.now()) / 1000)) }
  } catch (err) {
    console.error(`[rate-limit] check failed for "${name}", failing open:`, err instanceof Error ? err.message : err)
    return { allowed: true }
  }
}

// Shared entry point for Server Actions (registerSchool, registerIndependentStudent,
// registerTutor, registerJoinedStudent, requestPasswordReset,
// submitContactMessage) - `headers()` from next/headers works inside a
// Server Action's own request context, same as in a Server Component.
// Throws a plain Error (the same "thrown Error -> client's existing
// try/catch -> shown as a form error" pattern already used for every other
// validation failure in this project) rather than returning a result object,
// so call sites need only one extra line, not a new error-handling branch.
export async function enforceRateLimit(name: RateLimitName): Promise<void> {
  const headersList = await headers()
  const ip = getClientIpFromHeaders((n) => headersList.get(n))
  const result = await checkRateLimit(name, ip)
  if (!result.allowed) {
    const minutes = Math.ceil(result.retryAfterSeconds / 60)
    throw new Error(`Too many attempts. Please try again in ${minutes <= 1 ? "a minute" : `${minutes} minutes`}.`)
  }
}

// `NextRequest.ip`/`geo` were removed in Next.js 15 (confirmed against this
// project's own bundled docs, per CLAUDE.md's standing warning not to
// assume the old API surface) - the client IP has to be read off the
// x-forwarded-for/x-real-ip headers Vercel's edge network sets, same as
// every other platform without a framework-level `.ip` shortcut.
export function getClientIpFromHeaders(getHeader: (name: string) => string | null): string {
  const forwardedFor = getHeader("x-forwarded-for")
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim()
    if (first) return first
  }
  const realIp = getHeader("x-real-ip")
  if (realIp) return realIp
  return "unknown"
}
