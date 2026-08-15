"use server"

import { enforceRateLimit } from "@/lib/rate-limit"
import {
  lookupSchoolByCode,
  createJoinedStudent,
  type VerifiedSchool,
  type JoinedStudentInput,
} from "@/lib/student/join"

export type { VerifiedSchool }
export type RegisterJoinedStudentInput = JoinedStudentInput

// Rate-limited here (not just on registerJoinedStudent, which calls this)
// since a bare school-code lookup is itself the real abuse surface -
// School.code is a short, guessable string (see the earlier "join" build-log
// entry: it's not a rotatable/revocable secret), so unrestricted lookups
// would let an attacker brute-force valid codes. Both call paths share one
// "signup" bucket per IP.
export async function verifySchoolCode(code: string): Promise<VerifiedSchool> {
  await enforceRateLimit("signup")
  return lookupSchoolByCode(code)
}

export async function registerJoinedStudent(input: RegisterJoinedStudentInput) {
  await enforceRateLimit("signup")
  return createJoinedStudent(input)
}
