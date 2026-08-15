import type { Metadata } from "next"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { CustomCursor } from "@/components/custom-cursor"
import { LegalPlaceholderNotice } from "@/components/legal-placeholder-notice"

// Thin placeholder content - kept out of the index until real policy text ships,
// same reasoning as /help below, so search engines don't rank an empty page.
export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Cookie Policy for TYP (Testing Your Preparedness).",
  alternates: { canonical: "/cookies" },
  robots: { index: false, follow: true },
}

// Same "pending legal review" framing as /terms and /privacy (not the
// lighter ComingSoonNotice used for pure marketing pages) - a cookie policy
// is legal-adjacent content, same reasoning as those two.
export default function CookiesPage() {
  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground">
      <CustomCursor />
      <PublicHeader />

      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Cookie Policy</h1>

            <LegalPlaceholderNotice
              policyName="Cookie Policy"
              notBindingClause="a binding description of our actual cookie usage"
            />

            <p className="text-muted-foreground leading-relaxed">
              We&apos;re working on finalizing our full Cookie Policy, covering what cookies we use, why, and how
              you can control them. Check back soon, or reach out via our contact page if you need specifics
              before then.
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
