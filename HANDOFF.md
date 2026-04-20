# HANDOFF — v0.28.5 Cross-Device Undo Sick Day Button

## What was completed this session

3 code commits + this docs commit on `main`. The Undo Sick Day
button now appears on any device as long as a sick day marker
exists for the current student and current week in Firestore —
independent of which day the user is viewing and independent of
which device triggered the sick day. The sick-day handlers were
also extracted out of `PlannerLayout.jsx` (which was one line
under the 300-line hard cap) into a new `useSickDay` hook.

```
<docs>   docs: update HANDOFF v0.28.5
229b6c0  chore: bump version to v0.28.5
516bbcf  fix: undo sick day button driven by Firestore onSnapshot not local state
bf574b4  refactor: extract sick day handlers into useSickDay hook (v0.28.5)
```

### Commit 1 — Extract sick day handlers (`bf574b4`)
Files: `packages/dashboard/src/tools/planner/components/PlannerLayout.jsx`,
`packages/dashboard/src/tools/planner/hooks/useSickDay.js` (new)

Behavior-preserving split. `handleSickDayConfirm`,
`handleUndoSickDay`, and the "close sheets on week/student
switch" defensive `useEffect` all move into the new
`useSickDay` hook. `isSickDay` is computed inside the hook from
the existing `sickDayIndices` prop.

Result: `PlannerLayout.jsx` 299 → 270 lines. Still above the
v0.28.5 "comfortably under 250" target — the remaining cut
points from previous sessions (PDF import helpers, handleMoveCell)
were intentionally left for follow-up sessions to keep this
commit narrowly scoped and the file list at the documented two
files.

### Commit 2 — Firestore-driven Undo button (`516bbcf`)
Files: `packages/dashboard/src/tools/planner/components/PlannerLayout.jsx`,
`packages/dashboard/src/tools/planner/hooks/useSickDay.js`

**Bug** — When a sick day was triggered on mobile, the Undo
Sick Day button did not appear in the desktop action bar even
though the sick day marker existed in Firestore and the
lessons had been shifted correctly. The root cause was in
`PlannerLayout`: the action bar read `isSickDay =
sickDayIndices?.has(day)`, where `day` is the locally-viewed
day-of-week. Mobile set `day` to the sick column during
confirmation (via `setDay(sickDayIndex)`), so the action bar
flipped to Undo. Desktop, viewing a different day, got
`false` and kept showing Sick Day / Clear Week. The fix can't
paper over this by syncing `day` — the two devices hold
independent UI state.

**Fix** — `useSickDay` now owns an `onSnapshot` subscription
scoped to the current week's dates (keyed on `uid + weekId`)
and derives:

- `sickDayIndices` — `Set` of day indices (0–4) that are sick
  days for the current student this week. Used by `DayStrip`
  dot indicators (unchanged semantics) and by the per-day
  "Sick Day" banner (`isSickDay = sickDayIndices.has(day)`).
- `hasSickDayThisWeek` — `sickDayIndices.size > 0`. Drives the
  Undo Sick Day button in `PlannerActionBar`, replacing the
  per-day `isSickDay` check. Any sick day anywhere in the week
  now shows the Undo button, so mobile-triggered sick days
  surface on desktop and vice versa.

The `setDay(sickDayIndex)` jump at the end of
`handleSickDayConfirm` is kept for UX (shows the per-day banner
and shifted lessons immediately after confirmation) but is no
longer load-bearing for Undo visibility. The `sickDayIndices`
prop on `PlannerLayout` was removed since the value now comes
from the hook.

