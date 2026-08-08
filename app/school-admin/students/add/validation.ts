// Shared between the bulk-import client preview and the bulkCreateStudents
// server action. The server re-validates independently - the client's
// valid/warning/error labels are a UX preview only, never trusted.

export type ClassOption = { id: string; displayName: string }

export type ParsedStudentRow = {
  name: string
  email: string
  class: string
  guardian: string
  guardian_phone: string
}

export type ValidatedStudentRow = {
  row: number
  parsed: ParsedStudentRow
  status: "valid" | "warning" | "error"
  issues: string[]
  resolvedClassId: string | null
  resolvedClassName: string | null
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, "_")
}

export function validateStudentRow(
  row: number,
  parsed: ParsedStudentRow,
  classes: ClassOption[],
  defaultClassId: string | null
): ValidatedStudentRow {
  const issues: string[] = []
  let status: "valid" | "warning" | "error" = "valid"

  if (!parsed.name.trim()) {
    issues.push("Name is empty.")
    status = "error"
  }

  const email = parsed.email.trim()
  if (!email) {
    issues.push("Email is empty.")
    status = "error"
  } else if (!EMAIL_RE.test(email)) {
    issues.push(`"${email}" doesn't look like a valid email.`)
    status = "error"
  }

  let resolvedClassId: string | null = null
  let resolvedClassName: string | null = null
  const classText = parsed.class.trim()
  if (classText) {
    const match = classes.find((c) => c.displayName.toLowerCase() === classText.toLowerCase())
    if (match) {
      resolvedClassId = match.id
      resolvedClassName = match.displayName
    } else {
      issues.push(`Class "${classText}" doesn't match any class at this school.`)
      status = "error"
    }
  } else if (defaultClassId) {
    const match = classes.find((c) => c.id === defaultClassId)
    if (match) {
      resolvedClassId = match.id
      resolvedClassName = match.displayName
    }
  } else {
    issues.push("No class in this row and no default class selected.")
    status = "error"
  }

  if (parsed.guardian.trim() && !parsed.guardian_phone.trim()) {
    if (status !== "error") status = "warning"
    issues.push("Guardian name given without a guardian phone number.")
  }

  return { row, parsed, status, issues, resolvedClassId, resolvedClassName }
}
