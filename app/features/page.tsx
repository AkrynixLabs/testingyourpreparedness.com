import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { ComingSoonNotice } from "@/components/coming-soon-notice"

export default function FeaturesPage() {
  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground">
      <PublicHeader />

      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Features</h1>

            <ComingSoonNotice>
              We&apos;re still building a full features overview. In the meantime, here&apos;s what TYP already
              does.
            </ComingSoonNotice>

            <ul className="space-y-3 text-muted-foreground leading-relaxed list-disc pl-5">
              <li>Timed, auto-graded practice assessments for BECE, WASSCE, nursing, and university entrance exams</li>
              <li>A content pipeline where every question is reviewed and approved before it goes live</li>
              <li>Real-time results, progress tracking, and school leaderboards</li>
              <li>School and independent-student accounts, with guardian approval for independent students</li>
              <li>A course marketplace where independent tutors publish full video/reading courses</li>
            </ul>

            <p className="text-muted-foreground leading-relaxed mt-6">
              Want more detail before signing up? Reach out via our{" "}
              <a href="/contact" className="text-primary hover:underline">
                contact page
              </a>
              .
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
