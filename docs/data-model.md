# Data Model Reference

Every entity below is reverse-engineered from the frontend — form fields, demo arrays, and table columns across `app/**` and `lib/demo-data.ts`. Where pages disagree on a field name, status value, or ID scheme, it's flagged inline with **⚠️**. See [inconsistencies.md](./inconsistencies.md) for the prioritized version of the same conflicts.

Treat this as the starting point for a Prisma schema, not a copy-paste-ready one — several entities need a product decision before they can be finalized (marked **NEEDS DECISION**).

---

## The central open gap: Exam Program / Track

**No page anywhere in the app models this.** Every subject, question, assessment, class ("JHS 1-3"), and student record in the entire frontend is implicitly BECE-only — confirmed explicitly in `super-admin/subjects/page.tsx`'s own UI copy ("Create a new subject for the **BECE curriculum**"), in `question-bank/page.tsx`'s stat label ("8 — BECE subjects"), and in every subject list across every role (always the same ~8 BECE subjects: Mathematics, English Language, Integrated Science, Social Studies, ICT, RME, French, Ghanaian Language).

There is no `program`/`track` field, no WASSCE/nursing/university-entrance/digital-skills subjects, questions, or UI anywhere — despite the product being scoped to cover all five ([CLAUDE.md](../CLAUDE.md#project-overview)).

**RESOLVED 2026-08-05**: `Program` is a dedicated top-level entity (`id`, `name` — BECE/WASSCE/Nursing/University Entrance/Digital Skills, `slug`, `description`). `Subject` gets a `programId` FK — each subject belongs to exactly one program (the "same subject feeds two programs" case, e.g. Biology for both WASSCE and Nursing, is handled by having two separate `Subject` rows rather than a many-to-many, since content/difficulty/topic breakdown will differ by program anyway). `Assessment`, `Question`, and `StudyMaterial` inherit their program transitively through `Subject`, so they don't need their own `programId`. Student "enrollment" in a program is inferred from which program's subjects/assessments they've taken — no separate `Enrollment`/`ExamRegistration` join table for now; revisit if a student needs to be explicitly scoped to one program (e.g. a WASSCE-only account that shouldn't see BECE content).

The one related dimension that *is* consistently modeled — and should **not** be conflated with program/track — is **enrollment type**: `"school" | "independent"`, i.e. whether a student is provisioned by a school or self-registered. This appears on `super-admin/students`, `super-admin/leaderboard`. Keep this as its own field.

---

## User & Roles

`role` enum (from login page dropdown and 4 separate dashboard layouts): `super_admin | content_admin | school_admin | student`. No `teacher` role exists anywhere despite `teacher` being referenced as a free-text name on `Class` records (school-admin) — teachers are not modeled as users/accounts at all currently.

No auth is wired up. Login (`app/login/page.tsx`) accepts any email/password and routes purely by a role dropdown selection. No session, no JWT, no cookie.

### SchoolAdmin-specific
- `role: "Primary Admin" | "Admin"` (from `school-admin/settings`) — one admin per school is primary (protected from removal); others are regular admins.
- An `Invitation` entity is implied (settings page shows a "pending invitations" empty state after inviting an admin by email) but never modeled with fields beyond email.

### ContentAdmin-specific (`super-admin/content-admins/page.tsx`)
```
{
  id, name, email, avatar: string | null,
  status: "active" | "inactive" | "pending",
  subjects: string[],              // multi-subject assignment
  questionsCreated, questionsApproved, questionsPending, questionsRejected: number,
  lastActive: string, joinedDate: string
}
```

---

## School

Canonical shape (`lib/demo-data.ts`):
```
{ id, name, location, students: number, plan: "Premium"|"Standard"|"Starter", status: "active"|"pending", avgScore }
```

Richer shape used in registration (`app/signup/school`) and school-admin settings, not yet reconciled with the above:
```
{
  name, type: "Junior High School" | "Senior High School" | "Basic School" | "public" | "private" | "international" | "religious",
  registrationNumber (GES),  code: "ACH-001",
  region, district, town, address, postalCode,
  email, phone, website, established: string(year), logo,
  totalStudents, jhsStudents, numberOfClasses
}
```
**RESOLVED 2026-08-05**: `type` splits into two fields — `School.ownershipType` (`public | private | international | religious`, collected at signup — renamed from `schoolType` in `app/signup/school/page.tsx`) and `School.educationLevel` (`Junior High School | Senior High School | Basic School`, editable in school-admin settings — renamed from `type` in `app/school-admin/settings/page.tsx`). These answer genuinely different questions and shouldn't share a field.

`status`: **RESOLVED 2026-08-05** — added `suspended` as a third value (`active | pending | suspended`). `super-admin/schools` now actually sets it via the Suspend/Reactivate actions (previously the button existed with no backing state).

---

## Class / Form

**RESOLVED 2026-08-05**: canonical display convention is **"Form N[A/B/C]"** — the majority of pages already used it, and it's the more common day-to-day term in Ghanaian JHS/SHS schools. `school-admin/classes` and `school-admin/leaderboard` (previously "JHS N[A/B]") were updated to match. `Class.id` should be a slug distinct from `Class.displayName` (e.g. `id: "form-3a"`, `displayName: "Form 3A"`) — the manual add-student form already used the slug form; the CSV bulk-import preview used the display string. Both should key off the slug internally and render the display string in the UI.

Shape (`school-admin/classes`):
```
{ id, name, form: string, students: number, teacher: string (free text, no FK), academicYear: string, subjects: number(count), avgPerformance }
```
`teacher` is always a plain string — no teacher account/entity exists to link to.

Class identifiers also appear inconsistently as slugs (`"form-3a"`) in some select inputs vs. display strings (`"Form 3A"`) in others (e.g. CSV bulk-import preview uses the display string while the manual add-student form uses the slug) — the backend needs one canonical `Class.id` and should not conflate it with `Class.displayName`.

---

## Student

Canonical flat shape (`lib/demo-data.ts`, used by `school-admin` dashboard/students list, `super-admin/students`):
```
{ id, name, email, school, class, avgScore, assessmentsTaken }
```

Richer intake shape (`school-admin/students/add`, single-add form — the most complete Student schema in the app):
```
{
  firstName, lastName, email, phone, class, dateOfBirth,
  gender: "male" | "female",
  address, notes,
  guardianName, guardianPhone, guardianEmail,
  guardianRelation: "mother" | "father" | "guardian" | "other"
}
```

`super-admin/students` platform-wide shape adds enrollment/status dimensions:
```
{
  id: string ("S001"), name, email,
  type: "school" | "independent",      // enrollment type — see note above
  school: string | null,               // null when independent
  form: "JHS 1" | "JHS 2" | "JHS 3",
  registeredDate, lastActive, examsCompleted, avgScore,
  status: "active" | "inactive" | "pending"
}
```

**Guardian** should likely be its own related entity, not duplicated free text — the same guardian name/phone/email appears independently on `student/profile`, `student/settings`, and the school-admin add-student form, with no shared source.

Independent-student signup (`app/signup/independent`) additionally requires an explicit guardian-approval acknowledgment checkbox before the plan/checkout step — guardian approval is a gate, not just contact info storage.

---

## Subject / Topic

Canonical (`lib/demo-data.ts`):
```
Subject: { id, name, code, questionCount, topicCount }
Topic:   plain string, keyed under topics[subjectId] — NOT a first-class entity, no topic id/code
```
Only 4 subjects exist in the shared demo data (English Language, Mathematics, Integrated Science, Social Studies), but individual pages reference up to 10 different subject lists with drifting names/counts: some say "English" vs "English Language", some include ICT/RME/French/Ghanaian Language/Creative Arts/Career Technology, `super-admin/analytics` claims "8 subjects" while `lib/demo-data.ts` only has 4.

**RESOLVED 2026-08-05**: `Topic` is now a first-class entity (`Topic { id, subjectId, name }`, unique per subject) in `prisma/schema.prisma`, referenced by FK from `Question.topicId` rather than fragile string matching.

Once Program/Track is modeled, `Subject` almost certainly needs a `programId` — see the open gap section above.

---

## Question

Content-admin authoring shape (`content-admin/questions/create`, `lib/demo-data.ts`):
```
{
  id, question/text, options: string[2-6], correctAnswer: number (index),
  explanation, subject, topic, difficulty: "Easy"|"Medium"|"Hard",
  marks: number, year: number,
  status: "draft" | "pending" | "approved" | "rejected"
}
```
Review flow adds: `createdBy` (content admin), `reviewedBy` (super admin), `rejectionReason` (free text, with quick-pick canned reasons in the reject dialog UI).

⚠️ `super-admin/question-bank` (the *approved* pool) uses a **different** status value — every record there has `status: "active"` — and adds fields not present in the authoring shape: `author`, `approvedBy`, `approvedAt`, `timesUsed`, `avgScore`. **This strongly suggests two related-but-distinct states**: `Question.status` (authoring lifecycle: draft/pending/approved/rejected) vs. a separate `active`/`archived` flag for whether an approved question is currently eligible for use in assessments — don't conflate them into one enum.

Bulk upload (`content-admin/questions/upload`) expects CSV/XLSX columns: `question, option_a, option_b, option_c, option_d, correct_answer (A-D), subject, topic, difficulty, explanation` (last 4 optional).

---

## Assessment

**Two distinct lifecycles exist and must not be merged into one status enum:**

1. **Assessment (authoring/library) status** — **RESOLVED 2026-08-05**: one enum, `draft | pending | published | archived` (the superset of `lib/demo-data.ts`'s `draft|pending|published` and `content-admin/assessments`'s previous `draft|published|archived`, matching `prisma/schema.prisma`'s `AssessmentStatus`). `content-admin/assessments/page.tsx` was updated to use the full 4-value enum and its draft-row action now reads "Submit for Review" (sets `pending`) rather than directly publishing — a content admin was previously able to bypass the approval gate entirely for assessments, which contradicted the `pending → approved/rejected` principle already enforced for `Question`. **Still open**: there's no super-admin surface yet to actually review/publish a `pending` assessment (the review-queue page only handles `Question`) — needed before this workflow is complete end-to-end.

   The question-bank's separate active/archived-on-top-of-authoring-status concept is also resolved: `Question.isActive: boolean`, distinct from `Question.status`.

   Shape:
   ```
   { id, title, subject, questionCount/questions, duration(min), difficulty?: "Easy"|"Medium"|"Hard"|"Mixed",
     status, timesAssigned/attempts, avgScore, createdBy, createdAt, updatedAt }
   ```

2. **AssessmentAssignment status** (`school-admin/assessments`) — a *published* assessment assigned to classes/students by a school admin:
   ```
   {
     id, title, subject, assignedTo: string (free text — should be a structured class/student ID list),
     totalStudents, completed, inProgress, notStarted,
     avgScore, startDate, endDate,
     status: "active" | "completed" | "scheduled" | "paused",
     duration, questions
   }
   ```
   The assign wizard (`school-admin/assessments/assign`) collects: assignment target (classes or individual students, multi-select), schedule window (date+hour granularity), and a rich options block: `shuffleQuestions`, `shuffleOptions`, `showResults`, `showAnswers`, `passingScore` (%), `allowRetake` + `maxAttempts` (`2|3|5|unlimited`), `sendNotification`.

---

## ExamAttempt / Result

Richest shape, from `student/results/[id]`:
```
{
  id, title, subject, date, duration, totalTime,
  score, totalMarks, rank, totalStudents,
  correctAnswers, incorrectAnswers, totalQuestions,
  grade: "A"-"F", percentile,
  topicBreakdown: [{ topic, correct, total, percentage }],
  questions: [{ id, text, yourAnswer, correctAnswer, isCorrect, topic, explanation? }],
  classAverage, highestScore, lowestScore
}
```
Grade thresholds (`student/results` list page, `getGrade()`): A ≥80, B ≥70, C ≥60, D ≥50, F <50 — a real business rule worth keeping consistent server-side once computed there instead of client-side.

`student/exams/[id]/start` session shape (in-progress, not yet an ExamAttempt): per-question selected answer, a `Set` of flagged question IDs, a countdown timer, auto-submit on timeout.

**Known gap**: `student/results/[id]/page.tsx` doesn't actually read its own `[id]` route param — always renders the same static result regardless of which result was clicked. Not a data-model issue, but a reminder that this page's "shape" is real even though its current wiring is a stub.

---

## Study Materials & Study Goals (new entities, only found in Student section)

```
StudyMaterial: {
  id, title, subject, type: "document" | "video",   // "image" handled in an icon switch but never used in data — likely future
  format: "PDF" | "MP4", size, duration, views, rating,
  isBookmarked: bool, lastUpdated, description, topics: string[]
}
```

```
StudyGoal (student/progress — no other page references this): {
  goal: string, progress: number, total: number, dueDate: string
}
```
⚠️ `progress`/`total` units are inconsistent per goal in the demo data itself (exam-count for one goal, percentage-points for another, day-streak for a third) — this needs a `unit` field or per-goal-type handling, not a single numeric pair, once implemented server-side.

## Achievements / Badges

Referenced on `student/profile`, `student/progress`, and `school-admin/leaderboard` (as a per-student `badges: number` count).

**RESOLVED 2026-08-05**: one canonical `Achievement` catalog (8 entries: Top Performer, Perfect Score, Study Streak, Consistency King, Top 5, Subject Master, Quick Learner, National Star — merged from the two previously-divergent per-page lists, keeping every unique concept and resolving the one true name collision, "Subject Master", to a single criterion). Lives in `lib/demo-data.ts` as the `achievements` export, consumed by both `student/profile` and `student/progress` instead of each defining its own array. Matches `prisma/schema.prisma`'s `Achievement` + `StudentAchievement` join-table shape (`name, description, icon, criteria` + a per-student `earnedAt`).

---

## Subscription Plans, Billing & Payments

**RESOLVED 2026-08-05** — canonical school plan pricing (all 4 previously-conflicting sources now updated to match):

| Tier | Monthly (GHS) | Yearly (GHS, 20% off) | Student limit |
|---|---|---|---|
| Starter | 150 | 1,440 | 100 |
| Professional | 350 | 3,360 | 500 |
| Enterprise | 750 | 7,200 | Unlimited |

`super-admin/plans` was adopted as canonical (it's meant to be the plan-definition source of truth, and its numbers already had clean 20%-off yearly math), and `super-admin/billing`, `school-admin/subscription/upgrade`, and `lib/demo-data.ts` (`subscriptionPlans.school`) were updated to match — including switching `demo-data.ts` from termly to monthly billing and renaming its tiers from Starter/Standard/Premium to Starter/Professional/Enterprise. Student (not school) plans were already consistent and untouched (Free / GHS 25 monthly / GHS 60 termly / GHS 200 annual).

Canonical shape (`school-admin/subscription/upgrade`, most complete):
```
{ id: "starter"|"professional"|"enterprise", name, monthlyPrice, yearlyPrice, currency: "GHS",
  studentLimit: number (-1 = unlimited), description, features: string[], popular: bool }
```
Yearly = 20% discount off monthly×12 — kept consistent across all sources.

### Billing scope vs. Program — RESOLVED 2026-08-05

The pricing above (and `prisma/schema.prisma`'s current `SubscriptionPlan`/`Subscription` models) is **platform-wide today**: one subscription grants access to every `Program`, with no way to buy/scope access to a single track (BECE vs WASSCE vs Nursing vs University Entrance vs Digital Skills). This wasn't a deliberate choice — it fell out of `Program` being modeled purely as a content-organization dimension, and it's what the frontend already implicitly does today (no program picker exists anywhere in signup/billing).

**Target model, decided 2026-08-05**: move to **program-scoped billing**, Coursera-style — not Udemy's pure per-course/one-time-purchase model, and not Coursera's "everything bundled" mode either, but the middle Coursera actually runs: individual programs/tracks can be subscribed to on their own, priced and sold separately, once each has enough content and a distinct-enough audience to justify it. The clearest case is independent students — someone studying for a nursing licensing exam has no use for BECE content and shouldn't have to pay for it. Schools will likely stay platform-wide in practice (a school spans grade levels and will probably want full coverage), but the model doesn't force that — it's a per-plan choice, not a global one.

This is the committed direction, not just a hedge — build the program-picker UX and per-program pricing on `super-admin/plans` and the two billing pages once a second program (most plausibly Nursing or University Entrance) has real content. Until then, every plan stays platform-wide since there's nothing to scope yet. The schema hook exists now so that transition needs no migration or disruption to existing subscribers:
```
SubscriptionPlan.programId  String?  // null = platform-wide (all programs); set = scoped to one Program
Subscription.programId      String?  // same meaning, independently settable from the plan's default
```
All current/seeded plans keep `programId: null`. When a second program (most plausibly Nursing or University Entrance, since those attract independent adult learners who have no use for BECE content) has real content and a distinct-enough audience to justify separate pricing, introduce program-scoped plans by inserting new `SubscriptionPlan` rows with `programId` set — no schema change needed at that point, and existing platform-wide subscribers are unaffected. This also leaves room for schools and independent students to diverge later (e.g. schools stay platform-wide indefinitely, independent students get program-scoped plans once it matters) without needing two separate billing models built up front.

**Applied to `prisma/schema.prisma` 2026-08-05** (user explicitly requested it, after confirming the schema hadn't changed since last checked, to avoid clashing with the other session's in-flight edits) — `SubscriptionPlan.programId` and `Subscription.programId` are both nullable `String?` FKs to `Program`, with back-relations added on `Program`. Schema validated clean (`npx prisma validate`). Every plan is still seeded/expected with `programId: null` (platform-wide) — only the hook exists, nothing scoped yet.

### Subscription
```
{ plan, price, currency, billingCycle: "monthly"|"yearly", studentLimit, currentStudents,
  renewalDate, startDate, status: "active"|"past_due"|"cancelled" }
```

### Invoice
Canonical (richest, `school-admin/subscription/invoices`):
```
{ id: "INV-YYYY-NNN", date, dueDate, paidDate, amount, status: "paid"|"pending"|"overdue", period, plan, paymentMethod }
```

### Payment / Transaction
Previously three different ID prefixes and three overlapping-but-not-identical status/type vocabularies existed for what's fundamentally the same money-movement concept (`super-admin/payments`'s `PAY-001`/`completed|pending|failed|refunded`; `super-admin/revenue`'s `TXN001`/matching status/`new|renewal|upgrade`; `super-admin/plans`'s `recentSubscriptions.action: upgraded|new|renewed`).

**RESOLVED 2026-08-05**: one `Payment` entity, ID prefix `PAY-`, referenced by both `Invoice` and `Subscription` rather than three parallel views each inventing their own vocab:
```
Payment { id: "PAY-NNNNN", amount, currency: "GHS", status: "pending"|"completed"|"failed"|"refunded",
  type: "new"|"renewal"|"upgrade", method: "mobile_money"|"card"|"bank_transfer", schoolId, planId, createdAt }
```
`Subscription.status` (`active|past_due|cancelled`) stays a separate enum on `Subscription` — it describes the subscription's lifecycle state, not any single payment's outcome, and conflating the two would lose information (a subscription can be `past_due` while its most recent `Payment` is `failed` for a specific, more granular reason). `Invoice.status` (`paid|pending|overdue`) likewise stays distinct from `Payment.status` — an invoice can exist and go `overdue` before any `Payment` is even attempted against it.

### PaymentMethod
Most detailed shape (`school-admin/subscription/payment-method`):
```
Card: { id, type: "card", brand, last4, expiry, isDefault }
MobileMoney: { id, type: "mobile_money", provider, number, isDefault }
```
`type` enum: `card | mobile_money`. MoMo providers seen: MTN, Vodafone Cash, AirtelTigo — confirms the backend needs Ghana mobile money rails alongside card, not card-only (relevant to the Paystack decision in CLAUDE.md — Paystack supports MoMo in Ghana, which fits).

---

## Audit Log

```
{
  id: "LOG-001",
  action: "login"|"logout"|"create"|"update"|"delete"|"approve"|"reject"|"export"|"login_failed",
  category: "auth"|"content"|"school"|"user"|"billing"|"data"|"settings",
  user, userRole, description, ipAddress, timestamp,
  status: "success"|"warning"|"error",
  details: Record<string, any>   // polymorphic — shape varies per action type
}
```
`details` is genuinely polymorphic (different keys depending on `action`) — this maps well to a JSONB column rather than fixed relational columns.

## Domain Events (webhooks) — from `super-admin/settings` API tab

Dot-namespaced event list shown as configurable webhook triggers: `school.created`, `school.updated`, `payment.completed`, `payment.failed`, `exam.completed`, `content.approved`. **This is a useful hint at the core domain-event taxonomy** the backend should eventually emit, but note it doesn't fully match either the Audit Log's `action`/`category` vocabulary or `super-admin/live-activity`'s separate real-time event `type` enum (`exam_started|exam_completed|login|registration`) — three different event-naming conventions for overlapping concepts, worth unifying once an event system is actually built.

---

## Reports

`super-admin/reports` implies an async report-generation concept: `{ id, name, description, lastGenerated, format: "PDF"|"Excel" }`, with a custom builder (report type + date range + export format incl. CSV). Distinct from the many individual page-level "Export" buttons scattered throughout (schools, payments, audit logs, etc.) which appear to be one-off CSV exports rather than this unified report system. Worth deciding whether all exports funnel through one report-generation service or stay page-local.
