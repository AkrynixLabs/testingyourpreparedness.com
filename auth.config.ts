import type { NextAuthConfig } from "next-auth"
import type { Role } from "@/lib/generated/prisma/client"

// Split from auth.ts so proxy.ts (which runs on every request) can check a
// session without bundling Prisma/bcrypt - it never needs to touch the
// database, only verify the JWT. The Credentials provider itself (which does
// need Prisma) lives only in auth.ts, used by the API route handler.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    // Required for Credentials provider - it can't persist a database-backed
    // session record the way an OAuth provider with an adapter can.
    strategy: "jwt",
  },
  providers: [], // populated in auth.ts
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role
        session.user.id = token.id as string
      }
      return session
    },
  },
} satisfies NextAuthConfig
