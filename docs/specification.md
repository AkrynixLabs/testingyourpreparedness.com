# TYP — Product & Technical Specification

**Status**: Living document. Frontend is built (`app/**`, demo data); backend (Neon + Prisma + Auth.js + Paystack) is in progress in a separate/concurrent workstream (`prisma/schema.prisma`). This spec consolidates the product vision, requirements, and architecture decisions made through 2026-08-05.

**How this doc relates to the others in `docs/`**:
- [`CLAUDE.md`](../CLAUDE.md) — the short, AI-agent-facing summary of decisions; source of truth for "what's been decided," kept terse on purpose.
- [`data-model.md`](./data-model.md) — full field-by-field entity reference, reverse-engineered from the frontend, with every resolved conflict documented in detail.
- [`inconsistencies.md`](./inconsistencies.md) — the punch list of conflicts/dead UI found in the original frontend sweep, now mostly resolved.
- [`page-inventory.md`](./page-inventory.md) — every route mapped to purpose and entities touched.
- **This document** — the requirements-and-architecture narrative that ties the above together into a single spec, for onboarding a new contributor or reviewing scope end-to-end.

---

## 1. Product Overview

**TYP** is a Ghana-focused education platform. It is deliberately **two separate products sharing one brand, one login system, and (mostly) one codebase**:

### 1.1 The Exam-Prep Track (built in the frontend, backend in progress)

A subscription-based exam-preparation service. Schools subscribe to give their students access to practice assessments; individual ("independent") students can also self-subscribe. Content is authored internally by vetted Content Admins, approved by a Super Admin, then delivered as timed, auto-scored assessments with results, progress tracking, and leaderboards.

Scoped to five tracks: **BECE** (Junior High School exit exam — the only track with real content today), **WASSCE**, **nursing entrance/licensing exams**, **university entrance exams**, and **digital skills training**.

### 1.2 The Course Marketplace (decided, not yet designed/built)

A Coursera/Udemy-style open marketplace layered on top. Independent **Tutors** self-onboard and publish real courses (video lessons, reading material, structured modules — not just timed assessments) directly to students, without prior vetting. This is intentionally a **separate system** from the exam-prep track:

| Dimension | Exam-Prep Track | Course Marketplace |
|---|---|---|
| Content creator | Content Admin (internal, vetted, invited) | Tutor (self-onboarding, public) |
| Content shape | Questions, timed assessments | Courses: lessons (video/text), modules, materials |
| Trust model | Pre-approval (`pending → approved/rejected`), nothing goes live unreviewed | Publish-first, moderate-after (report/flag driven) |
| Monetization | Subscription (school or independent student plan) | A la carte per course, platform takes a cut (split payment) |
| Student relationship | Belongs to a school (or independent), takes assigned/available assessments | Per-course enrollment (`Course → Enrollment → Student`), no fixed roster |
| Billing scope | Platform-wide today; **target is program-scoped** (see §9) | Per-course pricing set by the tutor |

The two systems share only base identity (`User`) and `Student` identity — a `Course` is not an `Assessment`, and a `Tutor` is not a `Content Admin`. **The marketplace is a locked product direction but has no entity design or UI yet** — Tutor, Course, Lesson/Module, Enrollment, and CoursePayment/payout all still need to be designed as their own effort before implementation starts. Do not build any part of it opportunistically.

### 1.3 Current Build State

**Frontend only.** Every page in `app/**` is built and navigable against seeded/demo data (`lib/demo-data.ts` plus inline arrays). There is no live database, auth, API, or payment integration in the frontend yet — a separate workstream is building the Postgres/Prisma schema (`prisma/schema.prisma`) to match. **The frontend is the specification**: what fields forms collect, what statuses things move through, what each role can see and do, is what the backend must match — not the reverse.

---

## 2. Goals & Non-Goals

