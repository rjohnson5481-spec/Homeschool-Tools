# HANDOFF — v0.38.0 Block 2 Session 5 complete

## Current version
v0.38.0

## What is complete

### Block 1 — Security prerequisites
- v0.35.0 — uid field on all subject cell writes
- v0.36.0 — R2 Firestore rule uid-scoped, useComplianceSummary uid-filtered
- v0.36.1 — compliance save fixed for fresh accounts (setDoc + merge)
- Composite index on subjects (uid ASC, done ASC) Collection group — Enabled

### Block 2 Session 4 — v0.37.0
- academicRecords.js split: 287 → 211 lines
- academicRecordsReports.js created (88 lines)
- useHomeSummary.js inline path fixed to use daySubjectsPath

### Block 2 Session 5 — v0.38.0
- useStudents.js hook created — subscribes to /users/{uid}/students/
  returns students array, studentMap, getStudentName()
- All planner hooks migrated: useSubjects, useSickDay, usePlannerHelpers
- All planner firebase migrated: planner.js, settings.js
- writeSickDay now writes studentId field instead of student
- Compliance layer migrated: compliance.js, useCompliance,
  useComplianceSummary, useHomeSummary
- Components migrated: HomeTab, RecordsMainView, ComplianceSheet,
  AcademicRecordsTab, AcademicRecordsSheets, BottomNav, App.jsx
- Internal settings/students listeners removed — useStudents is
  the single source of truth for student list
- Build verified clean: 383 modules

## What is NOT done yet — Session 6 is next

- academicRecords.js: enrollment writes still use student name field
- academicRecordsReports.js: reportNote and savedReport writes
  still use student name field
- academicRecordsActivities.js: activity writes still use student
  name field
- useEnrollments, useAcademicSummary, useReportNotes, useSavedReports:
  .student field references not yet migrated
- EnrollmentSheet, ManageActivitiesSheet, ReportCardGeneratorSheet,
  RestoreDiffCalendar: .student filter references not yet migrated
- backup.js: export and import still uses old student shape

## What is broken right now
- App shows no students — /users/{uid}/students/ collection does not
  exist in Firestore yet. Onboarding (Sessions 7-8) creates student
  documents. Do not deploy until onboarding is complete.
- Database is wiped clean — no planner or records data exists

## Deferred items
- Emoji maps hardcoded for Orion/Malachi — Phase 4 per-student settings
- CalendarWeekView.jsx at 252 lines — watch item
- Desktop hours footer first-load timing — minor, deferred
- Home tab shows zero/zero when compliance off — fix in Session 9
- Hardcoded 175 days on home card — fix in Session 9

## Next session start steps
1. Read CLAUDE.md and HANDOFF.md in full
2. git checkout main && git pull origin main
3. Confirm version is 0.38.0
4. Proceed with Session 6 — academic records + backup studentId migration