**Known duplicate subscription** — `useSubjects` still
subscribes to `/users/{uid}/sickDays` for its own
`sickDayIndices` derivation, which `PlannerTab` still passes
into `PlannerLayout` (where it is now ignored). Collapsing the
duplicate requires edits to `useSubjects.js` + `PlannerTab.jsx`
(outside this session's file scope). Firestore dedupes the
underlying network query, so this is wasteful but not
incorrect.

### Commit 3 — Version bump (`229b6c0`)
0.28.4 → **0.28.5** across `dashboard`, `shared`, `te-extractor`.

---

## What is currently broken or incomplete

Nothing from this session.

Carried over:
- `PlannerLayout.jsx` is at **270 lines** — down from 299, but
  still above the preferred "comfortably under 250" target.
  Remaining documented cut points:
  - PDF import helpers (`handleApplySchedule`,
    `handleConfirmImport`, lines 82–112, ~31 lines) → new
    `usePdfImport` additions.
  - `handleMoveCell` (lines 130–137, ~8 lines) → move into
    `useSubjects`.
- Duplicate `subscribeSickDays` subscription between
  `useSubjects` and `useSickDay` — collapse during the next
  touch of `useSubjects.js`. When doing so, drop
  `sickDayIndices` from `useSubjects` return and from
  `PlannerTab.jsx`'s `PlannerLayout` prop list.
- Carried over from v0.28.0/v0.28.3:
  - `generateRestoreDiff` compares weekly subject cells only —
    does not diff `schoolYears`, `courses`, `enrollments`,
    `grades`, `reportNotes`, `activities`, `savedReports`,
    `sickDays`, `subjectPresets`, `rewardTracker`, or
    `settings/students`.
  - `settings/students` is never deleted by
    `importFullRestore` if missing from the backup file.
  - Deferred polish from v0.28.0: loading spinner during
    `generateRestoreDiff`, success toast, confirmation before
    many-DELETE restores, user-facing error surface.

## What the next session should start with

1. Read `CLAUDE.md` + this `HANDOFF.md`.
2. Cross-device smoke test on the Undo Sick Day button:
   - Sign in on mobile, planner tab. Pick a Monday with
     subjects. Tap Sick Day, confirm.
   - Verify the action bar shows "↩ Undo Sick Day" immediately
     on mobile.
   - Open the same account on desktop (wide viewport). Without
     navigating to Monday first, verify the action bar shows
     "↩ Undo Sick Day" — independent of the currently-viewed
     day.
   - Navigate between days on desktop. The Undo button should
     remain visible as long as any day that week is marked sick
     for the current student.
   - Undo on desktop. Verify the button disappears on both
     devices within ~1 Firestore latency.
3. Verify the `DayStrip` red-dot indicators still render
   correctly (now fed by `useSickDay`'s `sickDayIndices`
   instead of the `useSubjects` one).
4. When ready to chip away at `PlannerLayout.jsx` line count,
   tackle the PDF import extraction and `handleMoveCell` move
   — both documented above. The `useSubjects` collapse of the
   duplicate `subscribeSickDays` should ride along with the
   `handleMoveCell` move since both touch `useSubjects.js`.

## Decisions made this session

- **Undo Sick Day visibility is a per-week signal, not
  per-day.** The action bar's `isSickDay` prop now receives
  `hasSickDayThisWeek` — a boolean over the whole week. This
  avoids coupling a critical control to the locally-viewed day,
  which can differ per device.
- **useSickDay owns a live subscription, not a prop passthrough.**
  The hook subscribes directly to `/users/{uid}/sickDays` for
  the current week rather than receiving `sickDayIndices` as a
  param. This keeps the hook self-contained and lets both the
  DayStrip dots and the action bar button share a single source
  of truth within `PlannerLayout`.
- **`setDay(sickDayIndex)` on confirm is kept for UX, not
  correctness.** After `performSickDay`, jumping to the sick
  column still surfaces the per-day banner and shifted lessons
  immediately — but it's no longer what makes the Undo button
  appear.
- **Duplicate sickDays subscription is acceptable for now.**
  Touching `useSubjects.js` or `PlannerTab.jsx` was out of scope
  for this fix. Firestore dedupes the underlying query; the
  waste is one extra listener object, not extra reads. Collapse
  on the next `useSubjects` edit.

## Key file locations

```
packages/dashboard/src/tools/planner/hooks/useSickDay.js           # NEW — subscription + handlers
packages/dashboard/src/tools/planner/components/PlannerLayout.jsx  # uses useSickDay, 270 lines
packages/dashboard/src/tools/planner/hooks/useSubjects.js          # still has duplicate sickDays subscription
packages/dashboard/src/tabs/PlannerTab.jsx                         # still passes sickDayIndices prop (now ignored)
packages/dashboard/package.json                                    # 0.28.5
packages/shared/package.json                                       # 0.28.5
packages/te-extractor/package.json                                 # 0.28.5
```
