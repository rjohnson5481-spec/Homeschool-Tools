# HANDOFF — v0.32.3 Phase 3 Session 4.3: Per-student useComplianceSummary

## What was completed this session
- Phase 3 Session 4.3: useComplianceSummary
  reworked to return per-student maps
  (daysCompletedByStudent, hoursCompletedByStudent,
  requiredByStudent) instead of family-wide
  numbers.
- Active school year picker, Option α
  collectionGroup query, and subscribeSchoolDays
  subscription all preserved. Only the bucketing
  changed.
- Hook reads only the new requiredByStudent shape
  (no fallback to deprecated top-level fields).
- Hook still has zero consumers — wiring happens
  in Sessions 4.4, 4.5, and 5.

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
- ComplianceSheet.css 121-line note
- Firestore subjects.done index auto-creation note
- Firebase data cleanup TODO from 2026-04-26 backup audit

Phase 3 mid-rework: hook done. Sessions 4.4–5 still
pending. See CLAUDE.md for the rework session plan.

Phase 4 multi-family launch readiness — still
required before any external testing family signs in.
See CLAUDE.md for prerequisite cluster.

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Verify on main, pull latest
3. Begin Session 4.4 (rework ComplianceSheet UI for
   per-student configuration; delete old top-level
   requiredDays/requiredHours from Firestore — the
   contract phase of expand-then-contract)

## Key files changed recently
- packages/dashboard/src/hooks/useComplianceSummary.js
- packages/dashboard/package.json
- packages/shared/package.json
- CLAUDE.md
