import net from "node:net"
import dns from "node:dns"
import { neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import ws from "ws"
import { PrismaClient } from "./generated/prisma/client"

// Neon's serverless driver needs a WebSocket implementation outside
// edge/browser/Node 22+ runtimes (this project's dev environment runs Node 20,
// which has no native `WebSocket` global) - same fix as prisma/seed.ts.
neonConfig.webSocketConstructor = ws

// This dev environment has no real IPv6 route. Node's default Happy-Eyeballs
// behavior (net.setDefaultAutoSelectFamily) races all resolved addresses -
// IPv4 and IPv6 - concurrently; the IPv6 attempts fail immediately with
// ENETUNREACH, and that burst was observed to make the IPv4 attempts time
// out too (~50% failure rate), even though a single isolated IPv4 connection
// always succeeds instantly. Forcing IPv4-only resolution and disabling the
// multi-address race fixed this completely (5/5 in testing, vs. frequent
// failures before). See CLAUDE.md for the full diagnosis.
net.setDefaultAutoSelectFamily(false)
dns.setDefaultResultOrder("ipv4first")

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
