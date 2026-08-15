# TYP — Progress & Launch Readiness

A running, plain-language snapshot for tracking "how close are we" — updated after each work session, not a one-time spec. For full technical detail on any item, see `CLAUDE.md` (current-state summary) and `docs/build-log.md` (full history of what was built and how it was verified).

**There is no single honest "% done" number for this project** — engineering completeness, content, live-key testing, QA, deployment, and legal are separate tracks that don't collapse into one metric. This file breaks progress down by track instead of faking a headline percentage, and avoids giving a calendar estimate without a defined launch scope, since the actual bottleneck (content authoring) isn't something more code can shortcut.

---

## Status by track (as of 2026-08-08)

| Track | State |
|---|---|
| **Exam-prep track (BECE), all 4 roles** | Code-complete. Full loop verified end-to-end against a live DB: content created → approved → assigned → taken → graded → results. |
| **Course marketplace** | Code-complete for the loop (tutor onboarding, authoring, purchase, reviews, moderation). **Zero real courses exist** — no tutor has actually published one yet. |
| **Payments (Paystack)** | Fully built and verified *downstream* of the real API call. **Zero live transactions have ever happened** — no real keys in this environment yet. |
| **Email (Resend) / scheduled jobs (Vercel Cron)** | Same story — fully built, verified downstream, **zero real emails/cron runs have ever fired**. |
| **Content** | The real gap. Only BECE has content, and it's seed/test-scale — nowhere near what a real product needs. WASSCE/Nursing/University Entrance/Digital Skills have **no content at all**. This is not engineering work and can't be sped up by more code. |
| **QA** | One manual walkthrough round done (found 2 real bugs — fake nav-badge numbers, a Next.js compile error), currently with a second person for further QA. Not complete. |
| **Production readiness** | **Live as of 2026-08-14** at `testingyourpreparedness.com`, real Vercel deployment, verified end-to-end (not just a homepage check). No backup story discussed yet. Rate limiting and error monitoring (Sentry) now have real keys in production, not just fail-open/fail-safe placeholders. A real security audit found and fixed a serious password-hash leak (see log below) — the kind of thing worth running again periodically as the app keeps growing. |
| **Legal** | `/terms` and `/privacy` now carry real, product-accurate drafted content — still a first draft pending a lawyer's review, not finalized legal text. |

**On timeline**: not estimable responsibly without a defined launch scope (e.g. "BECE only, one pilot school" vs. full multi-program public launch) and without knowing content-authoring throughput. Ask if you want to work through a scenario together once scope is picked.

---

## What's actually blocking a real launch, in priority order

1. ~~Real Paystack + Resend + Upstash keys, and a first real deployment.~~ **Done 2026-08-14** — live at `testingyourpreparedness.com` with real keys, verified end-to-end.
2. **A real end-to-end payment test on the live site.** Everything's been verified "downstream of a real API call" so far — the next real milestone is one actual live checkout completing start to finish.
3. **Content authoring at real scale.** The biggest gap, and the one thing engineering can't solve. Worth starting now, in parallel with everything else.
4. **QA sign-off**, currently in progress with a second reviewer.
5. **Legal page content reviewed by a lawyer.** Real draft text now exists (product-accurate, covers what's actually collected/how payments work/Ghana's Data Protection Act) — still needs actual legal review before real users sign up on the strength of it.

---

## Log

Newest first. Each entry: what shipped, and (if relevant) what it unblocks or still needs.

### 2026-08-15

- **Signup forms now block you from skipping required fields.** Previously the multi-step school and independent-student signup wizards let you click "Continue" past a step with blank required fields — you'd only find out something was missing (or, worse, hit a raw error) at the very end. Now each step checks itself and won't let you move on until the required fields are filled, with the empty ones highlighted. The backend side of every signup/join form was also hardened so a malformed submission fails with a clear message instead of crashing.

- **Fixed the mobile app's icon and splash screen** — they were showing a leftover placeholder logo from an earlier design pass instead of TYP's real shield-and-checkmark mark. The app name itself ("TYP") was already correct and didn't need changing.
- **The splash screen got a follow-up polish pass**: it now shows a "TYP" wordmark under the icon instead of just the bare mark, and the icon's zoom-in animation on Android was slowed down (it played very fast before).
- **Students can now sign up for the mobile app directly from their phone**, using their school's invite code (no personal payment involved) — previously the app was login-only, and a new account had to be created on the web first. Signing up as an independent (self-paying) student is still web-only for now.
- **The mobile app now has a Dashboard tab** showing a student's completed-exam stats, score trend, subject strengths, and recent results — the backend for this existed already, it just had no screen to show it on.
- **Super admins can now edit a platform display name and support email** from `Settings → Platform`, instead of those values being hardcoded nowhere at all. This is groundwork, not a visible change yet — the public contact page and footer still show their own fixed values; hooking those up to read this live is a small later step.

