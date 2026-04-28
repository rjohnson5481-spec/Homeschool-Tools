# HANDOFF — v0.32.2 Phase 3 Session 4.2: Roll back family-wide dashboard

## What was completed this session
- Phase 3 Session 4.2: rollback of Session 4
  family-wide ComplianceCard dashboard.
- Deleted ComplianceCard.jsx + .css. Removed all
  consumer-side plumbing: HomeTab.jsx render,
  ComplianceSheet.jsx render, App.jsx
  pendingRecordsAction useState, AcademicRecordsTab
  listener useEffect.
- File sizes restored to pre-Session-4 baselines:
  HomeTab 122, App 61, AcademicRecordsTab 209,
  ComplianceSheet 135.
- Verification greps: ComplianceCard and
  pendingRecordsAction both return zero matches
  across packages/.
- Kept for Session 4.3 rework: useComplianceSummary
  hook (130 lines), firebase/compliance.js,
  constants/compliance.js. The migrated per-student
  Firestore data is untouched.
- Sessions 1-3.6 functionality unchanged: Settings
  stub, Records sheet pattern, planner hours input
  all still working.

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
- ComplianceSheet.css 121-line note (low-priority sheet skeleton extraction)
- Firestore subjects.done index auto-creation note
- Firebase data cleanup TODO from 2026-04-26 backup audit

Phase 3 mid-rework: Session 4 rolled back. Sessions
4.3 → 5 still pending. See CLAUDE.md for the rework
session plan.

Phase 4 multi-family launch readiness — still
required before any external testing family signs in.
See CLAUDE.md for prerequisite cluster.

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Verify on main, pull latest
3. Begin Session 4.3 (rework useComplianceSummary
   to return per-student maps) per CLAUDE.md rework
   plan

## Key files changed recently
- packages/dashboard/src/App.jsx
- packages/dashboard/src/tabs/HomeTab.jsx
- packages/dashboard/src/tabs/AcademicRecordsTab.jsx
- packages/dashboard/src/tools/academic-records/components/ComplianceSheet.jsx
- packages/dashboard/src/components/ComplianceCard.jsx (deleted)
- packages/dashboard/src/components/ComplianceCard.css (deleted)
- packages/dashboard/package.json
- packages/shared/package.json
- CLAUDE.md
