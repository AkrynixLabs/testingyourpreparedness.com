"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createDirectUpload } from "@/lib/video/mux"
import { createRoom, deleteRoom } from "@/lib/video/daily"
import type { LessonType, VirtualSessionMode } from "@/lib/generated/prisma/client"

async function requireTutor() {
  const session = await auth()
  if (!session?.user || session.user.role !== "tutor") throw new Error("Not authorized")
  const tutor = await prisma.tutorProfile.findUnique({ where: { userId: session.user.id } })
  if (!tutor) throw new Error("Not authorized")
  return tutor
}

// Called when a tutor picks "Upload Video" for a lesson - the returned
// uploadUrl is where the browser PUTs the file bytes directly (Mux, never
// through our own server); uploadId is stored on the lesson draft and
// submitted with the rest of the form, matched back to the finished asset
// later by the Mux webhook (see app/api/webhooks/mux/route.ts).
export async function requestMuxUploadUrl() {
  await requireTutor()
  return createDirectUpload()
}

type LessonInput = {
  title: string
  type: LessonType
  videoUrl: string
  content: string
  // Set together when the tutor uploaded a file instead of pasting a URL -
  // see Lesson.videoSource/muxUploadId in prisma/schema.prisma.
  videoSource?: "external" | "mux"
  muxUploadId?: string
}

function validateLesson(l: LessonInput) {
  if (!l.title.trim()) throw new Error("Every lesson needs a title.")
  if (l.type === "video") {
    if (l.videoSource === "mux") {
      if (!l.muxUploadId) throw new Error(`Lesson "${l.title}"'s video upload hasn't finished yet.`)
    } else if (!l.videoUrl.trim()) {
      throw new Error(`Lesson "${l.title}" needs a video URL or an uploaded video.`)
    }
  }
  if (l.type === "article" && !l.content.trim()) throw new Error(`Lesson "${l.title}" needs content.`)
}

function lessonCreateData(l: LessonInput, order: number) {
  const isMux = l.type === "video" && l.videoSource === "mux"
  return {
    title: l.title.trim(),
    order,
    type: l.type,
    videoUrl: l.type === "video" && !isMux ? l.videoUrl.trim() : null,
    content: l.type === "article" ? l.content.trim() : null,
    videoSource: l.type === "video" ? (isMux ? ("mux" as const) : ("external" as const)) : null,
    muxUploadId: isMux ? l.muxUploadId : null,
    muxStatus: isMux ? ("preparing" as const) : null,
  }
}

export type CreateCourseInput = {
  title: string
  description: string
  category: string
  price: number
  thumbnailUrl: string
  modules: {
    title: string
    lessons: LessonInput[]
  }[]
}

// Publish-first: a new course goes live immediately, no draft/pending gate -
// matches the locked "publish-first, moderate-after" trust model, a real
// difference from Content Admin's Question/Assessment pipeline.
export async function createCourse(input: CreateCourseInput) {
  const tutor = await requireTutor()

  const title = input.title.trim()
  const description = input.description.trim()
  const category = input.category.trim()

  if (!title) throw new Error("Title is required.")
  if (!description) throw new Error("Description is required.")
  if (!category) throw new Error("Category is required.")
  if (!Number.isFinite(input.price) || input.price < 0) throw new Error("Price must be a non-negative number.")
  if (input.modules.length === 0) throw new Error("Add at least one module.")
  for (const m of input.modules) {
    if (!m.title.trim()) throw new Error("Every module needs a title.")
    if (m.lessons.length === 0) throw new Error(`Module "${m.title}" needs at least one lesson.`)
    for (const l of m.lessons) validateLesson(l)
  }

  const course = await prisma.course.create({
    data: {
      tutorId: tutor.id,
      title,
      description,
      category,
      price: Math.round(input.price),
      thumbnailUrl: input.thumbnailUrl.trim() || null,
      modules: {
        create: input.modules.map((m, mIndex) => ({
          title: m.title.trim(),
          order: mIndex + 1,
          lessons: {
            create: m.lessons.map((l, lIndex) => lessonCreateData(l, lIndex + 1)),
          },
        })),
      },
    },
  })

  revalidatePath("/tutor")
  revalidatePath("/tutor/courses")

  return { courseId: course.id }
}

