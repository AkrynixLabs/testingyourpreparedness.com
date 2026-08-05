# Page Inventory

Every route in `app/**`, grouped by role/surface. Use this to find which pages touch a given entity before changing its shape. Full field-level detail lives in [data-model.md](./data-model.md); this is the map, not the territory.

## Public / Marketing (`components/public-header.tsx` + `public-footer.tsx` shell)

| Route | Purpose | Notes |
|---|---|---|
| `/` | Homepage — hero, programs, features, how-it-works, for-schools/students, CTA | Recently redesigned; light theme, scoped `.marketing` CSS class |
| `/pricing` | Renders `subscriptionPlans` from `lib/demo-data.ts` directly | No discrepancy — pure render, no local duplicate data |
| `/contact` | Lead-capture form + FAQ | ⚠️ Form fields aren't wired to state — see inconsistencies.md #15 |
| `/login` | Single login form with a role dropdown | No real auth — picks dashboard by dropdown value, not credentials |
| `/forgot-password` | Email-only request form | Fake `setTimeout` submit |
| `/reset-password` | New password form with strength checks | ⚠️ Never reads a reset token from the URL — inconsistencies.md #16 |
| `/join` | 2-step school invite-code flow | Hardcoded valid code `"ACHIMOTA2024"`; verify step implies future `POST /schools/verify-invite` |
| `/signup` | Role picker (School vs Student) | Static nav page, no form |
| `/signup/school` | 5-step school registration wizard | Ends in `pending` verification, not immediate activation |
| `/signup/school/success` | Post-registration confirmation | Static |
| `/signup/student` | Choice between independent vs school-provisioned | Static nav page |
| `/signup/independent` | 4-step independent student signup | Requires guardian info + explicit guardian-approval checkbox before plan selection |

## Super Admin (`app/super-admin/*`, shell: `layout.tsx`)

