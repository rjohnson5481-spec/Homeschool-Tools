# HANDOFF — v0.28.4 Mobile Sick Day Sheet Regression

## What was completed this session

2 code commits + this docs commit on `main`. One-fix session —
mobile sick day sheet was rendering the desktop day pill row and
the cascade-preview list, showing subjects from multiple days
instead of just the selected day. Restored to pre-v0.27.6 mobile
behavior.

```
<docs>   docs: update HANDOFF v0.28.4
9504779  chore: bump version to v0.28.4
33de4f9  fix: mobile sick day sheet restored to single day display (v0.28.4)
```

### Commit 1 — Mobile sick day sheet single-day fix (`33de4f9`)
File: `packages/dashboard/src/tools/planner/components/SickDaySheet.jsx`

**Bug** — v0.27.6 added a desktop `activeDay` state, a day-pill
row, and a multi-day cascade preview to the sick day sheet. The
`isDesktop` gating was incomplete:

- `sick-day-pills` rendered unconditionally — mobile saw the
  desktop day selector it was never supposed to have.
- `displayDays` on mobile was hardcoded to render `{day}` PLUS
  every following day in the week. Opening the sheet for Monday
  listed Monday, Tuesday, Wednesday, Thursday, Friday subjects
  all stacked together. Friday was the only mobile day that
  rendered a single column.
- `loadWeekDataFrom(0)` was also running on mobile to populate
  the now-removed cascade preview, adding Firestore reads that
  mobile no longer needs.

**Fix** — three gates restore the mobile path:

1. `sick-day-pills` wrapped in `{isDesktop && (...)}` so the day
   pill row only appears at ≥1024px.
2. `displayDays` on mobile collapses to a single entry:
   `[{ dayIndex: day, dayData }]`. No cascade preview, no other
   days visible. The cascade itself still runs in
   `performSickDay` — it was never part of the sheet render.
3. The `loadWeekDataFrom` effect bails early on mobile; `loading`
   starts `false` since the `subjects` + `dayData` props already
   contain everything the mobile sheet needs.

**Desktop unchanged.** Day pills still render, `pickDay`
continues to swap which day the list shows, `allDaysData` is
still populated by the initial fetch so switching pills doesn't
re-query. The `onConfirm(selected, activeDay)` contract is
intact — on mobile `activeDay` always equals `day` because pills
are hidden, matching pre-v0.27.6 mobile's implicit `day === day`
behavior.

The Friday warning banner (`sick-day-friday-warning`) still
shows on mobile when `day < 4 && selected.size > 0`, reminding
the user that any Friday lessons hit by the cascade will be
dropped.

### Commit 2 — Version bump (`9504779`)
0.28.3 → **0.28.4** across dashboard, shared, te-extractor. Patch
bump — single bug fix, no feature or API changes.

---

## What is currently broken or incomplete

Nothing from this session.

Carried over:
- `generateRestoreDiff` compares weekly subject cells only — does
  not diff `schoolYears`, `courses`, `enrollments`, `grades`,
  `reportNotes`, `activities`, `savedReports`, `sickDays`,
  `subjectPresets`, `rewardTracker`, or `settings/students`.
- `settings/students` is never deleted by `importFullRestore` if
  missing from the backup file.
- Deferred polish from v0.28.0: loading spinner during
  `generateRestoreDiff`, success toast, confirmation before
  many-DELETE restores, user-facing error surface.
- `PlannerLayout.jsx` remains at 299 lines (unchanged this
  session). Next touch of that file requires a split — see the
  v0.28.3 handoff entry for candidate cut points.

## What the next session should start with

1. Read `CLAUDE.md` + this `HANDOFF.md`.
2. Smoke test at <1024px:
   - Sign in, planner tab, pick Monday via the DayStrip (a day
     with subjects).
   - Tap Sick Day → sheet opens.
   - Verify: no day-pill row, only Monday subjects listed, "sick
     day" tag on the single group header, Friday warning shows
     if any subject is checked and today is not Friday.
   - Confirm → action bar swaps to Undo Sick Day, lessons shifted
     in the DayStrip.
3. Smoke test on Friday: open Sick Day → sheet should show just
   Friday's subjects, no Friday warning (since there's nothing
   past Friday).
4. Smoke test at ≥1024px: pills should still render, picking a
   different pill should swap the displayed subject list without
   a loading spinner (allDaysData was pre-fetched).

## Decisions made this session

- **`isDesktop` in SickDaySheet must gate every desktop-only
  surface.** Day pills, cascade preview, and week-wide fetch
  all belong inside `isDesktop` branches. Mobile should be a
  single-day, no-fetch, no-pills sheet.
- The cascade preview (showing what will happen across the week
  before confirmation) is explicitly a desktop-only feature. If
  mobile ever needs a preview, it must be designed separately,
  not reusing the desktop render.

## Key file locations

```
packages/dashboard/src/tools/planner/components/SickDaySheet.jsx  # mobile branch: single day, no pills, no fetch
packages/dashboard/package.json                                    # 0.28.4
packages/shared/package.json                                       # 0.28.4
packages/te-extractor/package.json                                 # 0.28.4
```
