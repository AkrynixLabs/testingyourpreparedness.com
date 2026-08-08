"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function resolveSchoolId() {
  const session = await auth()
  if (session?.user?.role !== "school_admin") throw new Error("Not authorized")
  const schoolAdmin = await prisma.schoolAdmin.findUnique({ where: { userId: session.user.id }, select: { schoolId: true } })
  if (!schoolAdmin) throw new Error("Not authorized")
  return schoolAdmin.schoolId
}

export async function setDefaultPaymentMethod(paymentMethodId: string) {
  const schoolId = await resolveSchoolId()

  const method = await prisma.paymentMethod.findUnique({ where: { id: paymentMethodId } })
  if (!method || method.schoolId !== schoolId) throw new Error("Not authorized")

  await prisma.$transaction([
    prisma.paymentMethod.updateMany({ where: { schoolId }, data: { isDefault: false } }),
    prisma.paymentMethod.update({ where: { id: paymentMethodId }, data: { isDefault: true } }),
  ])
  revalidatePath("/school-admin/subscription/payment-method")
}

export async function deletePaymentMethod(paymentMethodId: string) {
  const schoolId = await resolveSchoolId()

  const method = await prisma.paymentMethod.findUnique({ where: { id: paymentMethodId } })
  if (!method || method.schoolId !== schoolId) throw new Error("Not authorized")

  await prisma.paymentMethod.delete({ where: { id: paymentMethodId } })

  // If the deleted method was the default and others remain, promote one.
  if (method.isDefault) {
    const remaining = await prisma.paymentMethod.findFirst({ where: { schoolId } })
    if (remaining) {
      await prisma.paymentMethod.update({ where: { id: remaining.id }, data: { isDefault: true } })
    }
  }
  revalidatePath("/school-admin/subscription/payment-method")
}
