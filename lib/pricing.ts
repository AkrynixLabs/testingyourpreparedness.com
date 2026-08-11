export function planPriceAndPeriod(plan: { monthlyPrice: number | null; termPrice: number | null; yearlyPrice: number | null }) {
  if (plan.monthlyPrice !== null) return { price: plan.monthlyPrice, period: "month" }
  if (plan.termPrice !== null) return { price: plan.termPrice, period: "term" }
  if (plan.yearlyPrice !== null) return { price: plan.yearlyPrice, period: "year" }
  return { price: 0, period: null }
}
