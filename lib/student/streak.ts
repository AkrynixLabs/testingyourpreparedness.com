// Extracted so lib/student/achievements.ts can reuse the exact same
// consecutive-day-streak definition already used independently by
// app/student/page.tsx (via dashboard-stats.ts) and app/student/progress -
// a streak of N counts toward the "Study Streak" achievement.
export function computeStreak(submittedDates: Date[]): number {
  if (submittedDates.length === 0) return 0
  const days = Array.from(new Set(submittedDates.map((d) => d.toISOString().slice(0, 10)))).sort((a, b) =>
    a < b ? 1 : -1
  )
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const diffFromToday = Math.round((today.getTime() - new Date(days[0]).getTime()) / 86400000)
  if (diffFromToday > 1) return 0

  let streak = 1
  for (let i = 1; i < days.length; i++) {
    const diff = Math.round((new Date(days[i - 1]).getTime() - new Date(days[i]).getTime()) / 86400000)
    if (diff === 1) streak++
    else break
  }
  return streak
}

// Sliding window over submission timestamps - true if at least `n` of them
// fall within any `windowDays`-day span. Powers the "Quick Learner"
// achievement (10 exams within 7 days).
export function hasNInWindow(dates: Date[], n: number, windowDays: number): boolean {
  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime())
  const windowMs = windowDays * 24 * 60 * 60 * 1000
  let start = 0
  for (let end = 0; end < sorted.length; end++) {
    while (sorted[end].getTime() - sorted[start].getTime() > windowMs) start++
    if (end - start + 1 >= n) return true
  }
  return false
}
