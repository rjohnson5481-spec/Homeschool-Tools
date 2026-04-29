# HANDOFF — v0.33.7 Session C: rewardTracker backup cleanup

## What was completed this session
- Removed rewardTracker collection from
  backup export (exportAllData) — new exports
  no longer include rewardTracker data.
- Removed rewardTracker from import/restore
  functions — old backup files with rewardTracker
  data are skipped gracefully on import.
- grep verified: zero rewardTracker references
  remaining in source code files.

## What is broken or incomplete
Apply verify-before-carry-forward.
- PDF helpers + handleMoveCell still in PlannerLayout
  (must extract before adding new code)
- Emoji maps hardcoded for Orion/Malachi (deferred
  to Phase 4)
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
3. Begin Session D: extract PDF helpers and
   handleMoveCell from PlannerLayout.jsx into
   usePlannerHelpers.js. PlannerLayout is at
   ~278/300 lines — must split before adding
   any new code.

## Key files changed recently
- packages/dashboard/src/firebase/backup.js
- packages/dashboard/package.json
- packages/shared/package.json
- CLAUDE.md
