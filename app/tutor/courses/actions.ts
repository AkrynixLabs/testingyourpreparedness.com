"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { LessonType } from "@/lib/generated/prisma/client"

async function requireTutor() {
  const session = await auth()
  if (!session?.user || session.user.role !== "tutor") throw new Error("Not authorized")
  const tutor = await prisma.tutorProfile.findUnique({ where: { userId: session.user.id } })
  if (!tutor) throw new Error("Not authorized")
  return tutor
}

export type CreateCourseInput = {
  title: string
  description: string
  category: string
  price: number
  thumbnailUrl: string
  modules: {
    title: string
    lessons: { title: string; type: LessonType; videoUrl: string; content: string }[]
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
    for (const l of m.lessons) {
      if (!l.title.trim()) throw new Error("Every lesson needs a title.")
      if (l.type === "video" && !l.videoUrl.trim()) throw new Error(`Lesson "${l.title}" needs a video URL.`)
      if (l.type === "article" && !l.content.trim()) throw new Error(`Lesson "${l.title}" needs content.`)
    }
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
            create: m.lessons.map((l, lIndex) => ({
              title: l.title.trim(),
              order: lIndex + 1,
              type: l.type,
              videoUrl: l.type === "video" ? l.videoUrl.trim() : null,
              content: l.type === "article" ? l.content.trim() : null,
            })),
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
  lessons: { title: string; type: LessonType; videoUrl: string; content: string }[]
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
  for (const l of input.lessons) {
    if (!l.title.trim()) throw new Error("Every lesson needs a title.")
    if (l.type === "video" && !l.videoUrl.trim()) throw new Error(`Lesson "${l.title}" needs a video URL.`)
    if (l.type === "article" && !l.content.trim()) throw new Error(`Lesson "${l.title}" needs content.`)
  }

  await prisma.module.create({
    data: {
      courseId: course.id,
      title,
      order: course._count.modules + 1,
      lessons: {
        create: input.lessons.map((l, lIndex) => ({
          title: l.title.trim(),
          order: lIndex + 1,
          type: l.type,
          videoUrl: l.type === "video" ? l.videoUrl.trim() : null,
          content: l.type === "article" ? l.content.trim() : null,
        })),
      },
    },
  })

  revalidatePath(`/tutor/courses/${input.courseId}`)
}
