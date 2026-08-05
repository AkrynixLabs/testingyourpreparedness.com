import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"
import { prisma } from "./lib/prisma"

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
      async authorize(credentials) {
        const email = credentials?.email
        const password = credentials?.password
        if (typeof email !== "string" || typeof password !== "string") {
          return null
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash)
        if (!passwordsMatch) return null

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
