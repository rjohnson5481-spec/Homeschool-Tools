# HANDOFF — v0.31.4 Phase 3 Session 3.6: Compliance modal sheet (Course Catalog pattern)

## What was completed this session
- Phase 3 Session 3.6: presentation correction from
  Session 3.5's inline collapse pattern to a modal
  sheet matching the Course Catalog Quick Actions
  pattern exactly. No behavioral change to settings
  save, Firestore subscription, or planner hours
  wiring.
- `ComplianceSection.jsx` renamed to
  `ComplianceSheet.jsx` via `git mv` (history
  preserved as 84% similar). 135 lines — uses the
  same overlay / sheet panel / handle / header /
  close / body structure as `CourseCatalogSheet.jsx`.
  Component signature is now `{ open, onClose, uid }`
  with the `if (!open) return null` early return.
- `ComplianceSheet.css` is 121 lines. Larger than the
  Session 3.6 prompt's 90-line target because the
  full sheet skeleton (overlay, panel, handle, header,
  title, close, body, slide-up animation, large-phone
  media queries) is ~50 lines on top of the
  carried-over `sc-*` form-field rules. Comfortably
  under the 250 hard limit and on the low end versus
  peer sheets (CourseCatalogSheet.css = 261).
- `RecordsMainView.jsx` — the Quick Actions row is
  now a thin inline `<button className="ar-action-btn"
  onClick={onComplianceOpen}><span>🛡️ Track
  Compliance</span><span>›</span></button>`. The
  sheet itself renders elsewhere via
  `AcademicRecordsSheets`, matching how all other
  Quick Actions rows are wired.
- `AcademicRecordsTab.jsx` — manages
  `complianceSheetOpen` `useState`, threads
  `onComplianceOpen` to `RecordsMainView` and
  `complianceSheetOpen` + `closeCompliance` + `uid`
  to `AcademicRecordsSheets`. Mirrors the open/close
  pattern used for Course Catalog and other sheets.
- `AcademicRecordsSheets.jsx` — imports
  `ComplianceSheet` and renders `<ComplianceSheet
  open={p.complianceSheetOpen} onClose={p.closeCompliance}
  uid={p.uid} />` alongside the other sheets.
- Helper text + days/hours toggles + conditional
  number inputs all render inside the sheet body
  unchanged from Session 3.5. The Firestore
  subscription via `subscribeCompliance`, the
  500ms-debounced `saveCompliance`, and the planner
  hours input wiring are all untouched.
- Versions consistent at v0.31.4 across both
  workspace `package.json` files and both CLAUDE.md
  stamps (line 2 milestone suffix and the Tools
  status header). Milestone reads: "Sessions 1–3
  (settings + hours input + Records relocation +
  sheet pattern)".

## Notes
- Recovery context: this session was originally
  authored across two attempts. The first attempt
  hit a network timeout during the HANDOFF.md
  rewrite step after the three code commits had
  landed locally (`de2da41`, `b064496`, `b7fce0d`).
  This HANDOFF rewrite is the missing fourth step.
  No code changes were made in the recovery — only
  this file was authored, committed, and pushed
  alongside the three preexisting code commits.
- File-size finding to flag for a future session:
  `ComplianceSheet.css` (121 lines) and
  `CourseCatalogSheet.css` (261 lines) duplicate the
  sheet-skeleton chrome (overlay / panel / handle /
  header / close / body / slide-up animation / media
  queries). If a third Quick Actions sheet later
  needs the same skeleton, extracting a shared
  CSS partial would reduce drift. Not blocking, not
  needed today.

## Manual verification protocol for Rob (after Netlify deploy)
1. Open Records → confirm "Track Compliance" is
   still the FIRST Quick Actions row, visually
   identical to "Manage Course Catalog" and the
   other action rows.
2. Tap "Track Compliance" → sheet slides up from the
   bottom with the dark `#22252e` header bar, the
   "Track Compliance" title, and an X close button —
   matching Course Catalog's slide-up exactly.
3. Sheet body shows helper text at the top, then
   the days toggle + conditional number inputs, then
   the hours toggle + conditional number inputs.
4. Configure values inside the sheet — values save
   to Firestore (verify by closing and reopening the
   sheet; values persist).
5. Tap the X button → sheet dismisses cleanly.
6. Tap the dark backdrop outside the sheet → sheet
   dismisses (matches Course Catalog backdrop-tap
   behavior).
