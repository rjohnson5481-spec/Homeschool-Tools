# HANDOFF — v0.33.3 Fix: desktop hours footer clearance

## What was completed this session
- Fixed desktop hours footer bar being hidden
  behind the fixed action bar (Sick Day / Clear
  Week / Import). Added padding-bottom to the
  planner content area on desktop so the footer
  clears the action bar.
- CSS-only fix, one rule added inside
  @media (min-width: 810px).
- Desktop CalendarWeekView hours input is now
  fully accessible: footer bar always visible,
  scrollable when needed, no per-column scrollbars.

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
- Firebase data cleanup TODO from 2026-04-26
  backup audit
- Attendance detail sheet still shows calendar math
  while Records front card shows compliance data —
  minor inconsistency, deferred

Phase 4 multi-family launch readiness — required
before any external testing family signs in.
See CLAUDE.md for prerequisite cluster.

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Verify on main, pull latest
3. Decide: fix Attendance detail sheet, OR begin
   Phase 4 kickoff, OR migrate to new chat

## Key files changed recently
- packages/dashboard/src/tools/planner/components/CalendarWeekView.css
  (or PlannerLayout.css — whichever was edited)
- packages/dashboard/src/tools/planner/components/CalendarWeekView.jsx
- packages/dashboard/package.json
- packages/shared/package.json
- CLAUDE.md
