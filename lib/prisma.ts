import { neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import ws from "ws"
import { PrismaClient } from "./generated/prisma/client"

// Neon's serverless driver needs a WebSocket implementation outside
// edge/browser/Node 22+ runtimes (this project's dev environment runs Node 20,
// which has no native `WebSocket` global) - same fix as prisma/seed.ts.
neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

// Reuse the client across hot-reloads in dev so `next dev` doesn't open a
// fresh Neon connection pool on every file change.
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
