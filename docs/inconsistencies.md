# Inconsistencies & Dead UI — Punch List

Found during a full line-by-line sweep of every page in `app/**`. Ranked roughly by how much they'd cost to leave unresolved when building the backend. Each item names the exact files involved so it's actionable.

## Blocks backend schema work — resolve first

**Items 1–9 below were resolved with the user 2026-08-05** — kept here as a record of what was conflicting, not as open work. Full resolution detail in [data-model.md](./data-model.md).

1. ~~**Exam Program/Track is completely unmodeled.**~~ — **RESOLVED**: dedicated `Program` entity (BECE/WASSCE/Nursing/University Entrance/Digital Skills); `Subject.programId` FK. See [data-model.md](./data-model.md#the-central-open-gap-exam-program--track).

2. ~~**Subscription plan pricing genuinely conflicts across 4 sources**~~ — **RESOLVED**: canonical is `super-admin/plans`'s numbers — Starter/Professional/Enterprise at GHS 150/350/750 per month (1,440/3,360/7,200 yearly). `super-admin/billing`, `school-admin/subscription/upgrade`, and `lib/demo-data.ts` updated to match (the latter also switched from termly to monthly billing and renamed its tiers). See [data-model.md](./data-model.md#subscriptionplan).

3. ~~**"Suspend school" action has no corresponding status.**~~ — **RESOLVED**: added `suspended` to `School.status` (`active | pending | suspended`); `super-admin/schools`'s Suspend/Reactivate actions now actually update it (`app/super-admin/schools/page.tsx`).

## Real naming drift — pick one convention

4. ~~**"Form N[A/B/C]" vs "JHS N[A/B]" class naming used inconsistently**~~ — **RESOLVED**: canonical is "Form N[A/B/C]" (majority convention + more common local usage). `app/school-admin/classes/page.tsx`, `app/school-admin/leaderboard/page.tsx`, and (found in a later pass, same fix) `app/super-admin/students/page.tsx` were updated from "JHS N" to "Form N".

5. ~~**Class identifiers are inconsistently slugs vs. display strings.**~~ — **RESOLVED** (documented, not yet a running data layer to enforce it in): `Class.id` is a slug (`"form-3a"`), `Class.displayName` is the rendered string (`"Form 3A"`) — apply this convention when the real `Class` table is built.

6. ~~**Money-movement entities each invented their own ID prefix and status vocabulary.**~~ — **RESOLVED**: one `Payment` entity (`PAY-` prefix) referenced by `Invoice` and `Subscription`; `Payment.status` (`pending|completed|failed|refunded`) is distinct from `Subscription.status` (`active|past_due|cancelled`) and `Invoice.status` (`paid|pending|overdue`) — those describe different things and stay separate enums. See [data-model.md](./data-model.md#payment--transaction).

7. ~~**`School.type` is being asked to answer two different questions with one field.**~~ — **RESOLVED**: split into `School.ownershipType` (`public|private|international|religious`) and `School.educationLevel` (`Junior High School|Senior High School|Basic School`). `app/signup/school/page.tsx`'s `schoolType` field renamed to `ownershipType`; `app/school-admin/settings/page.tsx`'s `type` field renamed to `educationLevel`.

8. ~~**MTN Mobile Money is spelled two ways.**~~ — **RESOLVED**: standardized on "MTN MoMo" everywhere (`app/school-admin/subscription/payment-method/page.tsx`).

## Two competing implementations of the same feature

9. ~~**School-admin has two billing UIs.**~~ — **RESOLVED**: `/school-admin/subscription/*` is canonical (already linked from settings/dashboard, richer data shapes). `/school-admin/billing` was unlinked from anywhere in the app and has been deleted.

## Unwired / non-functional UI (won't block schema design, but will surprise a QA pass)

**Items 10–16 below were fixed 2026-08-05** — kept here as a record of what was wrong, not as open work.

10. ~~**`student/exams` page's search and subject filter don't actually filter anything**~~ — **FIXED**: both filters now apply to all three tabs (`app/student/exams/page.tsx`).

11. ~~**`student/profile`'s "Edit Profile" form isn't wired to any state**~~ — **FIXED**: form is now fully controlled state, edits persist to the displayed profile on save, and Cancel reverts them (`app/student/profile/page.tsx`).

12. ~~**`student/results/[id]/page.tsx` never reads its own `[id]` route param**~~ — **FIXED**: page now reads the param via `useParams` and looks up the matching record; the 6 result records (previously only in `results/page.tsx` and disconnected from the single static detail object) were consolidated into `lib/demo-data.ts` as `examResults`, shared by both the list and detail pages. Unknown ids 404.

13. ~~**`DataTable`'s `Column.sortable` flag is declared in the type but never implemented**~~ — **FIXED**: clicking a sortable column header now sorts (asc/desc toggle) with a directional icon indicator (`components/data-table.tsx`).

14. ~~**`school-admin/students` list's class/performance filters are unwired**~~ — **FIXED**: both `Select`s now have `value`/`onValueChange` and the table/stats reflect the filtered set.

15. ~~**`app/contact/page.tsx`'s form doesn't capture its own field values**~~ — **FIXED**: all fields (including the two `Select`s) are now controlled state; resets after a successful submit.

16. ~~**`app/reset-password/page.tsx` never reads a reset token from the URL**~~ — **FIXED**: reads `?token=` via `useSearchParams` (component wrapped in `Suspense` per Next's requirement), shows an "Invalid Reset Link" state when the token is missing.

17. Most "save" actions across Settings pages (all 4 roles) are `setTimeout`-simulated with no real persistence — expected for a frontend-only build, just noting it's uniform across the app so the eventual API-wiring pass can follow one pattern.

## Resolved 2026-08-05 (backend now built against these)

23. ~~**`Topic` was a plain string, not a first-class entity.**~~ — **RESOLVED**: `prisma/schema.prisma` now has `Topic { id, subjectId, name }`, FK'd from `Question.topicId`.

24. ~~**Assessment authoring status enum disagreed between `lib/demo-data.ts` and `content-admin/assessments`.**~~ — **RESOLVED**: unified to `draft | pending | published | archived`. Fixing this also surfaced a real bug: `content-admin/assessments` let a content admin publish a draft directly, bypassing the approval gate that already applies to `Question` — changed to "Submit for Review" (sets `pending`).

25. ~~**No super-admin surface existed to review/publish a `pending` Assessment.**~~ — **RESOLVED 2026-08-05**: `super-admin/review-queue` now has a "Questions"/"Assessments" split at the top level, each with its own Pending/Review-History sub-tabs, search/subject filter, bulk-approve, and preview/approve/reject dialogs — mirrors the existing Question review UX exactly. Approving a pending assessment sets it to `published`; rejecting returns it to `draft` with a reason, same `pending → approved/rejected` shape as `Question`.

26. ~~**`content-admin/questions`'s own copy said "Manage all questions in the platform" while the sidebar nav labeled the same link "My Questions."**~~ — **RESOLVED 2026-08-05** (found while wiring the page to real data, missed by the original sweep): it's genuinely creator-scoped, matching the nav label and the Content Admin role definition — copy fixed to match. Also found on the same page: the subject/difficulty/status/year filters had no `value`/`onValueChange` at all (not even local-only state, unlike the other unwired-filter cases fixed earlier) — now real and wired.

## Smaller things worth knowing about

18. **Two toast libraries are installed and presumably both in use**: the shadcn/Radix `use-toast.ts` pattern and `sonner`. Worth consolidating on one before real notification UX is built out.

19. **`next.config.mjs` sets `typescript: { ignoreBuildErrors: true }`** — type errors currently don't block a production build. Worth revisiting once the backend introduces real typed API responses that the frontend needs to match.

20. ~~**Achievement/badge catalogs differ between `student/profile` and `student/progress`.**~~ — **RESOLVED 2026-08-05**: one canonical 8-entry list, now shared from `lib/demo-data.ts` (`achievements` export) by both pages. See [data-model.md](./data-model.md#achievements--badges).

21. **All "total" stat-card numbers (1,240 students, 45,000+ platform students, etc.) are hardcoded and don't match the actual demo array lengths** (`lib/demo-data.ts`'s `students` array has 6 entries). Purely decorative — don't treat these as informative about expected real-world data volume.

22. **Guardian info (name/phone/email) is duplicated independently** on `student/profile`, `student/settings`, and the school-admin add-student form, with no shared source — should become a related `Guardian` record once modeled, not copy-pasted per page.
