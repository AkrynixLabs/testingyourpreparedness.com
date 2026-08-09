import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { LegalPlaceholderNotice } from "@/components/legal-placeholder-notice"

export default function PrivacyPage() {
  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground">
      <PublicHeader />

      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Privacy Policy</h1>

            <LegalPlaceholderNotice
              policyName="Privacy Policy"
              notBindingClause="a binding description of our actual data practices"
            />

            <p className="text-muted-foreground leading-relaxed">
              We&apos;re working on finalizing our full Privacy Policy, covering what data we collect (from
              schools, students, guardians, tutors, and content administrators), how it&apos;s used and stored,
              third-party services we rely on (payment processing, email delivery), and your rights over your own
              data. Check back soon, or reach out via our contact page if you need specifics before then.
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