7. Reload the page with `daysEnabled` or
   `hoursEnabled` already true → sheet does NOT
   auto-open. Default state is closed; parent owns
   the open flag and starts at `false`.
8. Open Planner → hours input row still appears
   when `hoursEnabled` is on (data wiring unchanged
   from Session 2).

If anything else differs beyond "section behavior
changed from inline collapse to modal sheet," that's
a regression.

## What is broken or incomplete
(Verified each carried-forward item still describes
a real condition in current code per the
verify-before-carry-forward rule. Updated the
Session 4 bullet to reflect the new sheet placement.
Added one new finding from this session.)

- StudentDetailSheet header still renders a
  `{pts.points} pts` badge that always reads "0 pts"
  since HomeTab no longer passes a points prop. Last
  rewardTracker UI vestige — remove on next
  StudentDetailSheet touch.
- PDF helpers + `handleMoveCell` still live inside
  PlannerLayout.jsx via `usePlannerHelpers`.
  PlannerLayout is at 278/300 lines (22-line
  headroom). Must extract before adding any new
  code to PlannerLayout.
- Emoji maps are hardcoded for Orion/Malachi in 4
  files. Deferred — needs a per-student emoji
  setting.
- firebase/backup.js still reads/writes the
  rewardTracker collection so old backups continue
  to round-trip. Safe — trim when the backup format
  is next revisited.
- HomeTab still defines a no-op `handleAwardPoints`
  and passes it as `onAwardPoints` to
  StudentDetailSheet, which no longer reads it.
  Harmless — delete on the next HomeTab touch.
- "School Year — Coming Soon" placeholder row in
  SettingsTab is now even more redundant —
  Compliance has fully moved to Academic Records
  (now as a modal sheet), so the placeholder's
  "Track academic year + ND compliance" copy points
  at functionality that lives entirely elsewhere
  now. Remove on the next SettingsTab touch.
- Calendar import does not allow more than one of
  the same subject per day. If a student does extra
  work (e.g., three Reading 3 lessons in one day for
  accelerated remediation), the import flow rejects
  or silently dedupes the duplicate cells. Need to
  allow multiple cells with the same subject name on
  the same day. Likely fix lives in the PDF import
  or batch-add path — investigate
  `handleBatchAddSubject` in `usePlannerHelpers` and
  the `importCell` write logic (which probably uses
  subject name as the cell key). May require a
  key-shape change from `{subject}` to
  `{subject}-{instance}` or similar to allow
  duplicates without overwriting.
- Sick day cascade does not skip over existing
  all-day events. When sick day is confirmed for a
  day, the expected behavior is:
  1. Lessons on the sick day cascade forward by one
     position.
  2. A "Sick Day" all-day event is created on that
     day (this part is already working).
  3. The cascade must skip over any later day that
     already has an all-day event — those days stay
     clear of regular lessons because the all-day
     event blocks them.

  Concrete example: this week has Co-op as an
  all-day event on Wednesday. If a sick day fires
  on Monday, Monday's lessons should land on
  Tuesday, and Tuesday's lessons should jump past
  Wednesday and land on Thursday. Wednesday stays
  clear (Co-op preserved). Currently the cascade
  likely increments `dayIndex` by one without
  checking for existing all-day events on the
  destination day, so lessons can land on top of
  Co-op or other all-day events.

  Likely fix lives in `performSickDay` in
  `useSubjects.js` (planner). The cascade loop
  needs to check whether the destination day
  already has an `'allday'` cell before writing —
  if so, skip to the next day. End-of-week behavior
  (what happens if the cascade falls off Friday)
  should match whatever the current cascade does
  today, not be redesigned in this fix.
- Phase 3 Session 4 next — `ComplianceCard`
  component plus `useComplianceSummary` hook. The
  card mounts in TWO places: (1) on the Home tab as
  a summary glance, AND (2) inside the
  `ComplianceSheet` body, above the toggles, so
  users see live progress when they open the sheet
  to configure. Days metric: `startingDays + count
  of distinct dates with any done cell within
  active school year`. Hours metric: `startingHours
  + sum(hoursLogged across schoolDays in same
  range)`. Recommended query is Option α from the
  design diagnostic: live
  `collectionGroup('subjects').where('done','==',true)`
  + `subscribeSchoolDays` over the school-year
  range. New hook lives at
  `packages/dashboard/src/hooks/useComplianceSummary.js`;
  new component at
  `packages/dashboard/src/components/ComplianceCard.jsx`
  + `.css`.
