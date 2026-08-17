import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"
import { prisma } from "./lib/prisma"
import { checkRateLimit, getClientIpFromHeaders } from "./lib/rate-limit"

// A distinct error `code` (vs. the generic "CredentialsSignin" every failed
// login already returns) so app/login/page.tsx can show a specific "too many
// attempts" message instead of implying the password was wrong.
class RateLimitedError extends CredentialsSignin {
  code = "rate_limited"
}

// Added 2026-08-16, alongside real school-code join approval - a student
// who joined via code but hasn't been approved yet must not be able to log
// in at all, not just see a degraded dashboard.
class PendingApprovalError extends CredentialsSignin {
  code = "pending_approval"
}

// Added 2026-08-17, ahead of a real public launch - a self-signup account
// (school registration, independent student, tutor, school-code join) can't
// log in until it clicks its emailed verification link (see
// prisma/schema.prisma's User.emailVerified). Admin-provisioned accounts
// (content admin, school-added student, an accepted Invitation) are created
// with emailVerified already true and never hit this - see that schema
// comment for the full reasoning.
class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified"
}

// Deliberately NOT using @auth/prisma-adapter: CLAUDE.md's decision is
// Auth.js against our own Postgres `User` table (already shaped for the
// 4-role model), not Auth.js's own Account/Session/VerificationToken schema
// - Credentials + JWT sessions need no adapter at all.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = credentials?.email
        const password = credentials?.password
        if (typeof email !== "string" || typeof password !== "string") {
          return null
        }

        const ip = getClientIpFromHeaders((name) => request.headers.get(name))
        const rateLimit = await checkRateLimit("login", ip)
        if (!rateLimit.allowed) {
          throw new RateLimitedError()
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null
        // Belt-and-suspenders alongside the anonymized email itself no
        // longer matching what anyone would type (see lib/account-deletion.ts) -
        // explicit here so this doesn't rely solely on that side effect.
        if (user.deletedAt) return null

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash)
        if (!passwordsMatch) return null

        // Checked only after the password is confirmed correct - revealing
        // "this account isn't verified/is pending" to someone who hasn't
        // proven they own it would leak account existence/state for free.
        if (!user.emailVerified) {
          throw new EmailNotVerifiedError()
        }

        if (user.role === "student") {
          const student = await prisma.student.findUnique({ where: { userId: user.id }, select: { status: true } })
          if (student?.status === "pending") {
            throw new PendingApprovalError()
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
})
