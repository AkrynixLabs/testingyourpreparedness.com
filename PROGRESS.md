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
| **Production readiness** | Never deployed live. No confirmed real domain, no backup story discussed. Rate limiting on public routes is built (fails open until real Upstash keys exist). Error monitoring (Sentry) is built (fails safely with no DSN). A real security audit found and fixed a serious password-hash leak (see log below) — the kind of thing worth running again periodically as the app keeps growing. |
| **Legal** | `/terms` and `/privacy` exist now (were a real 404 before) but are clearly-labeled placeholders, not real legal content. |

**On timeline**: not estimable responsibly without a defined launch scope (e.g. "BECE only, one pilot school" vs. full multi-program public launch) and without knowing content-authoring throughput. Ask if you want to work through a scenario together once scope is picked.

---

## What's actually blocking a real launch, in priority order

1. **Real Paystack + Resend + Upstash keys, and a first real deployment.** Highest-leverage single action left — unlocks a genuinely real end-to-end test instead of "verified downstream of."
2. **Content authoring at real scale.** The biggest gap, and the one thing engineering can't solve. Worth starting now, in parallel with everything else.
3. **QA sign-off**, currently in progress with a second reviewer.
4. **Legal page content** confirmed real before real users sign up.

---

## Log

Newest first. Each entry: what shipped, and (if relevant) what it unblocks or still needs.

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
