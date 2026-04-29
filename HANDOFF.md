# HANDOFF — v0.34.0 Session F: sick day cascade fix + cleanup complete

## What was completed this session
- Fixed sick day cascade: lessons now skip days that have all-day events
  (Co-Op, etc.) instead of landing on top of them.
- Upfront pre-read of all 5 allday slots per week (constant 5 reads
  regardless of subject count).
- Both chain-build AND chain-write loops updated to treat blocked days
  as transparent.
- findNextOpenDay helper skips blocked days and returns null at
  end-of-week (lesson dropped, matching existing past-Friday behavior).
- FridayComingSoonSheet flow in useSickDay.js untouched — independent
  and correct.
- Cleanup cluster Sessions A-F complete. App is in clean state for
  Phase 4.

## What is broken or incomplete
Apply verify-before-carry-forward.
- Emoji maps hardcoded for Orion/Malachi (deferred to Phase 4)
- Firebase data cleanup TODO from 2026-04-26 backup audit (manual
  console work)
- CalendarWeekView.jsx at 252 lines (watch item, not urgent)
- Desktop hours footer first-load timing issue (minor — one student
  switch fixes it; deferred)

Phase 4 multi-family launch readiness — required before any external
testing family signs in. See CLAUDE.md for prerequisite cluster:
1. Tighten Firestore R2 rule to uid-scope
2. Add uid field to subject cells + backfill
3. Rewrite useComplianceSummary query to filter on uid
Estimated: ~3 sessions. Must land before any testing family signs in.

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Verify on main, pull latest
3. Migrate to new chat — this chat is at capacity.
   New chat picks up Phase 4 kickoff.

## Key files changed recently
- packages/dashboard/src/tools/planner/hooks/useSubjects.js
- packages/dashboard/package.json
- packages/shared/package.json
- CLAUDE.md
