import { prisma } from "@/lib/prisma"
import { IndependentSignupWizard } from "./independent-signup-wizard"

export default async function IndependentSignupPage() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { audience: "independent" },
    orderBy: { monthlyPrice: { sort: "asc", nulls: "first" } },
  })

  return <IndependentSignupWizard plans={plans} />
}
