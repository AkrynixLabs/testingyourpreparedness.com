import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PaymentMethodView } from "./payment-method-view"

export default async function PaymentMethodPage() {
  const session = await auth()
  const schoolAdmin = await prisma.schoolAdmin.findUnique({
    where: { userId: session!.user.id },
    select: { schoolId: true },
  })
  if (!schoolAdmin) notFound()

  const [school, paymentMethods] = await Promise.all([
    prisma.school.findUnique({ where: { id: schoolAdmin.schoolId } }),
    prisma.paymentMethod.findMany({ where: { schoolId: schoolAdmin.schoolId }, orderBy: { isDefault: "desc" } }),
  ])
  if (!school) notFound()

  return (
    <PaymentMethodView
      school={{ name: school.name, address: school.address, town: school.town, region: school.region }}
      paymentMethods={paymentMethods.map((m) => ({
        id: m.id,
        type: m.type,
        cardBrand: m.cardBrand,
        cardLast4: m.cardLast4,
        cardExpiry: m.cardExpiry,
        momoProvider: m.momoProvider,
        momoNumber: m.momoNumber,
        isDefault: m.isDefault,
      }))}
    />
  )
}
