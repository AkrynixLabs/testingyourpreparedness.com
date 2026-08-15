// Shared input-sanitization helpers for this project's hand-rolled Server
// Action validation (no Zod is used here - see CLAUDE.md). A Server Action
// is still a real POST endpoint under the hood, so a null/undefined/wrong-type
// field must fail with the same clean "X is required" message the existing
// `if (!x) throw` checks already produce, not a raw TypeError from calling
// .trim()/.length/.map on something that isn't a string/array.

export function asString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

export function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []
}
