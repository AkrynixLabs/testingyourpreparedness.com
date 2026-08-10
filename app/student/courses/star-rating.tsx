"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

// Read-only display, rounded to the nearest whole star - used for the
// catalog badge and each individual review's own rating. Average ratings
// aren't shown with partial-fill stars (e.g. "4.5 stars" as a half-filled
// star) to keep this simple; the exact number is always shown alongside it.
export function StarRatingDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  const rounded = Math.round(rating)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          width={size}
          height={size}
          className={n <= rounded ? "fill-amber-400 text-amber-400" : "fill-none text-muted-foreground/40"}
        />
      ))}
    </div>
  )
}

// Interactive 1-5 picker for a student submitting/editing their own review.
export function StarRatingInput({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          className="p-0.5"
        >
          <Star
            width={28}
            height={28}
            className={cn(n <= value ? "fill-amber-400 text-amber-400" : "fill-none text-muted-foreground/40", "transition-colors")}
          />
        </button>
      ))}
    </div>
  )
}
