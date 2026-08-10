import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { getReportsData } from "@/lib/reports/generate"
import { ReportsView } from "./reports-view"

export default async function ReportsPage() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") notFound()

  const { regionDistribution, planDistribution, subjectPerformance } = await getReportsData()

  return (
    <ReportsView regionDistribution={regionDistribution} planDistribution={planDistribution} subjectPerformance={subjectPerformance} />
  )
}
