# CLAUDE.md

This file gives Claude Code context on this project. Keep it updated as decisions change — this is a living document, not a one-time spec. **This file is a condensed, current-state summary — the full page-by-page build history (what was wired, what was verified, exact gotchas hit) lives in [`docs/build-log.md`](./docs/build-log.md), append-only. Add new entries there, not here; only update this file's summary sections when the *current state* actually changes.**

**System design decisions are made together with the user, not unilaterally.** When a task requires a new architectural choice (a new service, a new data model shape, a new provider), surface it as a decision rather than picking silently — even if there's an obvious-seeming default.

## Project Overview

**TYP** is a Ghana-focused exam-prep and digital skills platform. BECE (Junior High School exit exam) is the flagship track, but the platform is scoped to cover multiple exam/skill tracks: **BECE, WASSCE, nursing entrance/licensing exams, university entrance exams, and digital skills training** (modeled via a top-level `Program` entity, `Subject.programId` FK — only BECE has real content authored so far). Schools subscribe to give their students access to practice assessments; individual ("independent") students can also self-subscribe. Content is produced by content admins, vetted by a super admin, then made available as timed assessments students take online with automatic scoring, results, progress tracking, and leaderboards.

**The product is two deliberately separate systems** (decided 2026-08-05):
1. **The exam-prep track** — internal Content Admins, super-admin pre-approval, `Program`/`Subject`/`Question`/`Assessment`/`ExamAttempt`. Fully built and verified against the live DB (see Current State below).
2. **A course marketplace**, Coursera/Udemy-style — independent **Tutors** self-onboard and publish real courses (video lessons, reading material, structured modules) directly to students. Locked decisions: **publish-first, moderate-after** (not pre-approved like exam-prep); **a la carte per-course pricing** with a platform cut (currently 15%, super-admin-editable via `PlatformSettings`) rather than pooled subscription revenue-share; **per-course enrollment** (`Course → Enrollment → Student`), no fixed tutor roster; **Content Admin and Tutor are distinct roles**, not a merge. Video hosting is an external URL the tutor pastes in (not Vercel Blob); lesson-completion progress tracking is out of scope for now; tutor payout uses Paystack's native Split Payments (subaccounts) — a tutor connects a real bank account via `app/tutor/settings`'s Payouts tab (built 2026-08-08), which creates a real Paystack subaccount and stores its code on `TutorProfile.paystackSubaccountCode`; course purchases route the platform's exact cut there automatically once connected, full charge to the platform's main account otherwise.
   These two systems share only `User` (base identity/auth) and `Student` identity — `Course` is not an `Assessment`.

**Current state (updated 2026-08-08)**: frontend + a real, seeded Neon database + real Auth.js auth. **All 4 exam-prep role lanes are fully wired and verified against the live DB** (Content Admin, School Admin, Super Admin, Student + public/signup — every page, including all 5 dashboard-root pages found by a later full-folder audit). The full core exam-taking loop is real end-to-end: content created → approved → assigned → student sees it → takes it (server-graded, anti-cheat tab-switch logging) → real result. Account-creation loops (school self-register, student self-register via independent signup or school-code join) are real. **Paystack checkout is real plumbing** for school subscriptions, independent-student subscriptions, and course purchases — webhook-verified end-to-end via hand-signed test payloads, idempotent, PCI-safe (no raw card entry anywhere), with tutor payout Split Payments now wired end-to-end code-wise too. The only missing piece is real Paystack keys (none exist in this environment by deliberate choice), so no live charge — and no live subaccount creation — has actually gone through Paystack itself yet, only everything downstream/around one. **The Tutor role has a first full vertical slice**: self-signup, dashboard, course authoring (create/extend), payout account setup, a student-facing catalog/purchase/lesson-viewer flow, and super-admin moderation (`super-admin/courses` flag/remove, `super-admin/tutors` roster + suspend). **Everything above is now committed to git** (2026-08-08, grouped into ~10 logical commits by lane/feature — schema+migrations, dependencies, each role lane, Paystack infra, the course marketplace, and this doc restructuring — see `git log` for the exact breakdown; nothing was squashed into one giant commit). The frontend's shape — what fields forms collect, what statuses things move through, what each role can see and do — **is the spec for the backend.**

