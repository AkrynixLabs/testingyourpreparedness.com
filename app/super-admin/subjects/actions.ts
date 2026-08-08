"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function requireSuperAdmin() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") {
    throw new Error("Not authorized")
  }
  return session.user.id
}

export async function createSubject(data: { programId: string; name: string; code: string }) {
  const actorId = await requireSuperAdmin()

  if (!data.programId || !data.name.trim() || !data.code.trim()) {
    throw new Error("Program, name, and code are required")
  }

  const subject = await prisma.subject.create({
    data: {
      programId: data.programId,
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "create",
      category: "content",
      description: `Created subject: ${subject.name}`,
      details: { type: "subject", subjectId: subject.id },
    },
  })

  revalidatePath("/super-admin/subjects")
}

export async function deleteSubject(subjectId: string) {
  const actorId = await requireSuperAdmin()

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: { _count: { select: { questions: true, assessments: true, studyMaterials: true, topics: true } } },
  })
  if (!subject) throw new Error("Subject not found")
  const { questions, assessments, studyMaterials, topics } = subject._count
  if (questions + assessments + studyMaterials + topics > 0) {
    throw new Error("Cannot delete a subject that has topics, questions, assessments, or study materials attached")
  }

  await prisma.subject.delete({ where: { id: subjectId } })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "delete",
      category: "content",
      description: `Deleted subject: ${subject.name}`,
      details: { type: "subject", subjectId },
    },
  })

  revalidatePath("/super-admin/subjects")
}

export async function createTopic(data: { subjectId: string; name: string }) {
  const actorId = await requireSuperAdmin()

  if (!data.subjectId || !data.name.trim()) {
    throw new Error("Subject and topic name are required")
  }

  const topic = await prisma.topic.create({
    data: { subjectId: data.subjectId, name: data.name.trim() },
    include: { subject: true },
  })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "create",
      category: "content",
      description: `Created topic "${topic.name}" in ${topic.subject.name}`,
      details: { type: "topic", topicId: topic.id },
    },
  })

  revalidatePath("/super-admin/subjects")
}

export async function deleteTopic(topicId: string) {
  const actorId = await requireSuperAdmin()

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { subject: true, _count: { select: { questions: true } } },
  })
  if (!topic) throw new Error("Topic not found")
  if (topic._count.questions > 0) {
    throw new Error("Cannot delete a topic that has questions attached")
  }

  await prisma.topic.delete({ where: { id: topicId } })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "delete",
      category: "content",
      description: `Deleted topic "${topic.name}" from ${topic.subject.name}`,
      details: { type: "topic", topicId },
    },
  })

  revalidatePath("/super-admin/subjects")
}
