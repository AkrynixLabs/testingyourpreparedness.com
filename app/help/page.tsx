import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { CustomCursor } from "@/components/custom-cursor"
import { ComingSoonNotice } from "@/components/coming-soon-notice"

export default function HelpPage() {
  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground">
      <CustomCursor />
      <PublicHeader />

      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Help Center</h1>

            <ComingSoonNotice>
              We&apos;re still building a full help center with guides and FAQs. Need help right now? Reach out via
              our{" "}
              <a href="/contact" className="text-primary hover:underline">
                contact page
              </a>{" "}
              and we&apos;ll get back to you.
            </ComingSoonNotice>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