- Phase 3 Session 5 — Replace Academic Records
  attendance calculation with Compliance data when
  enabled. Today `useAcademicSummary` derives
  attendance as `weekdays − breaks − sick days`
  (calendar math). When `daysEnabled` is true, the
  source of truth shifts to the Compliance count
  (distinct dates with done cells). When disabled,
  the calendar-math fallback stays.
- Phase 3 Session 6 (deferred) — Planned days view
  (X planned vs Y required), only built if Rob
  greenlights after Sessions 4–5.
- **Multi-family launch readiness — Phase 4
  prerequisite cluster.** Before any external
  testing family signs in, the following MUST land:
  1. Tighten Firestore rule R2 to uid-scope
     `collectionGroup('subjects')` reads (already
     documented from the security audit — current
     rule is auth-only, not uid-scoped).
  2. Add `uid` field to subject cell writes with a
     backfill migration so Option α dashboard
     queries don't read across families.
  3. Rewrite the (Session 4) compliance dashboard
     query to filter on `uid`.

  Without these, multi-family launch causes a data
  leak (one family can read another's lesson cells)
  AND quadratic read-cost scaling (each family pays
  for every other family's done cells on every
  dashboard load).

  Estimated effort: ~3 sessions of focused work.
  Treat as Phase 4 kickoff prerequisites, not future
  optimizations. Reason for urgency: Rob plans
  testing families in coming months, not 6+ months
  out.
- Sheet-skeleton CSS duplication —
  `ComplianceSheet.css` (121 lines) and
  `CourseCatalogSheet.css` (261 lines) duplicate the
  overlay / panel / handle / header / close /
  slide-up-animation chrome. No action needed today,
  but if a future session adds a third Quick Actions
  sheet that wants the same skeleton, consider
  extracting a shared CSS partial. Defer unless and
  until a third instance makes the duplication
  painful.
- Firebase data cleanup needed — 2026-04-26 backup
  audit identified stale and orphaned Firestore
  documents that should be deleted manually via the
  Firebase console (not via code, for safety):
  - Test cell "Billybob" subject in
    `users/{uid}/weeks/2026-04-06/students/Malachi/days/1/subjects/Billybob`
    (lesson text contains UI test prompts about
    edge cases).
  - Two future-dated test sick days for Orion at
    `users/{uid}/sickDays/2026-09-14` and
    `users/{uid}/sickDays/2026-09-17` (subjects
    don't match current presets, leftover from
    sick-day cascade testing).
  - Test reportNote for Orion Q1 at
    `users/{uid}/reportNotes/oWpzkNdCB1kvXGb8HMTk`
    (notes field reads "Test notes").
  - Orphaned grade at
    `users/{uid}/grades/I9oVfEbkdSAN8DXXROjc` —
    points to enrollment `5rq1SYtokiWaoUcGRTRT`
    which no longer exists (cascading-delete
    artifact, invisible in app UI).
  - Optional cosmetic: Summer Break entry inside
    the 2025-2026 schoolYear runs 2026-07-20 to
    2026-07-31 but the school year ends 2026-07-15.
    Either extend the school year end date or
    delete the Summer Break entry. Not breaking
    anything; nice-to-have.

  After cleanup, export a fresh backup and re-audit
  to confirm deletions and verify real data intact.

  Do NOT delete the rewardTracker stale balance/log
  mismatch — `firebase/backup.js` still round-trips
  this collection per CLAUDE.md; leave for the next
  backup-format revision.

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Verify on main, pull latest
3. Begin Session 4: `ComplianceCard` component +
   `useComplianceSummary` hook (Option α query for
   days-completed, reuse `subscribeSchoolDays` for
   hours-completed). Mount on Home as a summary
   glance and inside the `ComplianceSheet` body
   (above the toggles) as the detail view.

## Key files changed recently
- packages/dashboard/src/tools/academic-records/components/ComplianceSheet.jsx (renamed from ComplianceSection.jsx)
- packages/dashboard/src/tools/academic-records/components/ComplianceSheet.css (renamed from ComplianceSection.css)
- packages/dashboard/src/tools/academic-records/components/RecordsMainView.jsx
- packages/dashboard/src/tabs/AcademicRecordsTab.jsx
- packages/dashboard/src/tools/academic-records/components/AcademicRecordsSheets.jsx
- packages/dashboard/package.json
- packages/shared/package.json
- CLAUDE.md
