// Not a "use server" file - Next.js server action files can only export
// async functions, so this constant (shared between courses/actions.ts and
// tutors/actions.ts) has to live outside either of them.

// Marks a flagCourse call as part of the tutor-suspension cascade (see
// app/super-admin/tutors/actions.ts's setTutorStatus) rather than a
// moderator's own independent decision - lets reactivation later tell the
// two apart via each course's most recent AuditLog entry, so un-suspending a
// tutor only un-flags courses this cascade itself flagged, never a course a
// moderator separately flagged for an unrelated reason.
export const TUTOR_SUSPENSION_CASCADE_REASON = "Tutor account suspended"
