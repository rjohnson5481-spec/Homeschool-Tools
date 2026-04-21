# HANDOFF — v0.28.8 Internal cleanup (no behavior changes)

## What was completed this session
- Extracted usePlannerHelpers hook — PDF helpers +
  handleMoveCell moved out of PlannerLayout; file now 246
  lines, comfortably under the 250 target
- Collapsed duplicate sick-day listener — subscribeSickDays
  + sickDayIndices derivation removed from useSubjects;
  useSickDay is now the sole owner of that Firestore
  subscription
- Moved CalendarWeekView done-toggle Firestore call into
  PlannerLayout — CalendarWeekView calls an onToggleDone
  prop; no Firebase imports remain in that component
- Version bump to v0.28.8

## What is broken or incomplete
- Netlify Blobs auto-backup fix (v0.28.6) is deployed but
  unverified — confirm a backup appears in the Blobs store
  after the next scheduled run (or invoke the function
  manually)
- PlannerTab.jsx still destructures sickDayIndices from
  useSubjects (now undefined) and passes a dead
  sickDayIndices prop to PlannerLayout. Harmless — clean up
  on the next PlannerTab touch.

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Confirm on main, pull latest
3. Ask Rob what we are building today

## Key files changed recently
- packages/dashboard/src/tools/planner/hooks/usePlannerHelpers.js (new)
- packages/dashboard/src/tools/planner/hooks/useSubjects.js
- packages/dashboard/src/tools/planner/components/PlannerLayout.jsx
- packages/dashboard/src/tools/planner/components/CalendarWeekView.jsx
- packages/dashboard/package.json
- packages/shared/package.json
- packages/te-extractor/package.json
- CLAUDE.md
