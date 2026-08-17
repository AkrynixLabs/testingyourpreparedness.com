import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Compact nav-badge formatting (e.g. "1,240" stays as-is, "8700" -> "8.7K") -
// shared across every role shell's real Prisma-count badges.
export function formatCount(n: number): string {
  if (n < 1000) return n.toLocaleString()
  return `${(n / 1000).toFixed(1)}K`
}

// Strips any trailing slash(es) from a base URL. Found 2026-08-15: Vercel's
// NEXT_PUBLIC_APP_URL production value carries a trailing slash, which
// produced double-slash URLs (https://.../ + /path = https://...//path)
// everywhere it was naively string-concatenated with a leading-slash path -
// the sitemap, Paystack checkout callback URLs, and transactional email
// links all shared this exact bug. Apply at every NEXT_PUBLIC_APP_URL read
// site rather than relying on the env var itself always being trailing-slash-free.
export function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "")
}
