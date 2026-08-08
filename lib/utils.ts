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