### 2.1 Goals
- Give Ghanaian JHS/SHS students, and eventually nursing/university-entrance/digital-skills learners, a reliable, low-friction way to practice for high-stakes exams with real scoring, ranking, and progress feedback.
- Let schools manage their students' access, assignments, and results centrally, with billing that fits how Ghanaian schools actually budget (subscription, GHS pricing, mobile money support).
- Build a real, enforceable content-quality gate for the exam-prep track (nothing reaches a student unreviewed).
- Lay the groundwork for a second revenue line and content channel — the tutor-driven course marketplace — without compromising the trust model of the exam-prep track.
- Ship a working backend against the existing frontend, not redesign the frontend around a new backend.

### 2.2 Non-Goals (at least for the current phase)
- Not building a general-purpose LMS/SIS (student information system) — no gradebook, attendance, timetabling.
- Not replacing school-side pedagogy — the platform is supplementary practice/assessment, not primary instruction (until the marketplace's course content changes that calculus).
- Not supporting non-Ghana markets, currencies, or curricula at this stage — GHS and Ghanaian exam syllabi are hard assumptions throughout.
- Not building the course marketplace's UI/entities yet — locked direction, deferred implementation.
- Not building a native mobile app — responsive web only, for now.

---

## 3. Users & Roles

Four roles exist in the frontend today; a fifth (Tutor) is a committed future addition.

| Role | Dashboard | Summary |
|---|---|---|
| **Super Admin** | `/super-admin` | Platform operator. Approves/rejects Content-Admin-submitted questions *and* assessments; manages schools (including suspend/reactivate), content admins, subjects/topics/programs, subscription plans, platform-wide revenue/payments, analytics, audit logs. |
| **Content Admin** | `/content-admin` | Internal, invited/vetted content author. Creates questions (single-entry or bulk CSV/XLSX) and assessments. Nothing they create is visible to students until Super Admin approval. |
| **School Admin** | `/school-admin` | Represents a subscribing school. Registers the school, manages students and classes/forms, assigns assessments to classes, views results/leaderboards, manages the school's own subscription/billing. |
| **Student** | `/student` | Takes timed assessments, views results/progress/leaderboard/study materials. Two flavors: **school-provisioned** (added by a school admin, no personal billing) and **independent** (self-registers, personal subscription, requires guardian info + guardian-approval acknowledgment since many are minors). |
| **Tutor** *(planned, undesigned)* | *(none yet)* | Self-onboarding marketplace content creator. Publishes courses directly (publish-first moderation), sets pricing, receives payout on a split-payment basis. **Do not build until its own design pass is done.** |

~~Login (`app/login/page.tsx`) currently has no real credential check — a role dropdown picks which dashboard to show.~~ **RESOLVED 2026-08-05**: real Auth.js authentication (Credentials provider + JWT sessions, no adapter — see `CLAUDE.md`) with server-side role enforcement via `proxy.ts` (Next 16's renamed `middleware.ts`). Verified end-to-end against the live seeded database.

---

## 4. Functional Requirements

Numbered for traceability. "MVP" = required for the exam-prep track backend to go live against the existing frontend. "Future" = course marketplace, deferred.

### 4.1 Authentication & Session (FR-AUTH)

| ID | Requirement | Priority |
|---|---|---|
| FR-AUTH-1 | Users authenticate with email + password via Auth.js; no anonymous access to any dashboard route. | **Done** — Credentials provider, JWT sessions, `proxy.ts` enforces this on every `/super-admin`, `/content-admin`, `/school-admin`, `/student` request. |
| FR-AUTH-2 | A user's role is server-determined from their account record, never client-selected (replaces today's login dropdown). | **Done** — role comes from the `User.role` column via the JWT/session, dropdown removed from `app/login/page.tsx`. |
| FR-AUTH-3 | Password reset via emailed token (`?token=` already wired up in the frontend UI, needs a real token-issuing/validating backend). | MVP — still open (the UI reads the token, nothing issues/validates one yet) |
| FR-AUTH-4 | School Admin and Student queries are scoped to their own school (or "no school" for independents) at the data-access layer — not just hidden in the UI. | MVP — still open (no data-fetching queries exist yet; auth only covers *who* is logged in, not per-record scoping) |
| FR-AUTH-5 | Independent-student signup requires guardian contact info and an explicit guardian-approval acknowledgment before checkout completes. | MVP — still open (signup form isn't wired to the backend yet) |

### 4.2 School Lifecycle (FR-SCH)

| ID | Requirement | Priority |
|---|---|---|
| FR-SCH-1 | A school registers via a 5-step wizard (info → location → admin account → size → plan) and enters `pending` status — not active until Super Admin verification. | MVP |
| FR-SCH-2 | `School.status` supports `active \| pending \| suspended`; Super Admin can suspend and reactivate a school, which should gate that school's students' access. | MVP |
| FR-SCH-3 | `School.ownershipType` (public/private/international/religious) and `School.educationLevel` (Junior High/Senior High/Basic) are captured as two independent fields. | MVP |
| FR-SCH-4 | School Admin manages classes/forms (`Form N[A/B/C]` naming), and adds students individually or via CSV bulk-import. | MVP |
| FR-SCH-5 | School Admin assigns a published Assessment to one or more classes/individual students with a scheduling window and options: shuffle questions/options, show results/answers, passing score, retake limit, notification toggle. | MVP |
| FR-SCH-6 | School Admin views school-wide results/analytics by class, subject, and topic, and a school-scoped leaderboard. | MVP |
| FR-SCH-7 | School Admin manages the school's own subscription: plan, usage, invoices, payment method (card or Ghana mobile money). | MVP |

### 4.3 Content Pipeline — Exam-Prep Track (FR-CONTENT)

| ID | Requirement | Priority |
|---|---|---|
| FR-CONTENT-1 | Content Admin authors questions (text, 2–6 options, correct-answer index, explanation, subject, topic, difficulty, marks, year) individually or via CSV/XLSX bulk upload with client- and server-side validation. | MVP |
| FR-CONTENT-2 | Every new question enters `status: draft \| pending`; nothing is visible to students until a Super Admin sets it to `approved` (or `rejected`, with a reason, returning it to the content admin for revision). | MVP |
| FR-CONTENT-3 | An approved question additionally has an `isActive` flag, independent of `status`, controlling whether it's currently eligible for use in new assessments (distinct from its authoring lifecycle). | MVP |
| FR-CONTENT-4 | Content Admin builds Assessments from the approved question bank (title, subject, question set, duration, difficulty). | MVP |
| FR-CONTENT-5 | Assessment authoring status is `draft \| pending \| published \| archived`. A Content Admin cannot self-publish — moving from `draft` to `pending` ("Submit for Review") is the only content-admin-initiated transition; `pending → published/draft(+reason)` is Super-Admin-only. | MVP |
| FR-CONTENT-6 | Super Admin reviews pending Questions and Assessments in one Review Queue (`/super-admin/review-queue`), each with its own Pending/History view, search/filter, bulk-approve, and preview/approve/reject-with-reason flow. | MVP |
| FR-CONTENT-7 | Every Subject belongs to exactly one Program (see §4.4); Question/Assessment/StudyMaterial inherit their Program transitively through Subject. | MVP |

### 4.4 Program / Track Management (FR-PROGRAM)

| ID | Requirement | Priority |
|---|---|---|
| FR-PROGRAM-1 | `Program` is a first-class entity: BECE, WASSCE, Nursing, University Entrance, Digital Skills — extensible, not hardcoded. | MVP |
| FR-PROGRAM-2 | Only BECE has real subject/question/assessment content today; the platform must support adding a new program's content set without a schema change. | MVP |
| FR-PROGRAM-3 | Super Admin manages Subjects/Topics per Program. | MVP |

### 4.5 Assessment Taking & Scoring (FR-EXAM)

| ID | Requirement | Priority |
|---|---|---|
| FR-EXAM-1 | Student sees Available / Scheduled / Completed exam tabs, filterable by search and subject. | MVP |
| FR-EXAM-2 | Exam-taking UI is timed with a question navigator (answered/current/flagged states), supports flagging, auto-submits on timeout, and confirms before manual submit. | MVP |
| FR-EXAM-3 | Submission produces an `ExamAttempt`/result: score, rank, percentile, correct/incorrect breakdown, per-topic breakdown, letter grade (A ≥80, B ≥70, C ≥60, D ≥50, F <50 — computed server-side, not client-side). | MVP |
| FR-EXAM-4 | Student can view full result detail (including per-question review with explanations) for any of their past attempts, addressed by ID. | MVP |
| FR-EXAM-5 | An assigned assessment's rollout to a class/student is tracked independently of the assessment's own authoring status, via `AssessmentAssignment.status: active \| completed \| scheduled \| paused`. | MVP |
| FR-EXAM-6 | *(Deferred, flagged)* Anti-cheat/session-integrity story — tab-switch detection, single-attempt enforcement — not yet designed; raise as a decision before building. | Future |

### 4.6 Student Experience (FR-STU)

| ID | Requirement | Priority |
|---|---|---|
| FR-STU-1 | Student dashboard shows upcoming/available exams, recent results, and progress summary. | MVP |
| FR-STU-2 | Student progress view shows longer-term analytics (subject trend charts, weak/strong topics) and a canonical Achievement catalog (one shared list, not per-page). | MVP |
| FR-STU-3 | Student can browse/bookmark Study Materials (documents, video) per subject. | MVP |
| FR-STU-4 | Student profile is editable (controlled form, not `defaultValue`-only) and reflects saved changes immediately. | MVP |
| FR-STU-5 | Guardian info (name/phone/relation/contact) is stored once per independent student, not duplicated per page. | MVP |
| FR-STU-6 | School-provisioned students carry no personal billing; independent students carry their own subscription. | MVP |

### 4.7 Billing & Payments (FR-BILL)

| ID | Requirement | Priority |
|---|---|---|
| FR-BILL-1 | Canonical `SubscriptionPlan` tiers for schools: Starter/Professional/Enterprise at GHS 150/350/750 per month (1,440/3,360/7,200/year at 20% discount), student limits 100/500/unlimited. | MVP |
| FR-BILL-2 | Independent-student plans: Free, Premium Monthly (GHS 25), Premium Termly (GHS 60), Premium Annual (GHS 200). | MVP |
| FR-BILL-3 | All plans are platform-wide today (`Program`-agnostic) via a nullable `programId` on `SubscriptionPlan`/`Subscription` that defaults to `null`. See §9 for the program-scoped target. | MVP |
| FR-BILL-4 | Payment processing goes through Paystack (GHS + Ghana mobile money: MTN MoMo, Vodafone Cash, AirtelTigo), behind an internal service interface — never called directly from business logic. | MVP |
| FR-BILL-5 | One canonical `Payment` entity (`PAY-` prefix, `status: pending\|completed\|failed\|refunded`) referenced by both `Invoice` and `Subscription`; `Invoice.status` (`paid\|pending\|overdue`) and `Subscription.status` (`active\|past_due\|cancelled`) remain their own distinct enums. | MVP |
| FR-BILL-6 | School Admin can view/download invoice history and manage saved payment methods (card or mobile money, one default). | MVP |
| FR-BILL-7 | Super Admin has platform-wide revenue/payment visibility and analytics. | MVP |
| FR-BILL-8 | *(Future)* Tutor payout: a la carte per course, platform takes a percentage cut via Paystack split payment. | Future |

### 4.8 Platform Administration (FR-ADMIN)

| ID | Requirement | Priority |
|---|---|---|
| FR-ADMIN-1 | Super Admin manages Content Admin accounts (invite, per-subject assignment, activity/output stats). | MVP |
| FR-ADMIN-2 | Super Admin sees platform-wide analytics: growth, subject performance, regional distribution. | MVP |
| FR-ADMIN-3 | An Audit Log records privileged actions (`action`, `category`, actor, IP, timestamp, polymorphic `details`) and is visible to Super Admin. | MVP |
| FR-ADMIN-4 | A national/platform-wide leaderboard exists (school, student, region, subject cuts). | MVP |
| FR-ADMIN-5 | *(Future)* Report generation as an async service (PDF/Excel/CSV) distinct from the many page-local one-off CSV exports — decide whether to unify. | Future |

### 4.9 Public / Marketing Surface (FR-PUB)

| ID | Requirement | Priority |
|---|---|---|
| FR-PUB-1 | Public marketing site: homepage, pricing (rendered directly from canonical `SubscriptionPlan` data), contact form (real state capture + backend submission), FAQ. | MVP |
| FR-PUB-2 | School invite-code join flow (`/join`) — currently a hardcoded code, needs a real `POST /schools/verify-invite`-equivalent. | MVP |

### 4.10 Course Marketplace (FR-MKT) — Future, Undesigned

| ID | Requirement | Priority |
|---|---|---|
| FR-MKT-1 | Tutor self-onboarding (no Super Admin invite required, unlike Content Admin). | Future |
| FR-MKT-2 | Tutor authors Courses composed of Lessons/modules (video, text, structured content) — a materially richer content shape than `Assessment`. | Future |
| FR-MKT-3 | Course content is publish-first, moderate-after — no pre-approval queue like the exam-prep track. Moderation trigger mechanism (report-based vs. automated flags vs. spot-check) still undecided. | Future |
| FR-MKT-4 | Student enrolls per-course (`Course → Enrollment → Student`); no fixed tutor roster. | Future |
| FR-MKT-5 | Tutor sets a per-course price; platform takes a cut via Paystack split payment on purchase. | Future |
| FR-MKT-6 | Tutor has an earnings/payout dashboard. | Future |

---

## 5. Non-Functional Requirements

### 5.1 Performance (NFR-PERF)
- **NFR-PERF-1**: Exam-taking pages (`student/exams/[id]/start`) must remain responsive under a live countdown timer with no perceptible input lag — this is a trust-critical path (a laggy timer during a real exam attempt is a support/credibility risk).
- **NFR-PERF-2**: Dashboard list views (schools, students, questions, payments) must paginate server-side once real data volume exceeds what client-side `DataTable` pagination can reasonably hold (the current frontend pagination is entirely client-side and will not scale past a few hundred rows).
- **NFR-PERF-3**: Bulk CSV/XLSX question upload must handle files up to the documented 5MB limit without blocking the UI thread; large-file processing should not be synchronous in the request/response cycle (see §5.9 background jobs, still undecided).

### 5.2 Security (NFR-SEC)
- **NFR-SEC-1**: All role/tenancy scoping enforced server-side at the data-access layer (Prisma query layer), never solely in the UI — a School Admin's queries must be incapable of returning another school's data even with a crafted request.
- **NFR-SEC-2**: The approval gate (`pending → approved/rejected`) for Question/Assessment is enforced server-side — a Content Admin's API access must be incapable of directly setting `status: published/approved`.
- **NFR-SEC-3**: Passwords hashed (Auth.js defaults), never stored/logged in plaintext; password reset tokens single-use and time-limited.
- **NFR-SEC-4**: Payment credentials/PCI scope stays with Paystack — the platform never stores raw card numbers; only tokenized references.
- **NFR-SEC-5**: Guardian-approval acknowledgment for independent (often minor) students is a real, auditable gate, not just a UI checkbox — must be recorded with a timestamp in a way that could be produced as evidence of consent.
- **NFR-SEC-6**: Audit log captures all privileged actions (approve/reject/suspend/delete/export) with actor, IP, and timestamp, immutable from the application layer.

### 5.3 Scalability (NFR-SCALE)
- **NFR-SCALE-1**: Schema must support adding a new `Program` (content track) without a breaking migration — already satisfied by the `Program`/`Subject.programId` design.
- **NFR-SCALE-2**: Billing must support moving from platform-wide to program-scoped plans without migrating existing subscribers — already satisfied by the nullable `programId` hook on `SubscriptionPlan`/`Subscription`.
- **NFR-SCALE-3**: Neon's serverless Postgres + branch-per-preview-deployment model should be used as intended — preview environments get their own DB branch, not a shared dev database.

### 5.4 Availability & Reliability (NFR-AVAIL)
- **NFR-AVAIL-1**: Exam submission must not silently lose a student's answers on network failure — auto-save/retry behavior needed once this is backed by a real API (currently all client-side state, lost on refresh).
- **NFR-AVAIL-2**: Payment webhook handling (Paystack) must be idempotent — a retried webhook must not double-charge or double-record a payment.

### 5.5 Compliance & Data Protection (NFR-COMPLY)
- **NFR-COMPLY-1**: Student data (much of it minors') is subject to Ghana's Data Protection Act — access to student PII must be role-scoped and auditable (ties to NFR-SEC-1/6).
- **NFR-COMPLY-2**: Guardian consent for independent (minor) students must be captured and retrievable (ties to NFR-SEC-5).
- **NFR-COMPLY-3**: Payment data handling deferred to Paystack's PCI-DSS compliance — the platform itself should never be in PCI scope for card data.

### 5.6 Localization (NFR-LOC)
- **NFR-LOC-1**: All monetary amounts are GHS; currency is not yet parameterized for other markets and shouldn't be speculatively abstracted before there's a second currency to support.
- **NFR-LOC-2**: Ghana mobile money (MTN MoMo, Vodafone Cash, AirtelTigo) must be a first-class payment option alongside cards, not a card-first design with MoMo bolted on.
- **NFR-LOC-3**: Content (subjects, exam terminology — "Form," "BECE," "WASSCE") reflects Ghanaian curricula/conventions specifically; no assumption of portability to other countries' exam systems.

### 5.7 Accessibility (NFR-A11Y)
- **NFR-A11Y-1**: Built on shadcn/ui (Radix primitives), which provides a solid accessible-by-default baseline (keyboard nav, ARIA) — maintain this as new pages/components are added rather than introducing custom unaccessible widgets.
- **NFR-A11Y-2**: `prefers-reduced-motion` is already respected for the homepage's scroll/animation effects — extend this convention to any future animated UI.

### 5.8 Observability (NFR-OBS)
- **NFR-OBS-1**: The Audit Log and the webhook event taxonomy sketched in `super-admin/settings` (`school.created`, `payment.completed`, `exam.completed`, `content.approved`, etc.) should converge into one real domain-event system — currently three different, non-matching event vocabularies exist across Audit Log, webhooks config, and the live-activity page's own event types. Unify before building an actual event/webhook dispatch system.
- **NFR-OBS-2**: `next.config.mjs` currently sets `typescript: { ignoreBuildErrors: true }` — revisit once the backend introduces real typed API contracts the frontend must match; type errors should block production builds by then.

### 5.9 Maintainability (NFR-MAINT)
- **NFR-MAINT-1**: ~~Demo data currently lives in `lib/demo-data.ts` plus scattered inline arrays across ~40 page files — needs eventual consolidation into seed scripts once the real database exists.~~ **RESOLVED 2026-08-05**: `prisma/seed.ts` (`npm run db:seed`) seeds every model from real frontend-sourced content. A Neon project was provisioned and the schema migrated to verify it end-to-end.
- **NFR-MAINT-2**: Two toast libraries (shadcn's `use-toast` and `sonner`) currently coexist — consolidate to one before building out real notification UX.
- **NFR-MAINT-3**: Background-job strategy (queued vs. synchronous) for bulk upload/CSV validation is not yet decided — flag as a decision point if upload volume becomes a real concern (see §11).

---

## 6. Data Model Summary

Full field-by-field detail lives in [`data-model.md`](./data-model.md). Core entities:

**Identity & Access**: `User` (role: super_admin/content_admin/school_admin/student), `SchoolAdmin`, `ContentAdmin`, `Invitation`

**Exam-Prep Domain**: `Program`, `Subject` (→ `Program`), `Topic` (→ `Subject`), `Question` (→ `Subject`, `Topic`), `Assessment` (→ `Subject`), `AssessmentAssignment` (a published Assessment assigned to classes/students), `ExamAttempt`/Result

**School/Student Domain**: `School`, `Class`/Form, `Student` (→ `School`, nullable), `Guardian`

**Content**: `StudyMaterial`, `StudyGoal`, `Achievement`/`StudentAchievement`

**Billing**: `Program`-nullable `SubscriptionPlan`, `Subscription`, `Invoice`, `Payment`, `PaymentMethod`

**Platform**: `AuditLog`

**Course Marketplace (undesigned)**: `Tutor`, `Course`, `Lesson`/`Module`, `Enrollment`, `CoursePayment`/payout — placeholders only, not yet modeled.

---

## 7. Core Workflows

1. **School onboarding** — 5-step signup wizard → `pending` → Super Admin verifies → `active`.
2. **Student onboarding** — school-provisioned (added by School Admin, no billing) or independent self-service (4-step signup incl. guardian info + guardian-approval acknowledgment + plan/checkout).
3. **Content pipeline** — Content Admin creates/uploads → `pending` → Super Admin reviews in Review Queue → `approved`/`published` (usable) or `rejected` (with reason, revise & resubmit). Same shape for both Question and Assessment.
4. **Bulk upload** — CSV/XLSX with required (`question, option_a..d, correct_answer`) and optional (`subject, topic, difficulty, explanation`) columns; client-side preview shows per-row valid/warning/error before commit.
5. **Assessment taking** — timed, question-by-question, navigator grid, flagging, auto-submit on timeout, confirm before manual submit → scored `ExamAttempt`.
6. **Billing** — School Admin manages plan/invoices/payment method; Super Admin sees platform-wide revenue/payments. All GHS.

---

## 8. Tech Stack & Architecture

| Layer | Decision | Rationale |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui | Already built; keep conventions consistent |
| Hosting | Vercel (v0-linked; merges to `main` auto-deploy) | Existing setup |
| Backend | Next.js fullstack (API routes/server actions) — no separate service | Speed of shipping, one codebase/one deploy |
| Validation | Zod (already used client-side with react-hook-form) | Reuse schemas server-side |
| Database | PostgreSQL via Neon (serverless, branch-per-preview) | Matches Vercel preview-deployment model |
| ORM | Prisma | Already being built out in `prisma/schema.prisma` |
| Auth | Auth.js + own Postgres users table | Full control needed for 4(+1)-role model, school-level multi-tenancy, guardian-approval flow |
| Payments | Paystack | GHS pricing + Ghana mobile money support; behind an internal interface so a second processor could be added later |
| File storage | Vercel Blob | CSV/XLSX uploads, question images — no new vendor needed |
| Background jobs | **Undecided** | Bulk upload/CSV validation currently client-side; needs a queued-job or synchronous-API-route decision |

### 8.1 Architectural Principles
1. The frontend is the source of truth for product behavior — don't redesign flows/statuses/permissions while building the backend; raise concerns as questions, don't silently change them.
2. No vendor lock-in beyond what's deliberately decided — Neon/Prisma/Auth.js/Paystack/Vercel Blob are the agreed stack.
3. Payment logic goes through an internal interface, never called directly from route handlers/business logic.
4. Role/tenancy scoping is enforced at the data-access layer, not just hidden in the UI.
5. Approval workflows (`pending → approved/rejected`) are enforced server-side, for both Question and Assessment.

---

## 9. Billing Direction: Program-Scoped (Coursera-style)

Billing is **platform-wide today** (one subscription = access to every Program) but this is an interim state, not the target. **The committed direction is program-scoped billing** — individual programs (BECE, WASSCE, Nursing, etc.) sellable and priced on their own, closer to how Coursera lets a learner subscribe to a single Specialization rather than only offering all-or-nothing bundling. Not Udemy's pure per-course model either — this applies at the Program level, not per-assessment.

**Why**: independent students studying for a single exam (e.g. a nursing licensing candidate) have no use for BECE content and shouldn't be forced to pay for it. Schools will likely stay platform-wide in practice since they span grade levels, but the model is a per-plan choice, not a global constraint.

**Status**: the schema hook (`SubscriptionPlan.programId`, `Subscription.programId`, both nullable, back-related on `Program`) is already in `prisma/schema.prisma`. Every plan is still `null` (platform-wide) since only BECE has content. **Trigger to build the real UI**: once a second program (most plausibly Nursing or University Entrance) has real content and a distinct-enough audience — at that point, add a program-picker to signup/upgrade and per-program pricing to `super-admin/plans` and the two billing pages.

---

## 10. Course Marketplace Direction (Locked, Undesigned)

See §1.2 for the model summary. Key locked decisions, pending full entity design:
- **Moderation**: publish-first, moderate-after.
- **Payment**: a la carte per course, platform cut via split payment.
- **Enrollment**: per-course, no fixed roster.
- **Roles**: Tutor is distinct from Content Admin — different trust level, different onboarding.
- **Content shape**: real courses (lessons/video/modules), not timed assessments.

**Explicitly not yet decided**: Tutor onboarding/verification requirements, moderation trigger mechanism (report-based vs. automated vs. spot-check), course content storage (video hosting is a new infra decision — Vercel Blob may not be the right fit for video at scale), payout schedule/minimum threshold, whether Tutors can also be Content Admins (or vice versa), category/discovery taxonomy for courses, and reviews/ratings.

---

## 11. Open Decisions

Tracked in full in `CLAUDE.md`'s Open Decisions section; summarized here:

| # | Decision | Status |
|---|---|---|
| 1 | Background job handling for bulk upload (queued vs. synchronous) | Open |
| 2 | Anti-cheat / exam-session integrity story | Open |
| 3 | Branching/PR workflow (given v0's auto-push-to-main) | Open |
| 4 | Demo-data → seed-script consolidation | **Resolved** — `prisma/seed.ts` |
| 5 | Course marketplace entity design (Tutor, Course, Lesson, Enrollment, payout) | Open — deliberately deferred to its own session |
| 6 | Program-scoped billing UI (picker + per-program pricing) | Open — deferred until a 2nd program has content |
| 7 | Report-generation service vs. page-local exports | Open |
| 8 | Domain-event/webhook taxonomy unification (3 competing vocabularies exist) | Open |
| 9 | Toast library consolidation (`use-toast` vs `sonner`) | Open |
| 10 | `next.config.mjs`'s `ignoreBuildErrors: true` | Open — revisit once real typed API contracts exist |

All schema/naming/pricing/status decisions from the original frontend sweep (Program modeling, plan pricing, Form-vs-JHS naming, money-entity vocabulary, `School.type` split, suspended status, billing-page duplication, `Topic` entity, Assessment status enum, Achievement catalog, pending-assessment review surface) are **resolved** — see `CLAUDE.md` and `data-model.md` for the record.

---

## 12. Risks & Watch-Items

- **Concurrent workstreams**: a separate session is actively building `prisma/schema.prisma`. Changes to this spec, `data-model.md`, or the schema itself should check current state before editing to avoid clobbering in-flight work (see `CLAUDE.md`'s "Notes for Claude Code").
- **Marketplace scope creep**: the course marketplace is a substantial second product. Resist building any part of it (Tutor role, Course entity, etc.) opportunistically alongside exam-prep-track backend work — it needs its own dedicated design pass.
- **Content thinness**: only BECE has real content today. Program-scoped billing, and the "second program" trigger for it, both depend on WASSCE/Nursing/University/Digital-Skills content actually being authored — that's a content-production dependency, not just an engineering one.
- **Anti-cheat gap**: no session-integrity story exists yet for timed exams; as the platform gains real stakes (paying schools, real grades), this becomes a credibility risk worth prioritizing before it's asked for.
