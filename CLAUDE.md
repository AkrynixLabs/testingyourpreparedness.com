# CLAUDE.md

This file gives Claude Code context on this project. Keep it updated as decisions change — this is a living document, not a one-time spec.

**System design decisions are made together with the user, not unilaterally.** When a task requires a new architectural choice (a new service, a new data model shape, a new provider), surface it as a decision rather than picking silently — even if there's an obvious-seeming default.

## Project Overview

**TYP** is a Ghana-focused exam-prep and digital skills platform. BECE (Junior High School exit exam) is the flagship track currently built out in the UI, but the platform is scoped to cover multiple exam/skill tracks: **BECE, WASSCE, nursing entrance/licensing exams, university entrance exams, and digital skills training.** Schools subscribe to give their students access to practice assessments; individual ("independent") students can also self-subscribe. Content is produced by content admins, vetted by a super admin, then made available as timed assessments students take online with automatic scoring, results, progress tracking, and leaderboards.

**Decided 2026-08-05 — the product is growing into two deliberately separate systems, not one:**
1. **The exam-prep track** (everything described above and already built in the UI) — internal Content Admins, super-admin pre-approval, `Program`/`Subject`/`Question`/`Assessment`/`ExamAttempt`. **Stays exactly as-is, untouched by the below.**
2. **A new course marketplace**, Coursera/Udemy-style — independent **Tutors** self-onboard and publish real courses (video lessons, reading material, structured modules — not just timed assessments) directly to students. Key decisions locked in:
   - **Moderation**: publish-first, moderate-after (not pre-approved like the exam-prep track) — matches real marketplace scale, not the internal vetted-content trust model.
   - **Payment**: a la carte per course — a tutor sets a price, the platform takes a cut (split payment), rather than a pooled subscription revenue-share.
   - **Enrollment**: per-course (`Course → Enrollment → Student`), no fixed tutor roster — a student can enroll in courses from many different tutors independently.
   - **Content Admin and Tutor are two distinct roles, not a merge** — different onboarding (internal/vetted vs. self-service), different trust level, different content pipeline.
   These two systems will likely share only `User` (base identity/auth) and `Student` identity — `Course` is not an `Assessment`, and the marketplace's trust/payment model is intentionally not the exam-prep track's. **This is a locked product direction, not yet reflected in `prisma/schema.prisma` or `docs/data-model.md` in full — the entity design (Tutor, Course, Lesson/Module, Enrollment, CoursePayment/payout) still needs to be worked out before schema work starts.**