**What's left**: real Paystack test keys to exercise a live charge and a live subaccount creation; a real Resend API key + a real Vercel Cron deployment to exercise a live scheduled-report email (the plumbing for both is built and verified downstream of the actual external call, same standing caveat as Paystack); a platform-wide config store (`PlatformSettings` currently holds only the marketplace fee — the broader platform-name/support-email/feature-toggle version is still unbuilt).

**Decided 2026-08-08**: rate-limiting backend is **Upstash Redis** (`@upstash/ratelimit`) — confirmed with the user first. In-memory rate limiting doesn't work on Vercel's serverless model (no shared state across instances), and reusing Postgres for request counters was explicitly passed over in favor of a purpose-built tool for this exact access pattern.

**Decided/built 2026-08-08**: rate limiting is real on `login`, `signup/school`, `signup/independent`, `signup/tutor`, `join`, `forgot-password`, and `contact` — `lib/rate-limit.ts` wraps `@upstash/ratelimit`+`@upstash/redis` (internal-interface pattern, same as `lib/payments/paystack.ts`). **Fails open** when unconfigured or on a real Upstash error (deliberate: rate limiting is defense-in-depth on top of already-real validation, not the security boundary itself — fail-closed would mean a Redis outage silently takes down login/signup platform-wide, a worse failure mode). `NextRequest.ip` is confirmed removed in this Next.js version (per this file's own standing warning) — IP comes from `x-forwarded-for`/`x-real-ip` headers instead. See `docs/build-log.md`'s 2026-08-08 entry.

**⚠️ Decided/built 2026-08-08 — security audit found and fixed a real, exploitable `passwordHash` leak across 14 pages.** The most severe finding this project has had. Any authenticated super admin (and, on 2 pages, any school admin) loading an existing page could read other real users' actual bcrypt password hashes straight out of the page's HTML — `include: { user: true }` (or `createdBy`/`reviewedBy`/`actor: true`) fetched the full `User` row and it flowed unmapped into a client component's props. Fixed on all 14 sites (`super-admin/courses/[id]`, `super-admin/schools/[id]`, `super-admin/tutors/[id]`, `school-admin/students`, `school-admin/assessments/assign`, `super-admin/tutors`, `super-admin/content-admins`, `super-admin/courses`, `super-admin/payments`, `content-admin/assessments`, `super-admin/question-bank`, `content-admin/questions/pending`, `super-admin/page.tsx`, `super-admin/audit-logs` — plus `super-admin/revenue` tightened as a precaution, not an actual leak) using `select` at the query level where possible (Prisma never fetches the column at all) or destructuring `passwordHash` out after fetch, matching the pattern `school-admin/settings` already got right once before. **Also fixed**: `initializeSchoolCheckout`/`initializeStudentCheckout` (`signup/school`, `signup/independent`) never verified the caller owned the `schoolId`/`studentId` passed in — a real defense-in-depth gap (not exploitable for payment fraud, since the Paystack webhook remains the sole source of truth), now guarded. **Also found, deliberately not fixed**: nearly every `super-admin/**` Server Component has no `auth()` call of its own, relying entirely on `proxy.ts`'s route-level check — currently unexploitable, flagged for a future pass rather than touching ~15 files for redundant protection right now. Tenant-scoping (a separate audit category) came back completely clean. Full writeup, every fix, and every live-DB verification in `docs/build-log.md`'s 2026-08-08 entry — read it before touching any of these pages again.

**Decided/built 2026-08-08** — `auth()` guards added to every `app/super-admin/**` page, closing a deferred security-audit finding: every page now checks the visitor's role itself rather than relying solely on `proxy.ts`. Verified live, typecheck clean. See `docs/build-log.md`'s 2026-08-08 entry.

**Decided/built 2026-08-08**: a manual browser walkthrough (the first this whole push had — everything before was verified via scripts/RSC-payload greps) caught 7 leftover fake nav-badge numbers across 4 role shells (e.g. Schools showing hardcoded `"127"`, Students `"45.6K"`) — invisible to the earlier `lib/demo-data.ts` dead-code audit since they were inline literals, not imports. Fixed and expanded: **16 nav badges across all 5 role shells now show real, live Prisma counts**, each reusing the exact definition its destination page already computes (e.g. `overdueInvoices` not total invoices, `examsInProgress` not a static count) — badges were added only to rosters/actionable-queue items, deliberately skipped on action links and pure-reports pages to avoid noise. See `docs/build-log.md`'s 2026-08-08 entry for the full per-role breakdown and the one flagged approximation (`student/layout.tsx`'s "Available Exams" badge skips the full per-assignment attempt-limit check for cost reasons, documented inline).

