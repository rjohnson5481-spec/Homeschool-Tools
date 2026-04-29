# HANDOFF — v0.33.4 Session A: Dead code cleanup

## What was completed this session
- Removed {pts.points} pts badge from
  StudentDetailSheet header — last rewardTracker
  UI vestige.
- Removed handleAwardPoints no-op from HomeTab
  and onAwardPoints prop pass to StudentDetailSheet.
- Removed "School Year — Coming Soon" placeholder
  from SettingsTab.
- grep verified: zero remaining references to
  pts.points, handleAwardPoints, onAwardPoints,
  "Coming Soon" across packages/.

## What is broken or incomplete
Apply verify-before-carry-forward.
- PDF helpers + handleMoveCell still in PlannerLayout
  (278/300 lines — must extract before adding new
  code)
- Emoji maps hardcoded for Orion/Malachi (deferred
  to Phase 4)
- firebase/backup.js rewardTracker round-trip
- Calendar import duplicate-subject bug
- Sick day cascade all-day-event bug
- Firebase data cleanup TODO from 2026-04-26
  backup audit
- Attendance detail sheet still shows calendar math
  while Records front card shows compliance data

Phase 4 multi-family launch readiness — required
before any external testing family signs in.
See CLAUDE.md for prerequisite cluster.

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Verify on main, pull latest
3. Begin Session B: fix Attendance detail sheet
   inconsistency (detail sheet shows calendar math,
   front card shows compliance data)

## Key files changed recently
- packages/dashboard/src/tools/academic-records/components/StudentDetailSheet.jsx
- packages/dashboard/src/tabs/HomeTab.jsx
- packages/dashboard/src/tabs/SettingsTab.jsx
- packages/dashboard/package.json
- packages/shared/package.json
- CLAUDE.md
