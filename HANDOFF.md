# HANDOFF — v0.36.0 Phase 4 Block 1 Session 2: R2 rule + compliance query

## What was completed this session
- Tightened Firestore R2 security rule: subjects collectionGroup reads now
  require resource.data.uid == request.auth.uid (was auth-only).
- Added uid filter to useComplianceSummary collectionGroup query:
  where('uid', '==', uid) + where('done', '==', true).
- Updated multi-family caveat comment in useComplianceSummary to reflect
  Phase 4 Block 1 complete.
- CLAUDE.md updated: security rules doc-block, roadmap, key decisions.
- Version bumped to v0.36.0 in both package.json files.

## Phase 4 Block 1 prerequisite cluster — ALL COMPLETE
1. ✅ uid field on all subject cell writes (v0.35.0)
2. ✅ R2 rule uid-scoped (v0.36.0)
3. ✅ useComplianceSummary query uid-filtered (v0.36.0)

## Action required before compliance summary works correctly
The collectionGroup query now uses two fields (uid + done). Firestore requires
a composite index for this. On first load of the Home or Records tab (when
daysEnabled is on), Firestore will throw a console error with a direct link to
create the index automatically in Firebase console.
- Index: collection group = subjects, fields = uid ASC + done ASC
- Rob must click the console link and wait ~1 min for the index to build.
- Until the index is built, compliance day counts will not load (listener
  silently fails). Hours tracking is unaffected (different query path).

## What is broken or incomplete
- Composite index on subjects (uid ASC, done ASC) not yet created — needed
  before compliance day counting works (see Action required above).
- Emoji maps hardcoded for Orion/Malachi (deferred Phase 4)
- CalendarWeekView.jsx at 252 lines (watch item, not urgent)
- Desktop hours footer first-load timing issue (minor — deferred)

## Key files changed this session
- firestore.rules (line 9)
- packages/dashboard/src/hooks/useComplianceSummary.js (lines 18-19, 107-108)
- packages/dashboard/package.json → v0.36.0
- packages/shared/package.json → v0.36.0
- CLAUDE.md → version, rules doc-block, roadmap, key decisions

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Verify on main, pull latest
3. Confirm Rob has created the composite index in Firebase console
4. Phase 4 broader scope work or Phase 5 — confirm with Rob