**Decided/built 2026-08-08**: suspending a tutor (`super-admin/tutors`) **does** cascade — sets all their `published` courses to `flagged` (not `removed`), consistent with the existing moderation lever and reversible on reactivate (an AuditLog-based check means reactivating only un-flags courses the cascade itself flagged, never a course a moderator separately flagged for an unrelated reason). Also added a payout-account disconnect/reconfigure action to `app/tutor/settings`'s Payouts tab. Both done and verified — see `docs/build-log.md`'s 2026-08-08 entry.

**Decided/built 2026-08-08**: `super-admin/reports` now exports all 3 real datasets as PDF and Excel too, not just CSV. Excel reused the already-present `xlsx` dependency (no new package); PDF added `jspdf`+`jspdf-autotable` (both flagged before install, zero new vulnerabilities). Done and verified — see `docs/build-log.md`'s 2026-08-08 entry. Scheduled/recurring report generation is the only piece of the original export item still open, and it stays blocked on the Background Jobs decision below.

Full page-by-page build history — every wiring decision, every "honest reshaping" call, every verification method, every gotcha — is in **[`docs/build-log.md`](./docs/build-log.md)**. Read it when you need to know *why* a specific page looks the way it does or *how* something was verified; don't re-derive it from scratch.

## Roles & Access Model

Five roles exist: 4 in the frontend from the start, plus **Tutor** (added 2026-08-07 for the course marketplace, has its own layout/nav at `/tutor`).

| Role | Dashboard root | Core responsibilities |
|---|---|---|
| **Super Admin** | `/super-admin` | Approves/rejects questions & assessments; manages schools, content admins, tutors, subjects/topics, subscription plans, revenue/payments, platform-wide analytics, audit logs, course moderation |
| **Content Admin** | `/content-admin` | Creates questions (single-entry or bulk CSV/XLSX) and assessments; everything enters a review queue — nothing goes live without super admin approval |
| **School Admin** | `/school-admin` | Registers/manages a school; adds students and classes/forms; assigns assessments to classes; views results/leaderboard; manages the school's subscription and billing |
| **Student** | `/student` | Takes timed assessments, views results/progress/leaderboard/study materials, browses/buys/watches marketplace courses. Two flavors: **school-provisioned** (no personal billing) and **independent** (self-registers, personal subscription, guardian info required) |
| **Tutor** | `/tutor` | Self-service signup (no approval gate), authors courses (modules/lessons), views enrolled students and real earnings (`tutorPayout` after the platform cut) |

