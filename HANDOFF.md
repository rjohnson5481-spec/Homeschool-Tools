# HANDOFF — v0.32.4 Phase 3 Session 4.4: Per-student ComplianceSheet + lazy contract migration

## What was completed this session
- Phase 3 Session 4.4: ComplianceSheet form reworked
  to per-student inputs (Option α layout — single
  group label + per-student sub-rows for required
  days/hours).
- Starting days/hours stay family-wide single inputs.
- Save logic moved to granular nested-field-path
  writes ('requiredByStudent.{name}.requiredDays')
  via updateDoc partial-update payloads.
- saveCompliance helper became a thin updateDoc
  wrapper accepting partial objects (supports
  deleteField sentinels for nested-path deletions).
- Lazy contract migration: every save includes
  deleteField() for the deprecated top-level
  requiredDays / requiredHours. Idempotent — no-op
  once gone.
- Empty-state copy when settings/students.names is
  empty.
- File sizes: ComplianceSheet.jsx 135 → 189 (under
  200 target), .css 121 → 144 (under 150 target).
- CLAUDE.md compliance data model note updated to
  reflect lazy contract migration.
- Verified end-to-end in Firebase Console: deprecated
  top-level fields removed on first save; per-student
  writes target correct paths.

Also captured in this snapshot — Session 4.3 (v0.32.3,
shipped just before this session): useComplianceSummary
returns per-student maps (daysCompletedByStudent,
hoursCompletedByStudent, requiredByStudent). Hook
still has zero consumers until Sessions 4.5 and 5.

## What is broken or incomplete
Apply verify-before-carry-forward.
- StudentDetailSheet header pts.points badge
- PDF helpers + handleMoveCell still in PlannerLayout
- Emoji maps hardcoded for Orion/Malachi
- firebase/backup.js rewardTracker round-trip
- HomeTab handleAwardPoints no-op
- "School Year — Coming Soon" placeholder in SettingsTab
- Calendar import duplicate-subject bug
- Sick day cascade all-day-event bug
- Firestore subjects.done index auto-creation note
- Firebase data cleanup TODO from 2026-04-26 backup audit

Phase 3 mid-rework: hook + sheet UI done. Sessions
4.5 and 5 still pending. See CLAUDE.md for the
rework session plan.

Phase 4 multi-family launch readiness — still
required before any external testing family signs in.
See CLAUDE.md for prerequisite cluster.

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Verify on main, pull latest
3. Begin Session 4.5 (rework planner hours input to
   write per-student data via
   schoolDays/{date}.hoursByStudent[student] for the
   currently-selected student) per CLAUDE.md rework
   plan

## Key files changed recently
- packages/dashboard/src/firebase/compliance.js
- packages/dashboard/src/tools/academic-records/components/ComplianceSheet.jsx
- packages/dashboard/src/tools/academic-records/components/ComplianceSheet.css
- packages/dashboard/src/hooks/useComplianceSummary.js (Session 4.3)
- packages/dashboard/package.json
- packages/shared/package.json
- CLAUDE.md