| Route | Purpose | Key entities |
|---|---|---|
| `/super-admin` | Dashboard root — platform KPIs, recent activity | `platformStats`, `schools`, `recentActivity` (demo-data.ts) |
| `/super-admin/schools` | School registry — add/approve/suspend | `School`; "Suspend" action has no matching status value (inconsistencies.md #3) |
| `/super-admin/schools/[id]` | Single school detail — students, classes, billing history, activity log | Richest per-school view; performance charts |
| `/super-admin/students` | Platform-wide student management (school + independent) | `Student` + `type: school\|independent` enrollment dimension |
| `/super-admin/content-admins` | Manage content admin users | `ContentAdmin` entity, per-subject assignment, question stats |
| `/super-admin/subjects` | Manage subjects/topics | Explicitly "BECE curriculum" in UI copy — see data-model.md open gap |
| `/super-admin/review-queue` | Approve/reject content-admin-submitted questions | Core `Question` approval workflow, bulk approve, rejection reasons |
| `/super-admin/question-bank` | Browse the *approved* question pool | Adds `author`, `approvedBy`, `timesUsed`, `avgScore` — distinct from authoring status |
| `/super-admin/revenue` | Deep financial analytics (daily/weekly/monthly/transactions) | `Transaction` (`TXN-` prefix) — 3rd money-ID scheme, see inconsistencies.md #6 |
| `/super-admin/plans` | Plan tier definitions (should be canonical pricing source) | ⚠️ Disagrees with billing/upgrade pages on price — inconsistencies.md #2 |
| `/super-admin/payments` | Transaction + invoice monitoring | `Payment` (`PAY-` prefix), `Invoice` |
| `/super-admin/billing` | Per-school subscription/billing management | `Subscription` (`active\|past_due\|cancelled`) |
| `/super-admin/analytics` | Platform growth, subject performance, regional distribution | Heatmap is `Math.random()`, not real data |
| `/super-admin/reports` | Report generation center + overview/performance tabs | Implies async report-generation service, PDF/Excel/CSV |
| `/super-admin/leaderboard` | National school/student/region/subject rankings | Introduces `School.type: Public\|Private` dimension |
| `/super-admin/live-activity` | Simulated real-time platform monitor | Own event-type enum, doesn't match audit log or webhook vocab |
| `/super-admin/audit-logs` | System-wide audit trail | Polymorphic `details` field — good JSONB candidate |
| `/super-admin/settings` | Own account + platform config + API/webhooks | Webhook event list is useful domain-event hint (data-model.md) |

## School Admin (`app/school-admin/*`, shell: `layout.tsx`)

| Route | Purpose | Key entities |
|---|---|---|
| `/school-admin` | Dashboard root | Uses real `students`/`assessments` from demo-data.ts (one of few pages that does) |
| `/school-admin/students` | Student list/search | Filters unwired (inconsistencies.md #14) |
| `/school-admin/students/add` | Single-add + CSV bulk-import | Richest `Student` intake shape in the app (guardian, DOB, gender, address) |
| `/school-admin/classes` | Manage classes/forms | Uses "JHS N" naming — conflicts with rest of section |
| `/school-admin/leaderboard` | School-wide/class/subject rankings | Introduces `badges`/`streak` per-student concepts |
| `/school-admin/assessments` | Assigned-assessment tracking | `AssessmentAssignment.status: active\|completed\|scheduled\|paused` — distinct from authoring status |
| `/school-admin/assessments/assign` | 4-step assignment wizard | Rich options block (shuffle, retake limits, pass score, notify) |
| `/school-admin/results` | School-wide analytics (class/subject/topic) | Imports `subjects` from demo-data.ts but hardcodes 4 subject columns |
| `/school-admin/billing` | ⚠️ Legacy/duplicate all-in-one billing page | References "Accra Academy" — inconsistencies.md #9 |
| `/school-admin/subscription` | Canonical subscription hub | Links out to invoices/upgrade/payment-method |
| `/school-admin/subscription/invoices` | Full invoice history | Richest `Invoice` shape — treat as canonical |
| `/school-admin/subscription/payment-method` | Manage saved cards + mobile money | `PaymentMethod` union type, Ghana MoMo providers |
| `/school-admin/subscription/upgrade` | Plan comparison + change flow | Canonical-candidate `SubscriptionPlan` shape; fake (non-date-based) proration |
| `/school-admin/settings` | School profile, admins, notifications, security | `School.type` used for education level here (conflicts with signup's ownership-type usage) |

## Content Admin (`app/content-admin/*`, shell: `layout.tsx`)

| Route | Purpose | Key entities |
|---|---|---|
| `/content-admin` | Dashboard root | Chart data hand-authored, doesn't match actual `questions` array length |
| `/content-admin/questions` | My-questions list | `Question` authoring view |
| `/content-admin/questions/create` | Single question form | Core `Question` fields incl. options/correctAnswer/explanation |
| `/content-admin/questions/upload` | Bulk CSV/XLSX upload with validation preview | Documents exact required/optional CSV columns |
| `/content-admin/questions/pending` | Track own submissions' review status | Pending/approved/rejected-with-reason views |
| `/content-admin/assessments` | Assessment library management | ⚠️ Local `Assessment` interface status enum (`draft\|published\|archived`) differs from demo-data.ts's (`draft\|pending\|published`) |
| `/content-admin/assessments/create` | Build assessment from question bank | Mock only — no real persistence, hardcoded marks-per-question |
| `/content-admin/settings` | Own account settings | Adds authoring prefs (`defaultSubject`, `questionsPerPage`) beyond generic profile fields |

## Student (`app/student/*`, shell: `layout.tsx`)

| Route | Purpose | Key entities |
|---|---|---|
| `/student` | Dashboard root | `upcomingExams.status: scheduled\|available` — inconsistent with `/student/exams`'s locked-scheduled-exam behavior |
| `/student/exams` | Available/scheduled/completed exam tabs | ⚠️ Search/filter state exists but isn't applied (inconsistencies.md #10) |
| `/student/exams/[id]/start` | Timed exam-taking UI | Question navigator, flagging, auto-submit on timeout |
| `/student/results` | Past results list | `getGrade()` A–F thresholds (80/70/60/50) |
| `/student/results/[id]` | Single result detail | ⚠️ Ignores its own `[id]` param (inconsistencies.md #12); richest ExamAttempt shape |
| `/student/progress` | Longer-term analytics, goals, achievements | Introduces `StudyGoal` entity (only place it exists) |
| `/student/materials` | Study materials library | `StudyMaterial`, broader subject list than content-admin's (French, Ghanaian Language) |
| `/student/profile` | Public/personal profile | ⚠️ Edit form not wired to state (inconsistencies.md #11); own achievement catalog (differs from progress page's) |
| `/student/settings` | Account settings + guardian info + exam prefs | Guardian info duplicated from profile page |

## Shared components (used across all roles)

| File | Purpose |
|---|---|
| `components/dashboard-shell.tsx` | Shared sidebar+header shell for all 4 dashboards. Exports `NavItem`/`NavGroup` types. `userRole`/`userName`/`userEmail` are plain string props — no session/auth context wired in yet. |
| `components/data-table.tsx` | Generic reusable table: search + client-side pagination. ⚠️ `Column.sortable` flag declared but unimplemented (inconsistencies.md #13). |
| `components/stat-card.tsx` | KPI tile with optional trend indicator |
| `components/public-header.tsx` / `public-footer.tsx` | Marketing chrome, shared by all public pages |
| `components/reveal.tsx` | Scroll-triggered fade-in (IntersectionObserver), used on homepage |
| `components/theme-provider.tsx` | Thin `next-themes` wrapper |
| `hooks/use-mobile.ts` | `useIsMobile()` — 768px breakpoint check |
| `hooks/use-toast.ts` | shadcn toast hook — coexists with `sonner` (inconsistencies.md #18) |