Auth is real Auth.js (Credentials provider + JWT sessions, no adapter — own Postgres `User` table), role-based route protection enforced server-side in `proxy.ts` (this Next.js version's `middleware.ts` equivalent).

## Core Domain Entities

Short summary — see [`docs/data-model.md`](./docs/data-model.md) for the full field-by-field version, and [`docs/build-log.md`](./docs/build-log.md) for the reasoning behind each shape.

- **User** — base identity; `role` enum (`super_admin | content_admin | school_admin | student | tutor`); email/password.
- **School** — name, GES reg. number, region/district/town/address, contact, `status` (`active|pending|suspended`), `ownershipType` + `educationLevel` (two separate fields).
- **Student** — belongs to a `School` (nullable for independent students), class/form; independent students carry a `Guardian` relation + subscription.
- **Class/Form** — canonical naming "Form N[A/B/C]"; identity is `(schoolId, form, section, academicYear)`, enforced by a compound unique constraint.
- **Program** — BECE, WASSCE, Nursing, University Entrance, Digital Skills. `Subject.programId` FK.
- **Subject** / **Topic** — `Topic` is first-class (`{ id, subjectId, name }`).
- **Question** — 2–6 options, correct answer index, explanation, difficulty, marks, year, `status` (`draft|pending|approved|rejected`), plus a separate `isActive`/`timesUsed` pair for the approved-pool (archive) view.
- **Assessment** — title, subject, questions, duration, `status` (`draft|pending|published|archived`) — distinct from **AssessmentAssignment.status** (`active|completed|scheduled|paused`), which tracks a school's assignment of a published assessment to classes/students.
- **ExamAttempt** — per-question answers, timestamps, computed score/rank/percentile/topic-breakdown/grade (A–F), plus `tabSwitchCount`/`flaggedForReview` (anti-cheat).
- **SubscriptionPlan** — Starter/Professional/Enterprise at GHS 150/350/750/month (school audience) + several independent-student plans; nullable `programId` hook for future program-scoped billing.
- **Invoice** / **Payment** (`PAY-` prefix, `pending|completed|failed|refunded`) / **PaymentMethod** (card or Ghana MoMo, Paystack-captured only — no raw card entry).
- **AuditLog** — actor, action, category, description, polymorphic `details` JSONB — the review/moderation trail for questions, assessments, tutors, and courses.
- **Course marketplace** (added 2026-08-07): `TutorProfile` (`status: active|suspended`, no pending gate — self-service), `Course` (`status: published|flagged|removed`, no draft/pending — publish-first), `Module`/`Lesson` (video URL or article), `Enrollment`, `CoursePurchase` (own entity, not a `Payment`/`Invoice` reuse — `amount`/`platformFee`/`tutorPayout` on the row), `PlatformSettings` (singleton, currently just `platformFeePercent`, default 15).

## Key Workflows

1. **School onboarding** (`app/signup/school`) — 5-step wizard ending in `pending` verification status, not immediate activation.
2. **Student onboarding** — school-admin-provisioned (no billing) or self-service independent signup (guardian info + approval + checkout).
3. **Content pipeline** — content admin creates/uploads → `pending` → super admin reviews (`app/super-admin/review-queue`) → `approved`/`rejected` (with reason). Same pattern for assessments.
4. **Bulk upload** — CSV/XLSX, client-side parse + preview, server-side re-validated on submit, always lands as `pending` (no approval bypass).
5. **Assessment taking** (`app/student/exams/[id]/start`) — timed, eligibility re-verified server-side, grading server-side only, idempotent submit, tab-switch logged (not blocked).
6. **Billing** — school admins (`app/school-admin/subscription/**`) and super admin (`revenue`/`payments`) see real Paystack-backed `Payment`/`Subscription`/`Invoice` data. All amounts GHS.
7. **Course marketplace** (added 2026-08-07) — tutor self-signs-up → authors a course (publishes immediately) → student browses catalog → enrolls free or pays via Paystack (webhook-confirmed, idempotent) → watches lessons (`/learn`, re-verifies enrollment server-side) → super admin can flag/remove a course or suspend a tutor post-publish.

## Tech Stack

**Frontend** — Next.js (App Router) + TypeScript + Tailwind CSS v4, shadcn/ui (Radix). Deployed on Vercel (v0-linked; merges to `main` auto-deploy).

**Backend** — Next.js fullstack (Server Actions/API routes), no separate service. Zod for validation.

**Database** — PostgreSQL via Neon (serverless), Prisma ORM. This sandbox has no IPv6 route — `net.setDefaultAutoSelectFamily(false)` + `dns.setDefaultResultOrder("ipv4first")` is required before any Prisma/Neon code runs (already baked into `lib/prisma.ts`/`prisma/seed.ts`); Neon's serverless driver also needs `neonConfig.webSocketConstructor = ws` on this project's Node 20.

**Auth** — Auth.js + own Postgres users table (no `@auth/prisma-adapter`; Credentials provider + JWT sessions).

**Payments** — Paystack (GHS pricing, mobile money support). All payment logic routed through `lib/payments/paystack.ts` — never call the SDK directly from business logic.

**File storage** — Vercel Blob, for CSV/XLSX/images. Course lesson video is an external URL, not Blob-hosted.

**Background jobs** — Not yet decided; bulk upload stays synchronous client-side-parse (≤5MB, per current UI copy).

## Architectural Principles

1. **The frontend is the source of truth for product behavior.** Don't redesign flows/statuses/permissions while building the backend — match what's built in `app/**`. Raise anything that seems wrong as a question, don't silently change it.
2. **No vendor lock-in beyond what's been deliberately decided.** Neon/Prisma/Auth.js/Paystack/Vercel Blob are the agreed stack — flag any new SaaS dependency first.
3. **Payment logic goes through an internal interface**, never called directly from route handlers/business logic.
4. **Role/tenancy scoping is a hard requirement.** Every school-admin/student/tutor query is scoped server-side, not just hidden in the UI.
5. **Approval/moderation workflows are core, not incidental.** Exam-prep content is gated `pending → approved/rejected` server-side; the marketplace is publish-first but still has a real server-side moderation lever (`flagged`/`removed`/tutor `suspended`).

## Repo / Workflow Conventions

- Source of truth: GitHub. This repo is v0-linked — v0 chat UI pushes commits directly to `main` and auto-deploys. Pull before starting work.
- **Commit message style**: single-line Conventional Commits — `type: short imperative summary`, no body/footer, no `Co-Authored-By` trailer. Group unrelated changes into separate commits (one per wired page/fix/doc-update, not one per session).
- **Branch strategy (decided 2026-08-08)**: everyone — v0 and Claude Code sessions alike — commits and pushes directly to `main`, no feature branches or PR review. Deliberately kept as-is rather than moving to a branch+PR flow, since v0's own auto-push-to-main behavior can't realistically be changed and a PR flow for only half the contributors wouldn't actually protect `main`. Relies on discipline instead: typecheck clean before every commit, small logical commits (not one giant dump), and this file's existing "confirm before destructive git operations" rule — not branch protection.

## Open Decisions (update as resolved)

- [x] Background job handling for bulk upload / async work — resolved 2026-08-08: bulk upload (`content-admin/questions/upload`, `school-admin/students/add`) stays synchronous, not queued (real usage is well within a safe processing window), now with a hard row cap (300/200 respectively) so an oversized file fails fast with a clear error instead of timing out silently. Scheduled/recurring work uses Vercel Cron (native platform feature, no new vendor). See `docs/build-log.md`.
- [x] Branching/PR workflow — resolved 2026-08-08: stays direct-to-`main` for everyone (v0 and Claude Code alike), see Repo/Workflow Conventions above.
- [ ] Platform-wide config store beyond the marketplace fee (`PlatformSettings` could grow platform name/support email/timezone/feature toggles — currently only `platformFeePercent` exists)
- [ ] Third-party API/webhook integration surface (no external integrations requested yet)
- [x] PDF/Excel export for `super-admin/reports` — real, built 2026-08-08 (all 3 datasets, `xlsx` reused + `jspdf`/`jspdf-autotable` added), including scheduled/recurring generation (a weekly Vercel Cron job emails all 3 datasets to every super admin, unblocked by the Background Jobs decision above). Still unexercised against a real Vercel Cron deployment/Resend key, same standing caveat as Paystack.
- [x] Whether suspending a tutor (`super-admin/tutors`) should cascade to their courses — resolved 2026-08-08: yes, flags their `published` courses (reversible, AuditLog-tracked so reactivation never un-flags a moderator's own independent flag). See `docs/build-log.md`.
- [x] Paystack subaccount creation/onboarding flow for tutors — real, built 2026-08-08 (`app/tutor/settings`'s Payouts tab), including a disconnect/reconfigure action added the same day. Still unexercised against a real Paystack account (no test keys in this environment) — see `docs/build-log.md`'s 2026-08-08 entries.
- [x] Anti-cheat / exam-session integrity — tab-switch logging (real, "just log it," threshold 3) + single-attempt enforcement (`allowRetake`/`maxAttempts`, server-side) both real
- [x] Exam program/track modeling, subscription pricing, class naming, School.type split, Payment/Invoice vocabulary, Topic entity, Assessment status enum, Achievement catalog, billing-page duplication, demo-data → seed-script consolidation, course-marketplace entity design — see [`docs/build-log.md`](./docs/build-log.md) for the resolution writeups.

## Notes for Claude Code

- This file is the primary source of *current-state* project context — more current than any chat summary. Append detailed "what was built and how it was verified" writeups to **[`docs/build-log.md`](./docs/build-log.md)**, not here; only touch this file's summary sections when the actual current state changes (a lane closes, an open decision resolves, a new system-wide gotcha is found).
- **[`PROGRESS.md`](./PROGRESS.md) is a user-facing, plain-language progress/launch-readiness tracker** — a different audience than this file (the user reading for status, not a future Claude session reading for implementation context). Add a dated entry to its Log section whenever a real feature ships or a real launch-blocker is resolved/discovered - keep entries short (1-2 lines, what shipped + what it unblocks), don't duplicate `docs/build-log.md`'s technical depth there.
- **[`PROGRESS.md`](./PROGRESS.md) is a user-facing, plain-language progress/launch-readiness tracker** — a different audience than this file (the user reading for status, not a future Claude session reading for implementation context). Add a dated entry to its Log section whenever a real feature ships or a real launch-blocker is resolved/discovered - keep entries short (1-2 lines, what shipped + what it unblocks), don't duplicate `docs/build-log.md`'s technical depth there.
- Always raise new system-design decisions (new dependency, new service, schema shape for a not-yet-modeled entity, business-rule numbers like fee %) with the user rather than deciding unilaterally.
- When implementing a backend feature, cross-check the relevant `app/**` page(s) first for the exact fields/statuses/permissions the UI already assumes.
- **The user runs multiple Claude Code sessions against this repo, deliberately and in parallel.** When assigning the other session a task, ALWAYS give it two ways: (a) recorded here in CLAUDE.md, AND (b) as literal copy-paste text in the chat response — CLAUDE.md alone is not a reliable inter-session channel. Never trust another session's "done" claim at face value — independently re-verify (typecheck + live DB/HTTP check) before building on top of it or assigning follow-on work in the same area.
- **All 5 role lanes (Content Admin, School Admin, Super Admin, Student+signup, Tutor) are closed as of 2026-08-08** — every page is either wired to the real DB or confirmed correctly static. `school-admin/subscription/*` was the one deliberate hold-back (pending a Paystack conversation) and is now done too. Before starting new work, check `docs/build-log.md`'s lane-closure notes and `git status`/`git log` so two sessions don't duplicate work — remaining work is marketplace follow-ups and the Open Decisions above, not page-wiring.
- **`npm run db:seed` is destructive (wipes every table) and dangerous with multiple sessions active.** Never run it or any schema-resetting command without confirming with the user first.
- **Shared infra files should not need touching for routine page-wiring**: `lib/prisma.ts`, `auth.ts`, `auth.config.ts`, `proxy.ts`, `prisma/schema.prisma`, `components/data-table.tsx`, `components/dashboard-shell.tsx`. If a task seems to require changing one, pause and confirm with the user first — a change here affects every other session's pages too. (`prisma/schema.prisma` has been extended additively several times with explicit sign-off — additive new models/fields are lower-risk than editing existing ones, but still confirm first.)
- **Non-interactive migration recipe** (since `prisma migrate dev` fails non-interactively in this sandbox): `npx prisma migrate diff --from-config-datasource prisma/schema.prisma --to-schema prisma/schema.prisma --script` → hand-place into `prisma/migrations/<UTC-timestamp>_<name>/migration.sql` (timestamp via `date -u +%Y%m%d%H%M%S`) → `npx prisma migrate deploy` → `npx prisma generate`. Used successfully 4 times; if a `P1002` advisory-lock timeout occurs, retry once a concurrent session's connection has had time to close — not a sign of corruption.
- **This Next.js version's dev-server lock is per-project-directory, not per-port.** Starting a second `next dev` (yours or a concurrent session's) against the same directory gets silently refused — the log prints "Ready" but the port never actually accepts connections. Verify with `curl` before trusting the log line; if blocked, don't wait or fight the lock — fall back to direct-DB temp-script verification (this project's primary verification method already, works for everything except literally rendering a page through HTTP). Never kill another process with a broad `pkill -f "next dev"` — it can (and has) taken out a concurrent session's server too; kill only a PID you started.
- Since other sessions may be running concurrently, run `git status`/`git log` (or `git pull`) at the start of a task if picking up work that isn't fresh.
- **`.env` points at a real, live Neon database** (project `typ`) — gitignored, so this note is the only record other sessions on this machine have.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
