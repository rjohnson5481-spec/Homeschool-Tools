# HANDOFF — v0.31.1 Phase 3 Session 2: Compliance hours input UI

## What was completed this session
- Phase 3 School Days Compliance Session 2 of 4. Hours
  input UI now appears in the planner whenever
  `compliance.hoursEnabled` is true (toggle in
  Settings → Compliance, shipped in Session 1).
- New hook
  `packages/dashboard/src/tools/planner/hooks/useCompliance.js`
  (60 lines). Subscribes to compliance settings + the
  current week's `users/{uid}/schoolDays` range and
  exposes `{ daysEnabled, hoursEnabled, hoursByDate,
  saveHours, flushPendingSave }`. `saveHours` debounces
  500ms per dateString; `flushPendingSave` drains all
  pending writes immediately (called on day-change,
  blur, and unmount). Empty/null inputs are skipped so
  cleared fields never overwrite valid values.
- New component
  `packages/dashboard/src/tools/planner/components/HoursInputRow.jsx`
  + `.css` (55 + 41 lines). Mobile-only "Hours today:
  [number input]" row that sits between the DayStrip
  and the subject list (after any sick-day banner).
  Hidden on desktop via `.cwv-active .hours-row {
  display: none; }`. Local controlled input with
  focus-guarded external sync — external Firestore
  updates only mirror into the input when it is not
  focused, so they never clobber an in-progress edit.
- New inline sub-component `CalendarHoursInput` inside
  `CalendarWeekView.jsx`. Renders the per-column "Hrs:
  [input]" footer at the bottom of each desktop
  calendar column when `hoursEnabled` is true. Uses
  the same focus-guarded sync as HoursInputRow.
- `PlannerLayout.jsx`: 261 → 278 lines. Adds the
  `useCompliance` call alongside other planner hooks,
  renders `<HoursInputRow>` after the sick banner, and
  threads `hoursEnabled / hoursByDate / onSaveHours /
  onFlushHours` into `<CalendarWeekView>`. Just under
  the 280 watch line — close enough that the next
  PlannerLayout touch should extract before adding new
  code.
- `CalendarWeekView.jsx`: 206 → 242 lines. New props
  destructured, sub-component declared at module
  scope, footer block rendered after `.cwv-col-add`.
  CSS adds `.cwv-col-hours`, `.cwv-col-hours-label`,
  `.cwv-col-hours-input`, and tweaks `.cwv-col-add`
  (removed `margin-top: auto`, added `margin-bottom:
  4px`) so the hours block becomes the new column
  foot.
- Both surfaces write `hoursLogged` per date to
  `users/{uid}/schoolDays/{dateString}` via
  `saveSchoolDayHours` (Session 1 helper, unchanged).
- Version bumped to v0.31.1 (patch, within Phase 3).
  Both workspace package.json files updated; CLAUDE.md
  line 2 milestone suffix updated to "Sessions 1–2
  (settings + hours input UI)" and Tools status header
  bumped to (v0.31.1).

## Notes
- Decision: substituted `--bg-card` for the prompt's
  `--bg-input` and `--text-primary` for `--text` —
  neither prompt-named token exists in
  `packages/shared/src/styles/tokens.css`. The
  substitutes match the existing `.sc-input` /
  `.st-input` / `.cwv-card` styles.
- Decision: used `font-family: inherit` rather than
  re-declaring `'Lexend', sans-serif` on inputs —
  matches the existing convention across SettingsTab
  and SettingsCompliance inputs.
- Decision: implemented focus-guarded external sync
  (a `focusedRef` ref-based blocker) for both inputs.
  External Firestore updates from another tab will not
  overwrite the user's in-progress typing; they apply
  on next blur or day-change.
- The CSS change to `.cwv-col-add` (removed
  `margin-top: auto`) means that when `hoursEnabled`
  is false, the dashed `+ add` button now sits
  immediately below the cells rather than being pinned
  to the column foot. This is a small visual change
  but, given how few empty columns exist in normal
  use, was an acceptable tradeoff to avoid a more
  complex CSS rule. Flagged for review if it looks
  off.

## What is broken or incomplete
(Verified each carried-forward item still describes a
real condition in current code per the
verify-before-carry-forward rule. Dropped one bullet:
"Phase 3 Session 2 next" — Session 2 was today.)

- StudentDetailSheet header still renders a
  `{pts.points} pts` badge that always reads "0 pts"
  since HomeTab no longer passes a points prop. Last
  rewardTracker UI vestige — remove on next
  StudentDetailSheet touch.
- PDF helpers + `handleMoveCell` still live inside
  PlannerLayout.jsx via `usePlannerHelpers`.
  PlannerLayout is now at 278/300 lines (22-line
  headroom). Must extract before adding any new code
  to PlannerLayout — Session 3's dashboard work will
  most likely live in HomeTab and SettingsTab, not
  PlannerLayout, but flag remains.
- Emoji maps are hardcoded for Orion/Malachi in 4
  files. Deferred — needs a per-student emoji setting.
- firebase/backup.js still reads/writes the
  rewardTracker collection so old backups continue to
  round-trip. Safe — trim when the backup format is
  next revisited.
