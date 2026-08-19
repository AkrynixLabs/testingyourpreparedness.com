import type { Metadata } from "next"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { CustomCursor } from "@/components/custom-cursor"

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Cookie Policy for TYP (Testing Your Preparedness), Ghana's exam prep and digital skills platform.",
  alternates: { canonical: "/cookies" },
}

export default function CookiesPage() {
  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground">
      <CustomCursor />
      <PublicHeader />

      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Cookie Policy</h1>

            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed [&_h2]:text-foreground [&_h2]:font-semibold [&_h2]:text-xl [&_h2]:mt-0 [&_h2]:mb-3 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1 [&_strong]:text-foreground [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_th]:text-left [&_th]:text-foreground [&_th]:font-semibold [&_th]:border-b [&_th]:border-border [&_th]:pb-2 [&_th]:pr-4 [&_td]:border-b [&_td]:border-border/60 [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top">
              <section>
                <h2>1. What this policy covers</h2>
                <p>
                  This Policy explains the cookies and similar browser-storage technologies (such as local storage)
                  that TYP (&ldquo;Testing Your Preparedness&rdquo;) uses on this website and how you can control
                  them. It applies to the public marketing site and the logged-in dashboards for every role
                  (School Admin, Content Admin, Super Admin, Learner, Tutor). It does not cover the TYP mobile app,
                  which does not use browser cookies — the app stores its own login session directly on your device
                  instead (see our{" "}
                  <a href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>{" "}
                  for how that works).
                </p>
              </section>

              <section>
                <h2>2. TYP does not use advertising or cross-site tracking cookies</h2>
                <p>
                  TYP does not run any advertising, retargeting, or cross-site tracking cookies of its own, and does
                  not embed third-party ad networks or social-media tracking pixels. Every cookie set on this site
                  exists to make the platform work or to help us understand how it&apos;s used in aggregate — never
                  to build an advertising profile or to track you across other websites.
                </p>
              </section>

              <section>
                <h2>3. Strictly necessary cookies</h2>
                <p>
                  These cookies are set by our authentication system (Auth.js) and are required for the site to
                  function — you cannot log in, stay logged in, or submit forms securely without them. They cannot
                  be switched off individually, though you can block or delete all cookies through your browser
                  settings, which will sign you out and may break parts of the site (see Section 6).
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>Cookie</th>
                      <th>Purpose</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <code>authjs.session-token</code>
                      </td>
                      <td>Keeps you signed in and identifies your account/role on each request.</td>
                      <td>Session / up to 30 days, depending on how you signed in</td>
                    </tr>
                    <tr>
                      <td>
                        <code>authjs.csrf-token</code>
                      </td>
                      <td>Protects login and form submissions from cross-site request forgery.</td>
                      <td>Session</td>
                    </tr>
                    <tr>
                      <td>
                        <code>authjs.callback-url</code>
                      </td>
                      <td>Returns you to the right page after signing in.</td>
                      <td>Session</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section>
                <h2>4. Functional storage (not a tracking cookie)</h2>
                <p>
                  Your Light/Dark/System theme choice is remembered using your browser&apos;s local storage, not a
                  cookie — it stays on your device, is never sent to our servers, and isn&apos;t used for tracking.
                </p>
              </section>

              <section>
                <h2>5. Analytics</h2>
                <p>
                  We use Vercel Web Analytics to understand overall traffic and page performance (e.g. which pages
                  are visited, how the site performs). It is cookieless by design — it does not set a cookie, does
                  not use a persistent identifier, and does not track you individually or across other websites.
                </p>
              </section>

              <section>
                <h2>6. Payment checkout cookies (Paystack)</h2>
                <p>
                  When you make a payment — a school subscription, an independent-learner subscription, or a course
                  purchase — checkout happens on Paystack&apos;s own hosted payment page, on Paystack&apos;s domain,
                  not ours. Any cookies set during that step are set by Paystack and governed by Paystack&apos;s own
                  cookie and privacy policies, not this one. TYP never receives or stores cookies from that page.
                </p>
              </section>

              <section>
                <h2>7. Managing cookies</h2>
                <p>
                  Most browsers let you view, delete, and block cookies through their settings, and let you clear
                  local storage the same way. Blocking or deleting the authentication cookies in Section 3 will sign
                  you out and prevent you from logging back in until they&apos;re allowed again — that&apos;s
                  expected, since those cookies are what keep your session working.
                </p>
              </section>

              <section>
                <h2>8. Changes to this Policy</h2>
                <p>
                  We may update this Policy if the cookies or storage technologies we use change. Material changes
                  will be reflected on this page.
                </p>
              </section>

              <section>
                <h2>9. Contact</h2>
                <p>
                  Questions about this Policy can be sent to{" "}
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
