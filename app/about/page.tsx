import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { ComingSoonNotice } from "@/components/coming-soon-notice"

export default function AboutPage() {
  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground">
      <PublicHeader />

      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">About TYP</h1>

            <ComingSoonNotice>
              We&apos;re still writing our full About page. In the meantime, here&apos;s the short version.
            </ComingSoonNotice>

            <p className="text-muted-foreground leading-relaxed">
              TYP (Testing Your Preparedness) is Ghana&apos;s all-in-one exam-prep and digital skills platform,
              built to help students succeed in BECE, WASSCE, nursing entrance exams, university entrance exams,
              and more. Schools subscribe to give their students access to practice assessments, and individual
              students can subscribe directly. Have questions about who we are or what we&apos;re building? Reach
              out via our{" "}
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