### 2026-08-14 (deployment)

- **The app is now actually live** at `https://testingyourpreparedness.com` — the first real deployment this project has ever had (everything before this ran on localhost only). Getting there needed one real fix: the database client wasn't being regenerated during Vercel's build, which broke every page that touches the database — fixed and verified with a full production build before pushing. Confirmed working for real, not just "deployed": the legal pages, signup flow, and all 4 dashboards return real pages instead of 404s, and a real login against a real seeded account returned a real session token from the live database. The site's own public URL setting was also corrected from a placeholder to the real domain (this feeds into Paystack's checkout redirect, so it had to be right before a real payment could complete). Next real-world test to run: an actual payment end-to-end on the live site, not just downstream-verified plumbing.

- **Real payment and email keys are now live and confirmed working** — Paystack (test mode), Resend (on a verified domain, `testingyourpreparedness.com`), and Sentry error monitoring all went from "no keys, plumbing only" to actually tested: a real bank-list call to Paystack succeeded, a real test email was sent and delivered through Resend. This unblocks real end-to-end payment/email testing that wasn't possible before, and (as of the deployment above, same day) these keys are now live in production too, not just local.

### 2026-08-14

- **The contact page now has a newsletter signup form**, wired to Brevo (a marketing-email tool, separate from Resend which just handles things like password resets). Entering an email adds it to a real Brevo mailing list for future newsletter sends. Same as Paystack/Resend, this needs a real Brevo account and API key to actually deliver anything — the form itself is done and will show a clear message instead of silently failing until those are added.

### 2026-08-10

- **Work has started on a mobile app** (Flutter, iOS + Android) — a new track alongside the web platform, not a replacement. First slice covers the core student loop: log in, see your assigned exams, view past results. Taking an exam on the phone itself isn't wired up yet. New backend API routes were added for the app to talk to, and everything's been verified working end-to-end against the real database and a real Flutter toolchain (not just "should work" — actually run and checked).
- **`/terms` and `/privacy` now have real, product-accurate drafted content**, replacing the "nothing written yet" placeholders — closes the last of the four launch-blockers listed above except the actual lawyer review. Covers what data is really collected (checked against the real database structure, not guessed), how payments/payouts actually work, the guardian-approval flow for student accounts, and references Ghana's own Data Protection Act rather than generic boilerplate. Both pages still carry a visible "draft, pending legal review" notice — this is a strong first draft for a lawyer to check, not finalized legal text.

### 2026-08-08

