# HANDOFF — v0.33.6 Session B complete: attendance label fix

## What was completed this session
- Records Attendance card section label now reads
  "DAYS COMPLETED" when daysEnabled is true,
  "ATTENDANCE" when false.
- One-line change in RecordsMainView.jsx.
- Session B (Attendance detail sheet fix) is now
  fully complete.

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
- packages/dashboard/src/tools/academic-records/components/RecordsMainView.jsx
- packages/dashboard/package.json
- packages/shared/package.json
- CLAUDE.md
