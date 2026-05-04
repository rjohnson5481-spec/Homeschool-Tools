# HANDOFF — v0.42.1 Onboarding bug fix complete

## Current version
v0.42.1

## What is complete

### Block 1 — Security prerequisites
- v0.35.0–v0.36.1 — uid fields, Firestore rules, compliance fixed

### Block 2 — studentId migration (Sessions 4–7)
- v0.37.0–v0.39.1 — full academic records + backup + PDF import studentId migration

### Block 4 — Onboarding + Settings (Sessions 7–8b + hotfix)
- v0.40.0 — OnboardingFlow.jsx created (two-step school setup + student add)
- v0.41.0 — Onboarding gate wired into App.jsx (studentsLoading splash + gate)
- v0.42.0 — Settings student management + onboarding polish:
  - NEW: firebase/students.js — addStudent, updateStudent, deleteStudent
    writing to /users/{uid}/students/{id} with full schema
  - useSettings.js: removed saveStudents, students state, settings/students
    onSnapshot — student list now exclusively owned by useStudents
  - SettingsTab.jsx: Students section rewritten — inline add/edit/remove forms,
    reads students from prop (passed from App.jsx), no second useStudents subscription.
    Emoji + gradeLevel now displayed and editable. Remove shows confirm inline
    with console.warn about non-cascading deletes.
  - SettingsTab: new School Setup section — "Edit School Info" opens OnboardingFlow
    fullscreen; onComplete closes it.
  - App.jsx: passes students prop to SettingsTab
  - OnboardingFlow.jsx/css: step label below dots ("SCHOOL SETUP" / "ADD STUDENTS")
    makes active step unmistakable; dots margin adjusted
- v0.42.1 — Onboarding add form labels + step indicator cleanup:
  - Student add form restructured from bare grid inputs to labeled field groups.
    Name (required *), Emoji (sub-label: "Leave blank for default 🎓"),
    Grade Level (sub-label: "Optional — e.g. 3rd, 4th, K"). Grid layout removed.
  - Step indicator uses [1,2].map — dot n active when n === step, explicit.
  - OnboardingFlow.jsx: 198 lines. OnboardingFlow.css: 187 lines.

## What is broken right now
- Nothing known. App is self-bootstrapping for new families.
- One document in /users/{uid}/students/ has empty name (from a test run).
  Rob to delete manually in Firebase console — no code change needed.

## File size watch
- SettingsTab.jsx: 246 lines — approaching 250 target
- SettingsTab.css: 250 lines — at target limit, below 300 hard limit
- backup.js: 256 lines — above 250 target, below 300 hard limit

## Deferred items
- Emoji maps hardcoded for Orion/Malachi — removed (now stored per-student)
- CalendarWeekView.jsx at 252 lines — watch item
- Desktop hours footer first-load timing — minor, deferred
- Home tab shows zero/zero when compliance off — fix in Session 9
- Hardcoded 175 days on home card — fix in Session 9
- PlannerSheets.jsx: currentStudent={p.student} prop rename — deferred
- Subject presets keyed by student name (not studentId) — pre-existing,
  deferred to Phase 4 profile migration

## Next session start steps
1. Read CLAUDE.md and HANDOFF.md in full
2. git checkout main && git pull origin main
3. Confirm version is 0.42.1
4. Confirm with Rob what to build next (Session 9 candidates:
   home tab zero/zero fix, 175-day hardcode, or Phase 5 month view)