- HomeTab still defines a no-op `handleAwardPoints`
  and passes it as `onAwardPoints` to
  StudentDetailSheet, which no longer reads it.
  Harmless — delete on the next HomeTab touch.
- "School Year — Coming Soon" placeholder row in
  SettingsTab is now redundant with the Compliance
  section. Remove on the next SettingsTab touch.
- Calendar import does not allow more than one of the
  same subject per day. If a student does extra work
  (e.g., three Reading 3 lessons in one day for
  accelerated remediation), the import flow rejects or
  silently dedupes the duplicate cells. Need to allow
  multiple cells with the same subject name on the
  same day. Likely fix lives in the PDF import or
  batch-add path — investigate `handleBatchAddSubject`
  in `usePlannerHelpers` and the `importCell` write
  logic (which probably uses subject name as the cell
  key). May require a key-shape change from
  `{subject}` to `{subject}-{instance}` or similar to
  allow duplicates without overwriting.
- Sick day cascade does not skip over existing all-day
  events. When sick day is confirmed for a day, the
  expected behavior is:
  1. Lessons on the sick day cascade forward by one
     position.
  2. A "Sick Day" all-day event is created on that day
     (this part is already working).
  3. The cascade must skip over any later day that
     already has an all-day event — those days stay
     clear of regular lessons because the all-day event
     blocks them.

  Concrete example: this week has Co-op as an all-day
  event on Wednesday. If a sick day fires on Monday,
  Monday's lessons should land on Tuesday, and
  Tuesday's lessons should jump past Wednesday and
  land on Thursday. Wednesday stays clear (Co-op
  preserved). Currently the cascade likely increments
  `dayIndex` by one without checking for existing
  all-day events on the destination day, so lessons
  can land on top of Co-op or other all-day events.

  Likely fix lives in `performSickDay` in
  `useSubjects.js` (planner). The cascade loop needs
  to check whether the destination day already has an
  `'allday'` cell before writing — if so, skip to the
  next day. End-of-week behavior (what happens if the
  cascade falls off Friday) should match whatever the
  current cascade does today, not be redesigned in
  this fix.
- Phase 3 Session 3 next — compliance dashboard on
  the Home tab and Settings. Reads
  `subscribeSchoolDays` over the active school year
  range + `subscribeCompliance`, computes
  `startingDays + distinctDoneDates` and
  `startingHours + sum(hoursLogged)`, displays
  progress against `requiredDays` / `requiredHours`.
- Phase 3 Session 4 — replace academic records
  attendance calculation with compliance data when
  enabled (so the source of truth shifts from
  weekdays-minus-breaks-minus-sick to the live
  compliance counts).
- Phase 3 Session 5 (deferred) — planned days view
  (X planned vs Y required), only built if Rob
  greenlights after Sessions 2-4.
- Firebase data cleanup needed — 2026-04-26 backup
  audit identified stale and orphaned Firestore
  documents that should be deleted manually via the
  Firebase console (not via code, for safety):
  - Test cell "Billybob" subject in
    `users/{uid}/weeks/2026-04-06/students/Malachi/days/1/subjects/Billybob`
    (lesson text contains UI test prompts about edge
    cases).
  - Two future-dated test sick days for Orion at
    `users/{uid}/sickDays/2026-09-14` and
    `users/{uid}/sickDays/2026-09-17` (subjects don't
    match current presets, leftover from sick-day
    cascade testing).
  - Test reportNote for Orion Q1 at
    `users/{uid}/reportNotes/oWpzkNdCB1kvXGb8HMTk`
    (notes field reads "Test notes").
  - Orphaned grade at
    `users/{uid}/grades/I9oVfEbkdSAN8DXXROjc` — points
    to enrollment `5rq1SYtokiWaoUcGRTRT` which no
    longer exists (cascading-delete artifact,
    invisible in app UI).
  - Optional cosmetic: Summer Break entry inside the
    2025-2026 schoolYear runs 2026-07-20 to
    2026-07-31 but the school year ends 2026-07-15.
    Either extend the school year end date or delete
    the Summer Break entry. Not breaking anything;
    nice-to-have.

  After cleanup, export a fresh backup and re-audit to
  confirm deletions and verify real data intact.

  Do NOT delete the rewardTracker stale balance/log
  mismatch — `firebase/backup.js` still round-trips
  this collection per CLAUDE.md; leave for the next
  backup-format revision.

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Verify on main, pull latest
3. Begin Session 3: ComplianceCard component on Home
   tab and Settings, computing days completed and
   hours completed against requirements

## Key files changed recently
- packages/dashboard/src/tools/planner/hooks/useCompliance.js (new)
- packages/dashboard/src/tools/planner/components/HoursInputRow.jsx (new)
- packages/dashboard/src/tools/planner/components/HoursInputRow.css (new)
- packages/dashboard/src/tools/planner/components/PlannerLayout.jsx
- packages/dashboard/src/tools/planner/components/CalendarWeekView.jsx
- packages/dashboard/src/tools/planner/components/CalendarWeekView.css
- packages/dashboard/package.json
- packages/shared/package.json
- CLAUDE.md
