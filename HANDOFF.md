# HANDOFF — v0.40.0 Block 4 Session 7 complete

## Current version
v0.40.0

## What is complete

### Block 1 — Security prerequisites
- v0.35.0 — uid field on all subject cell writes
- v0.36.0 — R2 Firestore rule uid-scoped, useComplianceSummary uid-filtered
- v0.36.1 — compliance save fixed for fresh accounts (setDoc + merge)
- Composite index on subjects (uid ASC, done ASC) Collection group — Enabled

### Block 2 — studentId migration (Sessions 4–7)
- v0.37.0 — academicRecords.js split
- v0.38.0 — useStudents hook + all planner/compliance hooks migrated
- v0.39.0 — full academic records + backup studentId migration
- v0.39.1 — PDF import fix: usePdfImport stores studentName; usePlannerHelpers
  resolves name→studentId via resolveStudentId(); UploadSheet uses studentName;
  PlannerLayout passes students array to usePlannerHelpers

### Block 4 Session 7 — v0.40.0
- OnboardingFlow.jsx created (183 lines)
- OnboardingFlow.css created (170 lines)
- Step 1: school name + tagline saved to /users/{uid}/settings/school via setDoc merge
- Step 2: students added locally, then written to /users/{uid}/students/{id}
  with { studentId, name, emoji, gradeLevel, order, createdAt }
- Props: uid, onComplete()
- Build verified clean: 10 precache entries

## What is NOT done yet — Session 8 is next

### Session 8 — Wire onboarding gate into App.jsx
- App.jsx must check whether /users/{uid}/students/ collection is non-empty
  (or a dedicated onboarding-complete flag) on auth load
- If no students → render <OnboardingFlow uid={uid} onComplete={…} />
  instead of the main app shell
- On onComplete: re-check students (useStudents will update via onSnapshot)
  and unmount the flow, rendering the normal shell

## What is broken right now
- App shows no students — /users/{uid}/students/ collection does not exist
  in Firestore yet. Onboarding (Sessions 7-8) creates these documents.
  Do not deploy until Session 8 is complete and the gate is wired.
- Database is wiped clean — no planner or records data exists

## File size watch
- backup.js: 256 lines — above 250 target, below 300 hard limit

## Deferred items
- Emoji maps hardcoded for Orion/Malachi — Phase 4 per-student settings
- CalendarWeekView.jsx at 252 lines — watch item
- Desktop hours footer first-load timing — minor, deferred
- Home tab shows zero/zero when compliance off — fix in Session 9
- Hardcoded 175 days on home card — fix in Session 9
- PlannerSheets.jsx: currentStudent={p.student} prop rename (value is already
  a studentId; rename requires PlannerLayout + AddSubjectSheet audit) — deferred

## Next session start steps
1. Read CLAUDE.md and HANDOFF.md in full
2. git checkout main && git pull origin main
3. Confirm version is 0.40.0
4. Proceed with Session 8 — wire OnboardingFlow gate into App.jsx
