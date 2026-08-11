import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { CustomCursor } from "@/components/custom-cursor"
import { LegalDraftNotice } from "@/components/legal-draft-notice"

const EFFECTIVE_DATE = "August 10, 2026"

export default function TermsPage() {
  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground">
      <CustomCursor />
      <PublicHeader />

      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Terms of Service</h1>
            <p className="text-sm text-muted-foreground mb-6">Draft effective date: {EFFECTIVE_DATE}</p>

            <LegalDraftNotice policyName="Terms of Service" />

            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed [&_h2]:text-foreground [&_h2]:font-semibold [&_h2]:text-xl [&_h2]:mt-0 [&_h2]:mb-3 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1 [&_strong]:text-foreground">
              <section>
                <h2>1. Who we are and what these terms cover</h2>
                <p>
                  TYP (&ldquo;Testing Your Preparedness,&rdquo; &ldquo;TYP,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;)
                  operates a Ghana-focused exam-preparation and digital-skills platform, made up of two related but
                  separate services on the same site:
                </p>
                <ul>
                  <li>
                    <strong>The exam-prep track</strong>: timed practice assessments for BECE, WASSCE, nursing
                    entrance/licensing, university entrance, and digital-skills content, accessed by students through
                    a subscribing school or through an individual (&ldquo;independent&rdquo;) subscription.
                  </li>
                  <li>
                    <strong>The course marketplace</strong>: paid and free courses published directly by independent
                    tutors and purchased by students on a per-course basis.
                  </li>
                </ul>
                <p>
                  By creating an account or using TYP, you agree to these Terms. If you are accepting these Terms on
                  behalf of a school, you confirm you have authority to do so on the school&apos;s behalf.
                </p>
              </section>

              <section>
                <h2>2. Accounts and roles</h2>
                <p>
                  TYP accounts have one of five roles: <strong>Super Admin</strong>, <strong>Content Admin</strong>{" "}
                  (creates and submits exam content for review), <strong>School Admin</strong> (manages a subscribed
                  school, its classes, and its students), <strong>Student</strong> (school-provisioned or
                  independent), and <strong>Tutor</strong> (self-onboards to publish courses). You&apos;re
                  responsible for keeping your login credentials confidential and for activity that happens under
                  your account.
                </p>
                <p>
                  <strong>Students under 18.</strong> Where a student is a minor, an independent-student account
                  requires a parent or guardian&apos;s contact details at signup, and we send that guardian a real
                  confirmation link before treating the account as guardian-approved. School-provisioned student
                  accounts are created and managed by the school itself, which is responsible for its own
                  arrangements with parents/guardians under its jurisdiction.
                </p>
              </section>

              <section>
                <h2>3. Subscriptions, course purchases, and payments</h2>
                <p>
                  Subscription plans (for schools and for independent students) and individual course purchases are
                  billed in Ghana Cedis (GHS) and processed through Paystack. TYP never collects or stores raw card
                  numbers — checkout happens on Paystack&apos;s own hosted payment page, and TYP only retains what
                  Paystack reports back (e.g. a masked card summary, a mobile-money provider label, and transaction
                  references).
                </p>
                <p>
                  School subscriptions renew on the billing cycle selected at signup until cancelled by the school.
                  Independent-student subscriptions and one-off course purchases are billed as described at the time
                  of purchase. Refunds, where applicable, are handled case-by-case — contact us using the details
                  below.
                </p>
              </section>

              <section>
                <h2>4. Tutors and the course marketplace</h2>
                <p>
                  Tutors self-register and can publish courses immediately, without pre-approval — courses are
                  moderated <em>after</em> publication, not before. TYP may flag or remove a course, or suspend a
                  tutor account, at its discretion if content violates these Terms or applicable law (suspending a
                  tutor also flags that tutor&apos;s currently-published courses).
                </p>
                <p>
                  Course pricing is set by the tutor. TYP retains a platform fee (currently 15% of each course sale,
                  which may change with notice) from each purchase; the remainder is paid out to the tutor via
                  Paystack&apos;s Split Payments to the bank account the tutor connects in their payout settings.
                  Tutors are responsible for the accuracy of their own course content and for any tax obligations
                  arising from their earnings.
                </p>
              </section>

              <section>
                <h2>5. Content, question banks, and assessments</h2>
                <p>
                  Exam-prep questions and assessments are authored by Content Admins and reviewed by a Super Admin
                  before becoming visible to students — nothing in the exam-prep question bank goes live without
                  that approval step. Course content in the marketplace is authored and owned by the publishing
                  tutor, who grants TYP a license to host, display, and stream it to enrolled/purchasing students for
                  as long as the course remains published.
                </p>
              </section>

              <section>
                <h2>6. Assessment integrity</h2>
                <p>
                  Timed assessments are graded server-side and are subject to basic anti-cheat monitoring (for
                  example, logging tab-switch events during an attempt). Attempting to circumvent assessment
                  integrity controls, share assessment content improperly, or otherwise cheat may result in a flagged
                  attempt, a voided result, or account suspension.
                </p>
              </section>

              <section>
                <h2>7. Acceptable use</h2>
                <p>You agree not to:</p>
                <ul>
                  <li>Share your account credentials or let someone else take an assessment on your behalf.</li>
                  <li>Upload or publish content that is unlawful, infringing, or harmful, including as a tutor.</li>
                  <li>Attempt to access another user&apos;s data, another school&apos;s students, or admin functions you haven&apos;t been granted.</li>
                  <li>Interfere with the platform&apos;s operation, including automated scraping or abuse of rate-limited endpoints.</li>
                </ul>
              </section>

              <section>
                <h2>8. Termination</h2>
                <p>
                  You may stop using TYP and (where applicable) cancel your subscription at any time. We may suspend
                  or terminate an account that violates these Terms, including school accounts, tutor accounts, and
                  student accounts, with notice where practical.
                </p>
              </section>

              <section>
                <h2>9. Disclaimers and limitation of liability</h2>
                <p>
                  TYP is provided on an &ldquo;as is&rdquo; basis. Practice assessments and scores are study tools
                  and are not a guarantee of performance on an actual BECE, WASSCE, or other official examination. To
                  the maximum extent permitted by law, TYP is not liable for indirect or consequential damages
                  arising from use of the platform.
                </p>
              </section>

              <section>
                <h2>10. Governing law</h2>
                <p>These Terms are governed by the laws of the Republic of Ghana.</p>
              </section>

              <section>
                <h2>11. Changes to these Terms</h2>
                <p>
                  We may update these Terms as the product changes. Material changes will be reflected by updating
                  the effective date above.
                </p>
              </section>

              <section>
                <h2>12. Contact</h2>
                <p>
                  Questions about these Terms can be sent to{" "}
                  <a href="mailto:support@typ.edu.gh" className="text-primary hover:underline">
                    support@typ.edu.gh
                  </a>{" "}
                  or via our{" "}
                  <a href="/contact" className="text-primary hover:underline">
                    contact page
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
