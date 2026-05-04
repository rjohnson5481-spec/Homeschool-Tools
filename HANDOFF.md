# HANDOFF — v0.39.0 Block 2 Session 6 complete

## Current version
v0.39.0

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
- All planner hooks migrated: useSubjects, useSickDay, usePlannerHelpers
- All planner firebase migrated: planner.js, settings.js
- Compliance layer migrated: compliance.js, useCompliance,
  useComplianceSummary, useHomeSummary
- Components migrated: HomeTab, RecordsMainView, ComplianceSheet,
  AcademicRecordsTab, AcademicRecordsSheets, BottomNav, App.jsx

### Block 2 Session 6 — v0.39.0
- academicRecords.js: getEnrollments sort uses studentId;
  saveEnrollment/addEnrollment data shape updated
- academicRecordsReports.js: getReportNote where() query uses
  studentId; saveReportNote/addReportNote field updated
- academicRecordsActivities.js: comment updated
- useEnrollments.js: syncCourseToPlanner and data.studentId migrated
- useAcademicSummary.js: filter e.studentId === studentId
- useReportNotes.js: saveNote param and find/write use studentId
- EnrollmentSheet.jsx: students prop [{studentId,name,emoji}];
  filter uses studentId; display uses effectiveName lookup
- ManageActivitiesSheet.jsx: same pattern as EnrollmentSheet
- ReportCardGeneratorSheet.jsx: localStudentId + localStudentName;
  all filters, saveNote, onSaveReport, PDF filename updated
- RestoreDiffCalendar.jsx: itemKey + all filters use studentId
- RestoreDiffSheet.jsx: itemKey + display use studentId
- backup.js: exportAllData reads /students collection (profile objects);
  importMerge/importFullRestore write student profiles to /students/{studentId};
  old names[] format skipped with warning; diff objects use studentId
- AcademicRecordsTab.jsx: e.studentId, a.studentId in edit handlers
- SavedReportCardsSheet.jsx: grouped by studentId; students prop as objects
- Build verified clean: 383 modules

## What is NOT done yet — Session 7 is next

### Deferred from this session (PDF import flow)
- usePlannerHelpers.js: safeData.student / result.student — the AI parser
  (parse-schedule.js) returns { student, weekId, days } with a name string.
  Migration requires updating the Netlify function and import flow together.
- usePdfImport.js: data.student — same
- UploadSheet.jsx: result?.student — same
- PlannerSheets.jsx: currentStudent={p.student} — prop naming (value is
  already a studentId; rename requires PlannerLayout + AddSubjectSheet audit)

### Remaining work — Session 7+ (Onboarding)
- /users/{uid}/students/ collection does not exist yet — no students in Firestore
- Onboarding flow (Sessions 7-8) creates student documents
- Do not deploy until onboarding is complete

## What is broken right now
- App shows no students — /users/{uid}/students/ collection does not
  exist in Firestore yet. Onboarding (Sessions 7-8) creates student
  documents. Do not deploy until onboarding is complete.
- Database is wiped clean — no planner or records data exists

## File size watch
- backup.js: 256 lines — above 250 target, below 300 hard limit

## Deferred items
- Emoji maps hardcoded for Orion/Malachi — Phase 4 per-student settings
- CalendarWeekView.jsx at 252 lines — watch item
- Desktop hours footer first-load timing — minor, deferred
- Home tab shows zero/zero when compliance off — fix in Session 9
- Hardcoded 175 days on home card — fix in Session 9

## Next session start steps
1. Read CLAUDE.md and HANDOFF.md in full
2. git checkout main && git pull origin main
3. Confirm version is 0.39.0
4. Proceed with Session 7 — Onboarding flow (create /users/{uid}/students/ docs)
