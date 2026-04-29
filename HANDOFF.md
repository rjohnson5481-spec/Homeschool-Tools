# HANDOFF — v0.33.5 Session B: Attendance detail sheet fix

## What was completed this session
- Fixed Attendance detail sheet inconsistency.
  When daysEnabled is true, "Days Attended" row
  now shows compliance days completed and label
  changes to "Days Completed". "Days Required"
  row now shows per-student compliance required
  value (Orion 180, Malachi 190) instead of
  calendar math hardcode.
- Calendar breakdown rows (Sick Days, Break Days,
  School Days) unchanged — still show calendar math
  as useful context.
- Falls back to calendar math when daysEnabled
  is false.

## What is broken or incomplete
Apply verify-before-carry-forward.
- PDF helpers + handleMoveCell still in PlannerLayout
  (must extract before adding new code)
- Emoji maps hardcoded for Orion/Malachi (deferred
  to Phase 4)
- firebase/backup.js rewardTracker round-trip
- Calendar import duplicate-subject bug
- Sick day cascade all-day-event bug
- Firebase data cleanup TODO from 2026-04-26
  backup audit

Phase 4 multi-family launch readiness — required
before any external testing family signs in.
See CLAUDE.md for prerequisite cluster.

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Verify on main, pull latest
3. Begin Session C: remove rewardTracker
   round-trip from firebase/backup.js

## Key files changed recently
- packages/dashboard/src/tools/academic-records/components/AttendanceDetailSheet.jsx
- packages/dashboard/src/tools/academic-records/components/AcademicRecordsSheets.jsx
- packages/dashboard/src/tabs/AcademicRecordsTab.jsx
- packages/dashboard/package.json
- packages/shared/package.json
- CLAUDE.md
