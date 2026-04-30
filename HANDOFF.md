# HANDOFF — v0.35.0 Phase 4 Block 1 Session 1: uid field on subject cell writes

## What was completed this session
- Added `uid` field to every Firestore subject cell write — going-forward only, no migration.
- `planner.js:updateCell` now spreads `{ ...data, uid }` before setDoc, so every normal
  planner write (add subject, edit cell, PDF import, sick day cascade, undo cascade) carries uid.
- `backup.js:importMerge` injects `cell.uid = uid` before writeIfMissing — new cells written
  during merge restore carry uid.
- `backup.js:importFullRestore` injects `cell.uid = uid` before setDoc — full restores carry uid.
- `backup.js:applyRestoreDiff` injects `item.backup.uid = uid` before setDoc — diff-restore
  writes carry uid.
- Old exports without a uid field work correctly: uid is always injected at write time from
  the authenticated user, never trusted from backup data.
- Version bumped to v0.35.0 in both package.json files.

## What is broken or incomplete
- Existing subject cell documents in Firestore do NOT have uid. Backfill migration is a
  separate session (Block 1 Session 2). Do not tighten the Firestore R2 rule until backfill
  is confirmed complete.
- Emoji maps hardcoded for Orion/Malachi (deferred Phase 4)
- Firebase data cleanup TODO from 2026-04-26 backup audit (manual console work)
- CalendarWeekView.jsx at 252 lines (watch item, not urgent)
- Desktop hours footer first-load timing issue (minor — deferred)

## Phase 4 prerequisite cluster status
1. ✅ Add uid field to subject cell writes (this session)
2. ⬜ Backfill uid onto existing subject cell documents (Block 1 Session 2 — scripts/ pattern)
3. ⬜ Tighten Firestore R2 rule to uid-scope subjects reads (Block 1 Session 3)
4. ⬜ Rewrite useComplianceSummary collectionGroup query to filter on uid (Block 1 Session 4)

## Files changed this session
- packages/dashboard/src/tools/planner/firebase/planner.js (line 27)
- packages/dashboard/src/firebase/backup.js (lines 100, 155, 230)
- packages/dashboard/package.json → v0.35.0
- packages/shared/package.json → v0.35.0
- CLAUDE.md → version line updated

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Verify on main, pull latest
3. Block 1 Session 2: write a scripts/ backfill migration to add uid to all existing
   subject cell documents in Firestore (Rob runs from his machine per the scripts/ pattern).
