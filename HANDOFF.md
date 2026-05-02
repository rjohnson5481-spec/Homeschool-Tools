# HANDOFF — v0.36.1 bugfix: compliance save on fresh account

## What was completed this session
- Fixed FirebaseError "No document to update" thrown when toggling compliance
  on for the first time on a fresh account.
- Root cause: saveCompliance used updateDoc, which requires the document to
  already exist. Fresh accounts have no settings/compliance doc yet.
- Fix: changed to setDoc + { merge: true } — creates on first save, merges
  on subsequent saves. Identical behavior for existing accounts.
- Removed updateDoc from the firebase/firestore import (now unused).
- Verified all current call sites pass flat key-value pairs + deleteField()
  sentinels only — both are fully supported by setDoc+merge.
- Version bumped to v0.36.1.

## Phase 4 Block 1 prerequisite cluster — ALL COMPLETE (from v0.36.0)
1. ✅ uid field on all subject cell writes (v0.35.0)
2. ✅ R2 rule uid-scoped (v0.36.0)
3. ✅ useComplianceSummary query uid-filtered (v0.36.0)

## Action still required: Firestore composite index
Composite index on subjects (uid ASC, done ASC) must be created in Firebase
console before compliance day counting works. Firestore logs the creation link
on first run with daysEnabled on. Index build takes ~1 minute.

## What is broken or incomplete
- Composite index on subjects (uid ASC, done ASC) not yet created
- Emoji maps hardcoded for Orion/Malachi (deferred Phase 4)
- CalendarWeekView.jsx at 252 lines (watch item, not urgent)
- Desktop hours footer first-load timing issue (minor — deferred)

## Key files changed this session
- packages/dashboard/src/firebase/compliance.js (lines 6, 23–30)
- packages/dashboard/package.json → v0.36.1
- packages/shared/package.json → v0.36.1
- CLAUDE.md → version line

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Verify on main, pull latest
3. Confirm Rob has created the composite index in Firebase console
4. Phase 4 broader scope work or Phase 5 — confirm with Rob