- **A real contact-message inbox now exists** (`super-admin/messages`) — form submissions were being saved all along but nobody could actually see them until now. **A weekly report email is also wired up** (Vercel Cron, Monday mornings) — sends every super admin the same 3 reports the Reports page already shows, as Excel and PDF attachments. Still needs a real deployment + Resend key to actually fire.
- **Error monitoring (Sentry) is now actually committed and pointed at a real project** (`akrynix-labs`/`javascript-nextjs`) — still needs a real DSN/auth token to receive anything, but the wiring itself (including a top-level error boundary) is done.
- **Real emails now go out for password resets, school-admin invites, and new student/content-admin accounts, plus assessment-assignment notifications** — previously these all just displayed a link/temp password in the app with no actual email sent. Invites and temp passwords can now be resent from the same screens too. Bulk student/question imports also got a hard file-size cap so an oversized file fails fast with a clear error instead of hanging.
- **⚠️ Security audit found and fixed a real, serious bug: password hashes were leaking to the browser.** A dedicated audit pass across the whole app found that 14 admin-facing pages were sending real users' encrypted password hashes down to the page (visible via "View Source") — anyone with super-admin or school-admin access could have seen them, just by loading a normal page. This has been fixed on every affected page and verified against the live database. Also fixed: two checkout-related actions that didn't check who was calling them (lower risk — not exploitable for actual payment fraud, but tightened anyway). This is exactly the kind of thing worth periodically re-checking as the app keeps growing — nothing here was caught by any of the day-to-day feature work, only by a dedicated audit looking at the whole app at once.
- **The one lower-priority item the audit found (most super-admin pages relying on the site-wide access gate instead of double-checking the visitor's role themselves) is now closed too** — every `super-admin/**` page checks the visitor's role directly.
- **`/terms` and `/privacy` now exist** — they were linked from both signup forms but the pages themselves didn't exist at all (a real broken link, found while checking on launch-readiness basics). Both are clearly-labeled placeholders, not real legal text — confirmed with the user that drafting real Terms/Privacy language is a legal decision, not an engineering one. Still need real legal content before launch.
- **A full site-wide broken-link check found 7 more dead links**, all in the site's shared header/footer (so visible on every public page): Features, About, Help now have real "coming soon" pages; Cookie Policy got the same legal-placeholder treatment as Terms/Privacy; Blog and the "For Schools"/"For Students" footer links were removed outright rather than stubbed (there was no real content or clear destination for any of them). No known broken links left anywhere in the app as of this check.
- **A dead-buttons audit found and fixed 4 more real issues**, the same class of bug as the broken links but for things you click rather than navigate to: a school-admin student roster had 3 dropdown actions (View Profile/Edit/Send Message) that did nothing and nowhere real to send you, now removed; its "Export" button did nothing while the identical button on two sibling pages worked fine, now fixed; a super-admin school list's "View Details" was dead and — worse — the real, already-built school detail page (students/classes/billing/activity) was completely unreachable from anywhere in the app, now linked properly; and an "Add School" dialog had a form that looked real but created nothing at all (filled it in, hit submit, it just closed) — replaced with a link to the real school-registration flow instead of a fake shortcut.
- **A performance check found and fixed a real slow-query pattern**: two student pages were each running a separate database round-trip per exam result to work out class rank, instead of one combined query — fixed (5 round trips became 1 in a real test). Also added a missing database index that speeds up several other pages that filter by the same field. Real production errors will be visible after deployment (needs a real Sentry key first, same as other integrations).
- **A mobile-friendliness check (public pages half) found one real issue**: the school-join page had a two-column name field layout that would stay two-column even on a narrow phone screen, unlike every other signup form in the app — fixed. Everything else checked out. Worth noting: without a real browser to test in, this check could only look at the underlying code for obvious mistakes, not actually see how pages render on a phone — a real device/browser check would be more thorough.
- **The dashboard half of that same mobile-friendliness check is now done too**, covering every logged-in page across all 5 roles. Found and fixed 4 real cases of the same mistake: a search box and a filter dropdown (or, in one case, a chart and its legend) sitting side by side with no allowance for them to stack on a narrow screen — on a phone, these would have run off the edge instead of wrapping to a second line, the same class of issue already found and fixed on the public side. Same caveat as before: no real device/browser was used to confirm it visually, only a careful read of the underlying code.
- **Rate limiting on public routes** (`login`, `signup/**`, `forgot-password`, `contact`) — done, verified. Backend: **Upstash Redis** (`@upstash/ratelimit`), confirmed with the user first since Vercel's serverless model rules out in-memory limiting. Fails open (never blocks real users) if Upstash isn't configured or has an outage — same "safe to ship without real keys" pattern as Paystack/Resend. Still needs real Upstash credentials to actually protect anything in production.
- **Guardian email approval** — done, verified. Replaced the self-attestation checkbox with a real emailed confirmation link (`app/guardian/approve`). Guardian email is now **required** on independent-student signup (confirmed with the user).
- **`content-admin/questions/[id]/edit`** — done, verified. Real question editing, scoped to the creator, only while `draft`/`rejected`.
- **Course reviews/ratings** — done, verified. New `CourseReview` model, wired into the student catalog and course detail page, plus a bonus average-rating stat on the tutor's own course page.
- **Real `Invitation` acceptance flow** (`app/invite/accept`) — done, verified. School-admin invites now carry a genuine one-click accept link instead of a generic signup pointer.
- **Nav badges fixed** — 7 leftover hardcoded fake numbers (e.g. "127", "45.6K") found during a manual browser walkthrough, replaced with 16 real live-count badges across all 5 role shells.
- **A real Next.js compile bug fixed** — a `"use server"` file was exporting a non-function constant, breaking the tutor-detail page. Found by the same walkthrough.
- **Everything committed to git** — ~10 logical commits by lane/feature, nothing squashed into one giant dump.

### Earlier (see `docs/build-log.md` for full detail)

- All 4 exam-prep role lanes (Content Admin, School Admin, Super Admin, Student + public/signup) wired and verified against a live, seeded Neon database.
- Real Auth.js authentication, role-based route protection.
- Paystack checkout plumbing for school subscriptions, independent-student subscriptions, and course purchases — webhook-verified end-to-end via hand-signed test payloads.
- Course marketplace: Tutor role, course authoring, Paystack Split Payments subaccount setup, student catalog/purchase/lesson-viewer, super-admin moderation.
- Anti-cheat tab-switch logging.
- CLAUDE.md condensed from a 199KB single file into a current-state summary + full history archive (`docs/build-log.md`).
