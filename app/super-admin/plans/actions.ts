"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"

async function requireSuperAdmin() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") {
    throw new Error("Not authorized")
  }
  return session.user.id
}

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export type PlanInput = {
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  studentLimit: number | null
  features: string[]
  popular: boolean
}

export async function createPlan(input: PlanInput) {
  const actorId = await requireSuperAdmin()

  const name = input.name.trim()
  if (!name) throw new Error("Plan name is required.")
  if (input.monthlyPrice <= 0) throw new Error("Monthly price must be greater than zero.")

  const id = slugify(name)
  const existing = await prisma.subscriptionPlan.findUnique({ where: { id } })
  if (existing) throw new Error("A plan with that name already exists.")

  await prisma.subscriptionPlan.create({
    data: {
      id,
      audience: "school",
      name,
      monthlyPrice: input.monthlyPrice,
      yearlyPrice: input.yearlyPrice || null,
      studentLimit: input.studentLimit,
      features: input.features as unknown as Prisma.InputJsonValue,
      popular: input.popular,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "create",
      category: "billing",
      description: `Created subscription plan: ${name}`,
      details: { type: "subscription_plan", planId: id },
    },
  })

  revalidatePath("/super-admin/plans")
}

export async function updatePlan(planId: string, input: PlanInput) {
  const actorId = await requireSuperAdmin()

  const name = input.name.trim()
  if (!name) throw new Error("Plan name is required.")
  if (input.monthlyPrice <= 0) throw new Error("Monthly price must be greater than zero.")

  await prisma.subscriptionPlan.update({
    where: { id: planId },
    data: {
      name,
      monthlyPrice: input.monthlyPrice,
      yearlyPrice: input.yearlyPrice || null,
      studentLimit: input.studentLimit,
      features: input.features as unknown as Prisma.InputJsonValue,
      popular: input.popular,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "update",
      category: "billing",
      description: `Updated subscription plan: ${name}`,
      details: { type: "subscription_plan", planId },
    },
  })

  revalidatePath("/super-admin/plans")
}

export async function deletePlan(planId: string) {
  const actorId = await requireSuperAdmin()

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
    include: { _count: { select: { subscriptions: true } } },
  })
  if (!plan) throw new Error("Plan not found")
  if (plan._count.subscriptions > 0) {
    throw new Error("Cannot delete a plan with active subscribers")
  }

  await prisma.subscriptionPlan.delete({ where: { id: planId } })

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "delete",
      category: "billing",
      description: `Deleted subscription plan: ${plan.name}`,
      details: { type: "subscription_plan", planId },
    },
  })

  revalidatePath("/super-admin/plans")
}