**Decided 2026-08-05**: "exam program/track" is modeled as a dedicated top-level `Program` entity (BECE, WASSCE, Nursing, University Entrance, Digital Skills). `Subject.programId` is a FK to it — each subject belongs to exactly one program (a subject like Biology that feeds both WASSCE and Nursing becomes two separate `Subject` rows, since content/difficulty/topics differ by program anyway). `Assessment`/`Question`/`StudyMaterial` inherit their program transitively through `Subject`. See [`docs/data-model.md`](./docs/data-model.md#the-central-open-gap-exam-program--track) for full rationale.

**Current state (updated 2026-08-05): frontend + a real, seeded database + real auth for the exam-prep track's 4 roles + three pages fully wired end-to-end as reference patterns.** Almost every page (`app/**`) still renders from `lib/demo-data.ts`/inline demo arrays — `super-admin/schools`, `school-admin/students`, and `content-admin/questions` are the exceptions, now reading/writing the live Neon database — but the pieces to change the rest now exist: `prisma/schema.prisma` (schema), `prisma/seed.ts` (seed data, run via `npm run db:seed`), and `auth.ts`/`auth.config.ts`/`proxy.ts` (real Auth.js login + route protection, replacing the old role-dropdown placeholder). No payment integration yet. The frontend's shape — what fields forms collect, what statuses things move through, what each role can see and do — **is the spec for the backend.** Build the backend to match what the UI already assumes, not the other way around.

**Decided/built 2026-08-05 — `super-admin/schools` is the reference pattern for wiring any other page to Neon**, since almost every dashboard page will need the same shape of change:
- **Split into 4 files**: `page.tsx` (Server Component — fetches via `prisma.school.findMany()`, computes stat-card numbers from real data, no `"use client"`), `schools-table.tsx` (Client Component — owns the `DataTable`/dropdown/dialog interactivity, receives fetched rows as props), `actions.ts` (Server Actions, `"use server"` — the only place mutations happen), `add-school-dialog.tsx` (still UI-only — see note in that file on why).
- **Every Server Action starts with an auth guard** (`requireSuperAdmin()` in this case, checking `session.user.role`) even though `proxy.ts` already blocks the wrong role from reaching the page at all — defense in depth per NFR-SEC-1, not redundant. Mutations call `revalidatePath(...)`; the client component calls `router.refresh()` after the action resolves so the UI updates without a full navigation.
- **Prisma's shape often doesn't match the old demo-data shape 1:1** — `School` has no `avgScore`/`plan`/`location` fields the way `lib/demo-data.ts` did. Don't fabricate data to force a match: the "Avg. Score" column was dropped entirely (no aggregation query exists yet — would need one across `ExamAttempt`), "Plan" now reads the real `subscription.plan.name` (or "No plan"), "Location" is now `town, region`. When porting another page, expect this kind of honest reshaping rather than papering over gaps.
- **Verified against the live DB**, not just typechecked: seeded schools render for real (confirmed via the actual RSC payload, not just visually), a status mutation via the same Prisma call the Server Action makes was confirmed to actually change the row and the very next page load reflected it, and the student-role auth guard was confirmed to block the route before the action could ever run.

**Decided/built 2026-08-05 — `school-admin/students` proves real tenant scoping (FR-AUTH-4 / NFR-SEC-1), not just the read/write pattern above**:
- **`schoolId` is resolved server-side from the logged-in admin's `SchoolAdmin` record** (`prisma.schoolAdmin.findUnique({ where: { userId: session.user.id } })`), never trusted from a client-supplied value — the whole point of this page as a reference case. Verified with two different school admins (`admin@achimota.edu.gh`, `admin@wesleygirls.edu.gh`) against the live DB: each saw only their own school's students, confirmed by name, not just row count.
- **`DataTable`'s `searchKey` only does shallow `item[key]` access** — it can't reach into a nested relation like `student.user.name`. Fixed by flattening a top-level `name` field onto the row in the page's data-mapping step (`name: student.user.name`) rather than changing `DataTable` itself. Watch for this same trap on any other page where the searchable field lives on a Prisma relation, not the top-level model.
- **Filter dropdowns must be populated from real per-tenant data, not hardcoded values** — the class filter previously had 5 hardcoded `SelectItem`s (`"form-3a"` etc.); now built from the actual `Class` rows fetched for that school, using the real `Class.id` (a cuid, *not* a `"form-3a"`-style slug — the earlier "Class.id should be a slug" resolution was about not conflating it with `displayName`, not about the PK's literal format) as the option value.
- **`avgScore`/`assessmentsTaken` don't exist as stored fields on `Student`** (same class of gap as `School.avgScore` before) — computed in the page from each student's `examAttempts` relation (`Math.round(avg(score/totalMarks*100))`, `null` when a student has no attempts yet, rendered as `-` rather than `0%`).

**Decided/built 2026-08-05 — `content-admin/questions` proves creator-scoping (a different scoping axis than the school-tenant one above) plus a real, guarded mutation**:
- **The page's own copy said "all questions in the platform" while the sidebar nav already called it "My Questions"** — a real pre-existing inconsistency the frontend sweep missed. Fixed while wiring real data: it's genuinely creator-scoped (`where: { createdById: session.user.id }`), matching the Content Admin role definition ("everything they create enters a review queue") and distinct from `super-admin/question-bank` (the platform-wide *approved* pool — a different page/entity).
- **Delete is a real, guarded Server Action** (`actions.ts`), not a stub — only allowed when the question is `status: "draft"` (not yet submitted for review) **and** has zero `assessmentQuestions` (not already used in an assessment) **and** `createdById` matches the caller. All three checks happen server-side in the action, never trusted from the UI disabling a button. This is the first page in the set with a delete-with-guardrails example to copy from.
- **Subject/difficulty/status/year filters were previously completely unwired** (no `value`/`onValueChange` at all, not even client-only state) — a gap the original inconsistencies sweep missed on this specific page. All four are now real and wired, matching the standard established on the other two pages.
- **Hit a transient Neon connection error mid-testing**: the very first request against a freshly-started dev server occasionally throws a garbled Prisma error (`{clientVersion: "7.9.1"}` with no useful message) on a `Promise.all` of two queries, even though the identical query succeeds every time when run standalone via `tsx`. A retry of the exact same request immediately succeeded. Read as a Neon free-tier cold-start/connection-pool-establishment race under concurrent queries, not a code bug — if this recurs, it's worth a retry before assuming the query itself is wrong.

**Decided/built 2026-08-05 — Auth.js is wired up for the exam-prep track's 4 roles** (`super_admin | content_admin | school_admin | student`; the Tutor role is not part of this, see the marketplace section above):
- **No `@auth/prisma-adapter`** — deliberately, per the "own Postgres users table" decision. Credentials provider + JWT session strategy needs no adapter at all (no `Account`/`Session`/`VerificationToken` tables), so `prisma/schema.prisma` didn't need touching.
- **Config is split into two files**: `auth.config.ts` (edge-safe: no Prisma/bcrypt imports, just callbacks + pages config) and `auth.ts` (full config: adds the `Credentials` provider, which does need Prisma to look up the user and bcrypt to compare the password hash). `proxy.ts` builds its own lightweight `NextAuth(authConfig)` instance from the edge-safe config only — it must never import `auth.ts` directly, or Prisma/bcrypt get bundled into every single request's proxy invocation.
- **`middleware.ts` is `proxy.ts` in this Next.js version** (Next 16 deprecated and renamed the file convention — confirmed via the bundled `node_modules/next/dist/docs`, not assumed). `proxy.ts` at the repo root does the role-based route protection: unauthenticated → redirect to `/login?callbackUrl=...`; authenticated but wrong role for the path prefix → redirect to that role's own dashboard root (never a 403/loop).
- **Server Components calling `auth()` cannot pass the results straight into a Client Component if other props (like a nav array containing lucide icon components) are mixed in** — functions/components aren't serializable across the RSC boundary. Fixed by splitting each of the 4 role layouts into a thin Server Component (`layout.tsx`, calls `auth()`, passes only plain strings) wrapping a small Client Component (`*-shell.tsx`, owns the icon-laden navigation array locally). Follow this pattern for any future layout that needs both session data and an icon-based nav.
- **Neon's serverless driver needs `neonConfig.webSocketConstructor = ws`** on this project's Node 20 (no native `WebSocket` global below Node 22) — same fix as the seed script, now centralized in `lib/prisma.ts` (a singleton, cached on `globalThis` in dev to survive HMR without exhausting the connection pool). Always import `prisma` from there, never instantiate `PrismaClient` directly elsewhere.
- Verified end-to-end against the live seeded Neon DB: login (correct + wrong password), session contents, dashboard rendering real seeded user data, cross-role redirect (student → `/super-admin` bounces back to `/student`), and sign-out (via `dashboard-shell.tsx`'s "Sign out" now calling real `signOut()`, previously just a dead `<Link href="/login">`).

**Full documentation lives in [`docs/`](./docs/README.md).** This file stays a short, decisions-focused summary; `docs/` holds the exhaustive reference produced by a full line-by-line sweep of every page (Aug 2026):
- [`docs/specification.md`](./docs/specification.md) — the full product & technical spec: vision, functional/non-functional requirements, data model summary, workflows, tech stack, open decisions and risks. Best starting point for a top-down view of the whole product.
- [`docs/data-model.md`](./docs/data-model.md) — every entity, every field, every status/enum value actually used in the frontend, with conflicts flagged inline
- [`docs/inconsistencies.md`](./docs/inconsistencies.md) — a prioritized punch list of real data conflicts and dead/unwired UI found during the sweep — read this before finalizing any schema. **Items #10–16 (dead/unwired UI: exam filters, profile edit form, results/[id] route param, DataTable sort, school-admin/students filters, contact form, reset-password token) were fixed 2026-08-05** — treat that section of the file as resolved/historical, not an active punch list. Items #1–9 (exam-program modeling, plan pricing, class naming, money-entity vocabulary, `School.type` split, suspended status, billing-page duplication) are still open and require a decision with the user before touching schema-adjacent code.
- [`docs/page-inventory.md`](./docs/page-inventory.md) — every route mapped to its purpose and the entities it touches

## Roles & Access Model

Four roles exist in the frontend today, each with its own dashboard shell and nav (`app/{role}/layout.tsx`). A 5th role, **Tutor**, is a locked product decision (see Project Overview above) for the new course marketplace but has no UI yet — do not build it opportunistically; it needs its own design pass (onboarding, course authoring UX, payout/earnings dashboard) before implementation starts.

| Role | Dashboard root | Core responsibilities |
|---|---|---|
| **Super Admin** | `/super-admin` | Approves/rejects questions submitted by content admins; manages schools, content admins, subjects/topics, subscription plans, revenue/payments, platform-wide analytics, audit logs |
| **Content Admin** | `/content-admin` | Creates questions (single-entry or bulk CSV/XLSX upload) and assessments; everything they create enters a review queue — nothing goes live without super admin approval |
| **School Admin** | `/school-admin` | Registers/manages a school; adds students and classes/forms; assigns assessments to classes; views results and school leaderboard; manages the school's subscription and billing |
| **Student** | `/student` | Takes timed assessments, views results/progress/leaderboard/study materials. Two flavors: **school-provisioned** (account created by their school admin, no personal billing) and **independent** (self-registers, personal subscription, requires guardian info + guardian approval per the signup flow) |

~~Login (`app/login/page.tsx`) currently lets you pick a role from a dropdown with no real credential check~~ — **RESOLVED 2026-08-05**: real Auth.js credentials login, role comes from the database, route protection enforced server-side in `proxy.ts`. See the Project Overview section above for the full writeup.

## Core Domain Entities

Short summary — see [`docs/data-model.md`](./docs/data-model.md) for the full, field-by-field version with every conflict flagged.

- **User** — base identity; `role` enum (`super_admin | content_admin | school_admin | student`); email/password (Auth.js). No `teacher` role/account exists anywhere in the frontend, though `teacher` appears as a free-text name on `Class` records.
- **School** — name, GES registration number, region/district/town/address, contact, `status` (`active | pending | suspended` — the `suspended` value and the Suspend/Reactivate actions on `super-admin/schools` were added 2026-08-05). `ownershipType` (public/private/international/religious, from signup) and `educationLevel` (Junior/Senior High/Basic, from settings) are two separate fields (split resolved 2026-08-05 — previously both forced into one `type` field).
- **Student** — belongs to a `School` (nullable for independent students), class/form, avg score, assessments taken; independent students additionally carry guardian name/phone/email + relation + a guardian-approval flag, plus their own subscription. Guardian info is duplicated across three different pages in the frontend with no shared source — model `Guardian` as its own related entity.
- **Class/Form** — canonical naming is "Form N[A/B/C]" (resolved 2026-08-05; `school-admin/classes` and `school-admin/leaderboard` previously used "JHS N[A/B]" for the same grade levels and were updated). `Class.id` is a slug (`"form-3a"`) distinct from `Class.displayName` (`"Form 3A"`).
- **Program** — new top-level entity (resolved 2026-08-05): BECE, WASSCE, Nursing, University Entrance, Digital Skills. `Subject.programId` is a FK to it — see Project Overview above and `docs/data-model.md` for full rationale.
- **Subject** — name, code (e.g. MAT, ENG), `programId` FK; **Topic** — currently a plain string, not a first-class entity (no topic id) — still open, decide the shape before topics need reliable cross-referencing. Only BECE subjects are seeded anywhere in the demo data today; WASSCE/nursing/university-entrance/digital-skills subject sets still need to be authored (the `Program` shape they'll hang off of is now decided, the content itself is not yet built).
- **Question** — text, 2–6 options, correct answer index, explanation, subject, topic, difficulty (Easy/Medium/Hard), marks, year, `status` (`draft | pending | approved | rejected`), `createdBy` (content admin), `reviewedBy` (super admin), `rejectionReason`. The *approved question pool* view (question-bank) uses a separate `active`/`archived` concept on top of this — likely two related fields, not one enum.
- **Assessment** — title, subject, set of questions, duration (minutes), authoring `status`. ⚠️ Two different pages still define this status enum differently (`draft|pending|published` vs `draft|published|archived`) — not yet resolved, reconcile into one before building. Keep this fully separate from **AssessmentAssignment.status** (`active|completed|scheduled|paused`), which tracks a specific assignment of a published assessment to classes/students, not the assessment's own authoring lifecycle.
- **ExamAttempt** — student + assessment, per-question answers, flagged questions, started/submitted timestamps, computed score, rank/percentile, topic breakdown, letter grade (A–F, thresholds 80/70/60/50).
- **SubscriptionPlan** — canonical pricing resolved 2026-08-05: Starter/Professional/Enterprise at GHS 150/350/750 per month (1,440/3,360/7,200 yearly, 20% discount), student limits 100/500/unlimited. All 4 previously-conflicting frontend sources now agree — see `docs/data-model.md#subscriptionplan`.
- **Invoice** — amount, `status` (paid/pending/overdue), period, plan, payment method. **Payment** — one entity (resolved 2026-08-05), ID prefix `PAY-`, `status: pending|completed|failed|refunded`, referenced by `Invoice` and `Subscription` (those keep their own distinct status enums — see `docs/data-model.md#payment--transaction`).
- **PaymentMethod** — card or Ghana mobile money (MTN MoMo/Vodafone/AirtelTigo — naming normalized to "MTN MoMo" 2026-08-05) — confirms Paystack's MoMo support is the right fit, not just card rails.
- **AuditLog** — actor, action, category (auth/content/school/user/billing/data/settings), description, IP, timestamp, polymorphic `details` payload (good JSONB candidate) — super admin visibility into all privileged actions.

## Key Workflows

1. **School onboarding** (`app/signup/school`) — 5-step wizard (school info → location → administrator account → school size → plan) ending in `pending` verification status, not immediate activation. A super admin (or automated check) must verify before the school is `active`.
2. **Student onboarding** — either provisioned by a school admin (`app/school-admin/students/add`, no billing) or self-service independent signup (`app/signup/independent`, 4 steps including mandatory guardian contact info and an explicit guardian-approval acknowledgment before checkout).
3. **Content pipeline** — content admin creates/uploads questions → `pending` → super admin reviews in the Review Queue (`app/super-admin/review-queue`) → `approved` (enters the question bank, usable in assessments) or `rejected` (with a reason, content admin can revise & resubmit). Same pattern applies to assessments.
4. **Bulk upload** — CSV/XLSX with required columns (`question, option_a..d, correct_answer`) and optional (`subject, topic, difficulty, explanation`); client-side preview shows per-row valid/warning/error status before committing. Needs a real parser + validation service server-side (the demo data is hardcoded).
5. **Assessment taking** (`app/student/exams/[id]/start`) — timed, question-by-question with a navigator grid (answered/current/flagged states), auto-submits on timeout, confirms before manual submit. Needs a real anti-cheat/session story eventually (tab-switch detection, one-attempt enforcement) — not yet decided, flag if asked to build this.
6. **Billing** — school admins see plan/usage/invoices/payment method (`app/school-admin/subscription/**`); super admin sees platform-wide revenue and payments (`app/super-admin/revenue`, `/payments`). All amounts are GHS.

## Tech Stack

**Frontend**
- Next.js (App Router) + TypeScript + Tailwind CSS v4, shadcn/ui (Radix primitives) — already built, keep conventions consistent with existing pages
- Deployed on Vercel (this repo is v0-linked; merges to `main` auto-deploy)

**Backend** — *decided: Next.js fullstack, not a separate service*
- Server actions / API routes inside this same Next.js app — no separate NestJS service. Chosen for speed of shipping and to keep one codebase/one deploy on Vercel, since the team needs to get a working backend live, not stand up new infra.
- Zod for validation (already a dependency, already used with react-hook-form on the client — reuse the same schemas server-side)

**Database**
- PostgreSQL via **Neon** (serverless, branches per Vercel preview deployment)
- Prisma as ORM

**Auth** — *decided: Auth.js + own Postgres users table*
- Full control needed for the 4-role model, school-level multi-tenancy (a school admin's queries must scope to their school), and the guardian-approval flow on independent student signup — none of which a stock managed-auth product handles out of the box.

**Payments** — *decided: Paystack*
- Matches the Ghana-market focus (GHS pricing, mobile money support is essential here, not optional). Route all payment logic through an internal interface/service layer rather than calling the Paystack SDK directly from business logic, so a second processor could be added later without a rewrite — but don't build that abstraction speculatively beyond a thin interface until there's an actual second processor to support.

**File storage**
- **Vercel Blob** for CSV/XLSX bulk-upload files and any question images/diagrams — stays native to the stack already in use, no extra vendor account needed at current scale.

**Background jobs**
- Not yet decided. Bulk upload processing and CSV validation currently run client-side in the demo; a real implementation likely needs either a queued job (for large files) or can stay synchronous in an API route if files stay small (≤5MB per the current UI copy). Flag this as a decision point if bulk upload volume becomes a real concern.

## Architectural Principles

1. **The frontend is the source of truth for product behavior.** Don't redesign flows, statuses, or role permissions while building the backend — match what's already built in `app/**`. If something seems wrong or incomplete, raise it as a question rather than silently changing it.
2. **No vendor lock-in beyond what's been deliberately decided.** Neon/Prisma/Auth.js/Paystack/Vercel Blob are the agreed stack — don't introduce additional SaaS dependencies without flagging it first.
3. **Payment logic goes through an internal interface**, never called directly from route handlers/business logic — see Payments above.
4. **Role/tenancy scoping is a hard requirement, not an afterthought.** Every school-admin and student query must be scoped to their school (or to "no school" for independent students) at the data-access layer, not just hidden in the UI.
5. **Approval workflows are core, not incidental.** Questions and assessments are never directly published by a content admin — the `pending → approved/rejected` gate is a first-class part of the data model and must be enforced server-side, not just presented as a UI state.

## Repo / Workflow Conventions

- Source of truth: GitHub (this repo). This repo is v0-linked — changes made in the v0 chat UI push commits directly to `main` and auto-deploy. Be aware of this when working locally: pull before starting work, since v0 may have pushed changes independently.
- [Add branch strategy once decided — e.g. main / dev / feature branches]
- [Add PR/review conventions once decided]

## Open Decisions (update as resolved)

- [ ] Background job handling for bulk upload / async work (queued vs. synchronous — see Background jobs above)
- [ ] Anti-cheat / exam-session integrity story (tab-switch detection, single-attempt enforcement, etc.)
- [ ] Branching/PR workflow, given the v0 auto-push-to-main behavior above

**Resolved 2026-08-05** (kept here briefly for the record — full detail in `docs/data-model.md` and `docs/inconsistencies.md`). Two rounds: the first covers Program/pricing/naming/status/School.type/billing-page-duplication; the second (informed by discovering a concurrent session had already built `prisma/schema.prisma`) covers Topic/Assessment-status/Achievement, aligning the frontend to decisions the schema had already made rather than re-deciding them independently:
- [x] Exam program/track modeling → dedicated `Program` entity, `Subject.programId` FK
- [x] Canonical subscription plan tiers/pricing → Starter/Professional/Enterprise at GHS 150/350/750/month
- [x] `School.status` "suspended" gap → added to the enum, wired up in `super-admin/schools`
- [x] "Form N" vs "JHS N" class naming → "Form N[A/B/C]" is canonical
- [x] `/school-admin/billing` vs `/school-admin/subscription/*` → `/subscription/*` canonical, `/billing` deleted (was unlinked from the app anyway)
- [x] Payment/Transaction/Invoice vocabulary → one `Payment` entity (`PAY-` prefix), `Invoice`/`Subscription` keep their own distinct status enums
- [x] `School.type` split → `School.ownershipType` + `School.educationLevel`
- [x] `Topic` first-class entity → `Topic { id, subjectId, name }`, matches `prisma/schema.prisma`
- [x] Assessment authoring `status` enum → unified to `draft|pending|published|archived`, matches `prisma/schema.prisma`'s `AssessmentStatus`
- [x] Achievement/badge catalog → one canonical 8-entry list in `lib/demo-data.ts`, matches `prisma/schema.prisma`'s `Achievement`/`StudentAchievement`
- [x] Billing scope vs. Program → **target model is program-scoped billing** (Coursera-style: individual programs sellable/priced on their own, not Udemy's per-course model, not an all-or-nothing bundle either). Platform-wide is the interim state only, kept until a second program has real content and a distinct audience worth pricing separately (most plausibly Nursing or University Entrance, for independent students). Nullable `programId` hook already added to `SubscriptionPlan`/`Subscription` in `prisma/schema.prisma` so the transition needs no migration. **When picking this up later**: build the program-picker UX + per-program pricing into `super-admin/plans` and the two billing pages. See `docs/data-model.md#billing-scope-vs-program--resolved-2026-08-05`.
- [x] No super-admin surface to review/publish a `pending` Assessment → `super-admin/review-queue` now has a Questions/Assessments split, each with Pending/History sub-tabs and the same preview/approve/reject-with-reason flow already used for `Question`. See `docs/inconsistencies.md` #25.
- [x] Demo-data → seed-script consolidation → `prisma/seed.ts` (run via `npm run db:seed`) seeds a full dev dataset — every model in the schema, sourced from the real frontend/demo-data content (not fabricated) — from a real, provisioned Neon database (project `typ`, created 2026-08-05 via `neonctl`). Migration applied (`prisma/migrations/20260805205837_init`). All seeded users share password `password123` (dev-only). **Gotcha for next time**: `@neondatabase/serverless`'s WebSocket-based driver needs `neonConfig.webSocketConstructor = ws` (the `ws` package) on any Node runtime below 22 that lacks a native `WebSocket` global — this project runs Node 20, so both `prisma/seed.ts` and any future server code using `PrismaNeon` need this. `ws`/`@types/ws` added as devDependencies for this reason.

## Notes for Claude Code

- This file should be updated locally as the project evolves — treat it as the primary source of project context, more current than any chat summary.
- Always raise new system-design decisions (new dependency, new service, schema shape for a not-yet-modeled entity) with the user rather than deciding unilaterally — this was explicit user guidance, not a default assumption.
- When implementing a backend feature, cross-check the relevant `app/**` page(s) first for the exact fields, statuses, and role permissions the UI already assumes.
- **The user runs multiple Claude Code sessions against this repo.** Update this file (and the relevant `docs/*.md`) in the same turn you make a change that shifts project state — a resolved decision, a newly discovered inconsistency, a fixed/superseded punch-list item, a new dependency. Don't let this drift into a stale snapshot the way the old pre-sweep CLAUDE.md did (see git history). Treat `docs/inconsistencies.md` items as tracked state: strike through or annotate them as fixed rather than leaving them looking like open work once resolved.
- Since other sessions may be running concurrently, run `git status`/`git log` (or `git pull`) at the start of a task if picking up work that isn't fresh, to avoid clobbering or duplicating another session's in-flight changes.
- **`.env` now points at a real, live Neon database** (project `typ`, provisioned 2026-08-05) — it's gitignored so this note is the only record other sessions on this machine have. `prisma/seed.ts` is destructive (wipes every table before reseeding) — never run `npm run db:seed` or any schema-resetting command without confirming with the user first, the same way this session did before running it.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
