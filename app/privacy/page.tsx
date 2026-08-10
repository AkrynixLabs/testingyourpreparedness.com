import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { LegalDraftNotice } from "@/components/legal-draft-notice"

const EFFECTIVE_DATE = "August 10, 2026"

export default function PrivacyPage() {
  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground">
      <PublicHeader />

      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground mb-6">Draft effective date: {EFFECTIVE_DATE}</p>

            <LegalDraftNotice policyName="Privacy Policy" />

            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed [&_h2]:text-foreground [&_h2]:font-semibold [&_h2]:text-xl [&_h2]:mt-0 [&_h2]:mb-3 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1 [&_strong]:text-foreground">
              <section>
                <h2>1. Scope</h2>
                <p>
                  This Policy describes how TYP (&ldquo;Testing Your Preparedness&rdquo;) collects, uses, and
                  protects personal data across both parts of the platform — the exam-prep track (schools,
                  independent students, content admins, super admin) and the course marketplace (tutors and
                  purchasing students).
                </p>
                <p>
                  TYP is a Ghana-focused product, and we intend to handle personal data consistently with Ghana&apos;s
                  Data Protection Act, 2012 (Act 843) and the Data Protection Commission&apos;s guidance, in addition
                  to good general data-protection practice.
                </p>
              </section>

              <section>
                <h2>2. Data we collect</h2>
                <p>What we collect depends on your role:</p>
                <ul>
                  <li>
                    <strong>All accounts:</strong> name, email address, password (stored as a salted hash, never in
                    plain text), role, and account activity/audit history.
                  </li>
                  <li>
                    <strong>Schools:</strong> school name, GES registration number, region/district/town/address,
                    contact details, ownership type, and education level.
                  </li>
                  <li>
                    <strong>Students:</strong> class/form, and — for independent students — date of birth, gender,
                    and address where provided. Exam attempts, answers, scores, and progress history are recorded
                    against the student&apos;s account.
                  </li>
                  <li>
                    <strong>Guardians of independent students:</strong> guardian name, phone number, email, and
                    relationship to the student, collected because independent-student signup requires a guardian
                    contact and a real emailed confirmation from that guardian.
                  </li>
                  <li>
                    <strong>Tutors:</strong> bio, headline, and areas of expertise displayed on course listings, plus
                    payout details (a Paystack subaccount reference — TYP does not itself store bank account
                    numbers, Paystack does).
                  </li>
                  <li>
                    <strong>Payments:</strong> transaction amount, status, and a Paystack reference for every
                    subscription or course payment, plus a masked card summary or mobile-money provider label when
                    applicable. Full card numbers are never collected or stored by TYP — checkout happens on
                    Paystack&apos;s hosted page.
                  </li>
                  <li>
                    <strong>Usage data:</strong> login activity, and — during timed assessments — basic anti-cheat
                    signals such as tab-switch counts.
                  </li>
                </ul>
              </section>

              <section>
                <h2>3. Children&apos;s data</h2>
                <p>
                  Many BECE-track students are minors. For independent-student signups, we require a guardian&apos;s
                  contact information and only treat the account as guardian-approved once that guardian confirms
                  via a real emailed link (not a self-attestation checkbox). School-provisioned student accounts are
                  created by the school, which is responsible for its own consent arrangements with parents/guardians
                  under Ghanaian law.
                </p>
              </section>

              <section>
                <h2>4. How we use data</h2>
                <ul>
                  <li>To provide the service: authenticate accounts, run and grade assessments, track progress and leaderboards, deliver and track course purchases.</li>
                  <li>To process payments and payouts, and to detect and prevent fraud.</li>
                  <li>To send account-related email: password resets, invitations, temporary passwords, assignment notifications, and (for super admins) scheduled platform reports.</li>
                  <li>To maintain audit logs of moderation and administrative actions for accountability.</li>
                  <li>To monitor for and diagnose errors, and to enforce basic rate limits against abuse of public endpoints (login, signup, contact forms).</li>
                </ul>
              </section>

              <section>
                <h2>5. Who we share data with</h2>
                <p>We share data with the following service providers, each acting on our behalf:</p>
                <ul>
                  <li><strong>Paystack</strong> — payment processing for subscriptions, course purchases, and tutor payouts (Split Payments).</li>
                  <li><strong>Resend</strong> — transactional email delivery (password resets, invites, notifications, reports).</li>
                  <li><strong>Upstash</strong> — rate-limiting infrastructure for public endpoints (stores request counters, not account content).</li>
                  <li><strong>Sentry</strong> — error monitoring, to help us diagnose bugs and outages.</li>
                  <li><strong>Neon and Vercel</strong> — our database and application hosting providers.</li>
                </ul>
                <p>
                  We do not sell personal data. Some of these providers may process data on infrastructure located
                  outside Ghana; we select providers that offer comparable data-protection commitments.
                </p>
              </section>

              <section>
                <h2>6. Data retention</h2>
                <p>
                  We retain account and academic-history data for as long as the account is active, and for a
                  reasonable period afterward to satisfy record-keeping, dispute, and legal obligations. Payment
                  records are retained as required for financial and tax record-keeping.
                </p>
              </section>

              <section>
                <h2>7. Security</h2>
                <p>
                  Passwords are stored as salted hashes, never in plain text. Card and full payment details never
                  touch our servers — they&apos;re handled entirely by Paystack&apos;s hosted checkout. Access to
                  administrative functions is role-scoped and logged.
                </p>
              </section>

              <section>
                <h2>8. Your rights</h2>
                <p>
                  Subject to Act 843, you may request access to, correction of, or deletion of your personal data,
                  and may ask us about how your data has been processed. For a student under 18, a parent or
                  guardian may exercise these rights on the student&apos;s behalf. To make a request, contact us
                  using the details below.
                </p>
              </section>

              <section>
                <h2>9. Cookies</h2>
                <p>
                  See our{" "}
                  <a href="/cookies" className="text-primary hover:underline">
                    Cookie Policy
                  </a>{" "}
                  for details on the cookies TYP uses.
                </p>
              </section>

              <section>
                <h2>10. Changes to this Policy</h2>
                <p>
                  We may update this Policy as the product changes. Material changes will be reflected by updating
                  the effective date above.
                </p>
              </section>

              <section>
                <h2>11. Contact</h2>
                <p>
                  Questions or requests about your data can be sent to{" "}
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
