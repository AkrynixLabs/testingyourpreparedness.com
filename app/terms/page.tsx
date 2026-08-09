import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { LegalPlaceholderNotice } from "@/components/legal-placeholder-notice"

export default function TermsPage() {
  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground">
      <PublicHeader />

      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Terms of Service</h1>

            <LegalPlaceholderNotice policyName="Terms of Service" notBindingClause="a binding agreement" />

            <p className="text-muted-foreground leading-relaxed">
              We&apos;re working on finalizing our full Terms of Service, covering account registration, use of
              the platform by schools, students, tutors, and content administrators, subscription billing,
              acceptable use, intellectual property, and liability. Check back soon, or reach out via our contact
              page if you need specifics before then.
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
