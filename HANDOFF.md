# HANDOFF — v0.33.0 Phase 3 Session 5: Integration sweep complete

## What was completed this session
- Phase 3 Session 5: integration sweep complete.
  Phase 3 is DONE.
- Records Attendance card now sources from
  daysCompletedByStudent[selectedStudent] and
  requiredByStudent[selectedStudent].requiredDays
  when daysEnabled is true. Falls back to calendar
  math when off.
- Home per-student cards now source days progress
  from daysCompletedByStudent[student] and
  requiredByStudent[student].requiredDays when
  daysEnabled is true. Both the stat-grid "Days"
  number and the progress row "X of Y days · Z%"
  switch source. Falls back to calendar math when off.
- useComplianceSummary now has two consumers:
  AcademicRecordsTab and HomeTab. Called
  independently in each (Firestore deduplicates
  server-side).
- Visual UI unchanged on both surfaces — same
  cards, same progress bars, same layout.
- Per-student values: Orion shows his required
  count, Malachi shows his. Switching students on
  Records updates the card.
- Calendar-math fallback preserved when daysEnabled
  is false (existing useAcademicSummary +
  useHomeSummary paths intact).

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
- Firestore subjects.done index auto-creation —
  first run of compliance dashboard may need one-
  time index creation via browser console link
- StudentDetailSheet (drilldown from Home cards)
  still receives calendar-math attendance — minor
  inconsistency vs the Home card that opened it.
  Out of scope for Session 5; flag for follow-up.
- Firebase data cleanup TODO from 2026-04-26 backup
  audit (subjectLists, teExtractor, rewardTracker
  collections also visible in console — stale,
  manual cleanup only)

Phase 3 complete. Phase 4 multi-family launch
readiness is next — required before any external
testing family signs in. See CLAUDE.md for the
prerequisite cluster (R2 rule tightening, uid field
on cells, query rewrite).

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Verify on main, pull latest
3. Discuss Phase 4 kickoff — multi-family launch
   readiness prerequisites (R2 rule, uid field on
   cells, query rewrite) before any testing family
   signs in

## Key files changed recently
- packages/dashboard/src/tabs/AcademicRecordsTab.jsx
- packages/dashboard/src/tools/academic-records/components/RecordsMainView.jsx
- packages/dashboard/src/tabs/HomeTab.jsx
- packages/dashboard/package.json
- packages/shared/package.json
- CLAUDE.md
