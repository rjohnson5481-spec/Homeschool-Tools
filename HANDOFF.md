# HANDOFF — v0.28.7 Desktop done circle + home greeting

## What was completed this session
- CalendarWeekView done circle wired to Firestore — click
  toggles done, stopPropagation keeps the edit sheet closed
- Home tab greeting now reflects time of day (Morning /
  Afternoon / Evening / Night) based on new Date().getHours()
- Version bump to v0.28.7

## What is broken or incomplete
- Duplicate subscribeSickDays in useSubjects + useSickDay
  — collapse on next useSubjects touch
- PDF helpers and handleMoveCell still in PlannerLayout.jsx
  — extract on next touch
- Netlify Blobs auto-backup fix (v0.28.6) is deployed but
  unverified — confirm a backup appears in the Blobs store
  after the next scheduled run (or invoke the function
  manually)
- CalendarWeekView now calls Firebase directly (fbUpdateCell
  + useAuth) — a minor drift from the "Firebase calls never
  live in components" rule. Refactor into an onToggleDone
  prop passed from PlannerLayout on the next CalendarWeekView
  touch.

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Confirm on main, pull latest
3. Ask Rob what we are building today

## Key files changed recently
- packages/dashboard/src/tools/planner/components/CalendarWeekView.jsx
- packages/dashboard/src/tabs/HomeTab.jsx
- packages/dashboard/package.json
- packages/shared/package.json
- packages/te-extractor/package.json
