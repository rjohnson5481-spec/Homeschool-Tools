# HANDOFF — v0.32.1 Phase 3 Session 4.1: Per-student compliance migration

## What was completed this session
- Phase 3 Session 4.1: data model migration from
  family-wide compliance to per-student shape.
- One-time migration script created, run against
  live Firestore from Rob's local Windows
  environment, then deleted from the repo.
- settings/compliance doc: ADDED requiredByStudent
  map seeded from old top-level requiredDays /
  requiredHours. Old top-level fields PRESERVED so
  deployed v0.32.0 code keeps working.
- schoolDays/{date} docs: REPLACED with
  { hoursByStudent: {} }. Old hoursLogged values
  discarded.
- Verified in Firebase Console and via app smoke
  test — all four tabs functional, data intact.

## What is broken or incomplete
Apply verify-before-carry-forward to all bullets.
- StudentDetailSheet header pts.points badge
- PDF helpers + handleMoveCell still in PlannerLayout
- Emoji maps hardcoded for Orion/Malachi
- firebase/backup.js rewardTracker round-trip
- HomeTab handleAwardPoints no-op
- "School Year — Coming Soon" placeholder in SettingsTab
- Calendar import duplicate-subject bug
- Sick day cascade all-day-event bug
- ComplianceSheet.css 121-line note
- Firestore subjects.done index auto-creation note
- Firebase data cleanup TODO from 2026-04-26 backup audit

Phase 3 mid-rework: Session 4 dashboard was built
family-wide and is known-wrong. Compliance must be
per-student. Data migration done; app code rework
next. See CLAUDE.md for the rework session plan.

Phase 4 multi-family launch readiness — still
required before any external testing family signs in.
See CLAUDE.md for prerequisite cluster.

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Verify on main, pull latest
3. Begin Session 4.2 (rollback wrong parts of Session 4)
   per CLAUDE.md rework plan

## Key files changed recently
- packages/dashboard/package.json
- packages/shared/package.json
- CLAUDE.md
- scripts/ (created, used, deleted within Session 4.1)
