# HANDOFF — v0.33.8 Session D: PlannerLayout split

## What was completed this session
- Extracted EditSheet, UploadSheet, AddSubjectSheet,
  MonthSheet renders from PlannerLayout.jsx into
  new PlannerSheets.jsx component matching the
  AcademicRecordsSheets pattern.
- PlannerLayout.jsx: 278 → 258 lines (saved 20 lines;
  still 8 over 250 soft limit but under 300 hard
  limit — remaining excess is structural JSX
  verbosity in SickDayManager/CalendarWeekView/
  MultiSelectBar prop spreads, not extractable
  logic).
- PlannerSheets.jsx: new file, 33 lines.
- Note: the prior HANDOFF bullet "PDF helpers +
  handleMoveCell still in PlannerLayout" was stale
  — usePlannerHelpers.js already contained those
  functions since v0.30.2. Dropped from list.

## What is broken or incomplete
Apply verify-before-carry-forward.
- Emoji maps hardcoded for Orion/Malachi (deferred
  to Phase 4)
- Calendar import duplicate-subject bug
- Sick day cascade all-day-event bug
- Firebase data cleanup TODO from 2026-04-26
  backup audit
- CalendarWeekView.jsx at 252 lines — just over
  soft limit, worth watching

Phase 4 multi-family launch readiness — required
before any external testing family signs in.
See CLAUDE.md for prerequisite cluster.

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Verify on main, pull latest
3. Begin Session E: investigate and fix calendar
   import duplicate-subject bug
   (handleBatchAddSubject in PlannerLayout and
   the importCell write logic)

## Key files changed recently
- packages/dashboard/src/tools/planner/components/PlannerSheets.jsx (new)
- packages/dashboard/src/tools/planner/components/PlannerLayout.jsx
- packages/dashboard/package.json
- packages/shared/package.json
- CLAUDE.md