// Guarded the same way as every other delete in this project: only allowed
// when nobody has enrolled - deleting a course with real students/purchases
// would silently orphan their access, not something to let happen from a
// simple delete button.
export async function deleteCourse(courseId: string) {
  const tutor = await requireTutor()

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { _count: { select: { enrollments: true } } },
  })
  if (!course || course.tutorId !== tutor.id) throw new Error("Not authorized")
  if (course._count.enrollments > 0) throw new Error("Cannot delete a course with enrolled students.")

  await prisma.course.delete({ where: { id: courseId } })

  revalidatePath("/tutor")
  revalidatePath("/tutor/courses")
}

export type AddModuleInput = {
  courseId: string
  title: string
  lessons: LessonInput[]
}

// Lets a tutor extend an already-published course with more content -
// publish-first doesn't mean "frozen at creation," a real course grows over
// time the same way it would on any course marketplace.
export async function addModule(input: AddModuleInput) {
  const tutor = await requireTutor()

  const course = await prisma.course.findUnique({
    where: { id: input.courseId },
    include: { _count: { select: { modules: true } } },
  })
  if (!course || course.tutorId !== tutor.id) throw new Error("Not authorized")

  const title = input.title.trim()
  if (!title) throw new Error("Title is required.")
  if (input.lessons.length === 0) throw new Error("Add at least one lesson.")
  for (const l of input.lessons) validateLesson(l)

  await prisma.module.create({
    data: {
      courseId: course.id,
      title,
      order: course._count.modules + 1,
      lessons: {
        create: input.lessons.map((l, lIndex) => lessonCreateData(l, lIndex + 1)),
      },
    },
  })

  revalidatePath(`/tutor/courses/${input.courseId}`)
}

// ---------------------------------------------------------------------------
// Virtual sessions (added 2026-08-17, confirmed with the user) - course-
// scoped group sessions, not 1:1 bookings: every student enrolled in the
// course can join, matching how course access already works (per-course
// Enrollment, no fixed roster).
// ---------------------------------------------------------------------------

export type ScheduleVirtualSessionInput = {
  courseId: string
  title: string
  description: string
  scheduledAt: string // ISO
  durationMinutes: number
  mode: VirtualSessionMode
  externalMeetingUrl: string // required when mode = external_link, ignored otherwise
}

export async function scheduleVirtualSession(input: ScheduleVirtualSessionInput) {
  const tutor = await requireTutor()

  const course = await prisma.course.findUnique({ where: { id: input.courseId } })
  if (!course || course.tutorId !== tutor.id) throw new Error("Not authorized")

  const title = input.title.trim()
  if (!title) throw new Error("Title is required.")
  const scheduledAt = new Date(input.scheduledAt)
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now() - 60_000) {
    throw new Error("Pick a valid future date/time.")
  }
  if (!Number.isFinite(input.durationMinutes) || input.durationMinutes <= 0) {
    throw new Error("Duration must be a positive number of minutes.")
  }

  let dailyRoomName: string | null = null
  let dailyRoomUrl: string | null = null
  let externalMeetingUrl: string | null = null

  if (input.mode === "daily") {
    dailyRoomName = `session-${crypto.randomUUID()}`
    const expiresAt = new Date(scheduledAt.getTime() + (input.durationMinutes + 60) * 60_000) // buffer past scheduled end
    const room = await createRoom({ name: dailyRoomName, expiresAt })
    dailyRoomUrl = room.roomUrl
  } else {
    externalMeetingUrl = input.externalMeetingUrl.trim()
    if (!externalMeetingUrl) throw new Error("A meeting link is required.")
  }

  await prisma.virtualSession.create({
    data: {
      courseId: course.id,
      title,
      description: input.description.trim() || null,
      scheduledAt,
      durationMinutes: Math.round(input.durationMinutes),
      mode: input.mode,
      dailyRoomName,
      dailyRoomUrl,
      externalMeetingUrl,
    },
  })

  revalidatePath(`/tutor/courses/${input.courseId}`)
}

export async function cancelVirtualSession(sessionId: string) {
  const tutor = await requireTutor()

  const session = await prisma.virtualSession.findUnique({
    where: { id: sessionId },
    include: { course: true },
  })
  if (!session || session.course.tutorId !== tutor.id) throw new Error("Not authorized")

  if (session.mode === "daily" && session.dailyRoomName) {
    await deleteRoom(session.dailyRoomName)
  }
  await prisma.virtualSession.update({ where: { id: sessionId }, data: { status: "cancelled" } })

  revalidatePath(`/tutor/courses/${session.courseId}`)
}
