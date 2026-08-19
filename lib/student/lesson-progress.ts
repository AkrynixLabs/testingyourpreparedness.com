import { prisma } from "@/lib/prisma"
import { checkAndAwardAchievements } from "./achievements"

// Closes the "lesson-completion progress tracking is out of scope for now"
// gap noted when the course marketplace was first designed - built
// specifically so the student dashboard's study streak (lib/student/
// dashboard-stats.ts) can count "completed a lesson today" alongside
// "submitted an exam today," confirmed with the user first (2026-08-18).
// One function, two callers - the web Server Action and the mobile route
// both call this, not a second copy of the enrollment check/upsert.
export async function markLessonCompleteForStudent(studentId: string, lessonId: string): Promise<{ completedAt: Date }> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { courseId: true } } },
  })
  if (!lesson) throw new Error("Lesson not found.")

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId: lesson.module.courseId, studentId } },
  })
  if (!enrollment) throw new Error("Not enrolled in this course.")

  // Upsert, not create - re-marking an already-completed lesson is a no-op
  // (completedAt isn't bumped), matching the schema comment's own intent.
  const progress = await prisma.lessonProgress.upsert({
    where: { studentId_lessonId: { studentId, lessonId } },
    update: {},
    create: { studentId, lessonId },
  })

  // Fire from here (not left to the caller) so both the web action and the
  // mobile route get the same "a lesson can also complete an achievement"
  // behavior for free, same precedent as submitExamAttempt's own call site.
  await checkAndAwardAchievements(studentId)

  return { completedAt: progress.completedAt }
}

export async function getCompletedLessonIds(studentId: string, courseId: string): Promise<Set<string>> {
  const rows = await prisma.lessonProgress.findMany({
    where: { studentId, lesson: { module: { courseId } } },
    select: { lessonId: true },
  })
  return new Set(rows.map((r) => r.lessonId))
}
