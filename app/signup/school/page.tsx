import { prisma } from "@/lib/prisma"
import { SchoolRegistrationWizard } from "./school-registration-wizard"

export default async function SchoolRegistrationPage() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { audience: "school" },
    orderBy: { monthlyPrice: "asc" },
  })

  return <SchoolRegistrationWizard plans={plans} />
}
