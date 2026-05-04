# HANDOFF — v0.41.0 Block 4 Session 8 complete

## Current version
v0.41.0

## What is complete

### Block 1 — Security prerequisites
- v0.35.0 — uid field on all subject cell writes
- v0.36.0 — R2 Firestore rule uid-scoped, useComplianceSummary uid-filtered
- v0.36.1 — compliance save fixed for fresh accounts (setDoc + merge)
- Composite index on subjects (uid ASC, done ASC) Collection group — Enabled

### Block 2 — studentId migration (Sessions 4–7)
- v0.37.0–v0.39.1 — full academic records + backup + PDF import studentId migration

### Block 4 — Onboarding (Sessions 7–8)
- v0.40.0 — OnboardingFlow.jsx + OnboardingFlow.css created
  Step 1: school name + tagline → /users/{uid}/settings/school
  Step 2: students added locally → /users/{uid}/students/{id}
- v0.41.0 — Onboarding gate wired into App.jsx
  - studentsLoading gate: animated logo splash prevents flash of onboarding
    for existing users while Firestore snapshot resolves
  - students.length === 0 → renders OnboardingFlow
  - onComplete is empty; useStudents onSnapshot auto-reopens the shell
  - App is now self-bootstrapping for new families

## What is NOT done yet

### Deferred items
- Emoji maps hardcoded for Orion/Malachi — Phase 4 per-student settings
- CalendarWeekView.jsx at 252 lines — watch item
- Desktop hours footer first-load timing — minor, deferred
- Home tab shows zero/zero when compliance off — fix in Session 9
- Hardcoded 175 days on home card — fix in Session 9
- PlannerSheets.jsx: currentStudent={p.student} prop rename — deferred
- backup.js: 256 lines — above 250 target, below 300 hard limit

## What is broken right now
- Nothing known. Onboarding flow is complete and wired.
- Database is wiped clean — no planner or records data exists yet.
  New users will be prompted through onboarding on first sign-in.

## Next session start steps
1. Read CLAUDE.md and HANDOFF.md in full
2. git checkout main && git pull origin main
3. Confirm version is 0.41.0
4. Confirm with Rob what to build next (Session 9 candidates:
   home tab zero/zero fix, 175-day hardcode fix, or Phase 5 month view)
