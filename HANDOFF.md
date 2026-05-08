# HANDOFF — v0.45.0

## Completed this session
Feature: Auto-calculate "Starting days completed" in Track Compliance sheet.

### What was done
**constants/compliance.js** — Added `autoCalcStartingDays` to the compliance doc
shape comment and to `COMPLIANCE_DEFAULTS` (default `false`).

**AcademicRecordsSheets.jsx** — Threaded `activeSchoolYear={p.activeSchoolYear}`
to `<ComplianceSheet>`. The prop was already flowing from `AcademicRecordsTab`
into `AcademicRecordsSheets`; only the final handoff to ComplianceSheet was missing.

**ComplianceSheet.jsx** — Added:
- `calcStartingDays(schoolYear)` module-level function: counts weekdays from
  `startDate` through yesterday, skipping days inside any break period.
- `activeSchoolYear` prop (null default).
- `autoCalcStartingDays` toggle row inside the days-enabled section, hidden
  when no school year is set. Uses existing `st-row` / `st-toggle` CSS pattern.
- Starting days field is read-only and dimmed (`sc-input--readonly`) when
  auto-calc is on; editable as before when off.
- Calculated value is never written to Firestore — always derived live from
  school year data so it auto-updates if breaks change.

**ComplianceSheet.css** — Added `.sc-autocalc-row` (top border + padding for
separation inside `sc-fields`) and `.sc-input--readonly` (opacity 0.6,
cursor not-allowed, pointer-events none).

Build: clean (`vite build` passed, 229 lines in ComplianceSheet.jsx).

## What is broken right now
Nothing known.

## Next session start steps
1. Read CLAUDE.md + HANDOFF.md
2. Confirm task with Rob

## Key files changed this session
- `packages/dashboard/src/constants/compliance.js` (33 lines)
- `packages/dashboard/src/tools/academic-records/components/AcademicRecordsSheets.jsx` (79 lines)
- `packages/dashboard/src/tools/academic-records/components/ComplianceSheet.jsx` (229 lines)
- `packages/dashboard/src/tools/academic-records/components/ComplianceSheet.css` (158 lines)
- `packages/dashboard/package.json`
- `packages/shared/package.json`
