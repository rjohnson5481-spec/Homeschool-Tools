# HANDOFF — v0.45.1

## Completed this session
Bug fix: autoCalcStartingDays offset not applied to compliance day count.

### Root cause
When `autoCalcStartingDays` was true, `ComplianceSheet` displayed the
calculated value (e.g. 166) but never wrote it to Firestore. `useComplianceSummary`
always read `startingDays` from Firestore (which stayed 0) and never
consulted `autoCalcStartingDays`. Formula was always `0 + N` instead of
`166 + N`.

### What was done
**utils/calcStartingDays.js** (new) — Extracted `calcStartingDays()` from
`ComplianceSheet.jsx` into a shared pure utility so both the component and
the hook can import it without duplication.

**useComplianceSummary.js** — Three changes:
1. Imports `calcStartingDays` from `utils/calcStartingDays.js`.
2. After determining the active school year, fetches its `breaks` subcollection
   so `calcStartingDays` receives the same break data the component uses.
3. `daysCompletedByStudent` memo now branches on `settings.autoCalcStartingDays`:
   uses `calcStartingDays(activeSchoolYear)` when true, `settings.startingDays`
   when false. `activeSchoolYear` added to dep array.

**ComplianceSheet.jsx** — Removed inline `calcStartingDays` function;
imports from `utils/calcStartingDays.js` instead. No behavioural change.

Build: clean (388 modules, `vite build` passed).
Line counts: useComplianceSummary 191, ComplianceSheet 204.

## What is broken right now
Nothing known.

## Next session start steps
1. Read CLAUDE.md + HANDOFF.md
2. Confirm task with Rob

## Key files changed this session
- `packages/dashboard/src/utils/calcStartingDays.js` (27 lines, new)
- `packages/dashboard/src/hooks/useComplianceSummary.js` (191 lines)
- `packages/dashboard/src/tools/academic-records/components/ComplianceSheet.jsx` (204 lines)
- `packages/dashboard/package.json`
- `packages/shared/package.json`
