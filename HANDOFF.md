# HANDOFF — v0.33.1 Bug fix: desktop calendar scroll

## What was completed this session
- Fixed desktop CalendarWeekView layout: HRS footer
  inputs now always visible at bottom of each column
  regardless of lesson count.
- `.cwv-grid` gained a viewport-anchored height
  (`calc(100vh - 150px)` with `min-height: 360px`
  floor) plus `grid-template-rows: 1fr` so the
  single grid row fills the column space instead
  of growing with content.
- `.cwv-col-body` now scrolls independently via
  `flex: 1 1 0; min-height: 0; overflow-y: auto`.
  The DroppableCol drop zone is now cards-only
  (semantically correct — drag-drop targets the
  cards area, not the footer).
- New JSX wrapper `<div className="cwv-col-foot">`
  holds the dashed `+ add` button and the optional
  HRS row, sitting as a sibling of DroppableCol
  inside `.cwv-col`. Pinned via `flex-shrink: 0`.
- Removed the now-redundant `margin-top: auto` on
  `.cwv-col-hours` and `margin-bottom: 4px` on
  `.cwv-col-add` — the foot wrapper handles spacing
  via `gap: 4px`.
- One small JSX wrapper added; otherwise CSS-only.
  Desktop component (no mobile leakage — component
  doesn't mount at <810px).

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
- Firestore subjects.done index — created manually
  on 2026-04-28; now enabled. No longer blocking.
- Firebase data cleanup TODO from 2026-04-26 backup
  audit
- Attendance detail sheet still shows calendar math
  (158/175) while Records front card shows compliance
  data — minor inconsistency, deferred

Phase 4 multi-family launch readiness — required
before any external testing family signs in.
See CLAUDE.md for prerequisite cluster.

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Verify on main, pull latest
3. Discuss: fix Attendance detail sheet
   inconsistency, OR begin Phase 4 kickoff

## Key files changed recently
- packages/dashboard/src/tools/planner/components/CalendarWeekView.jsx
- packages/dashboard/src/tools/planner/components/CalendarWeekView.css
- packages/dashboard/package.json
- packages/shared/package.json
- CLAUDE.md
