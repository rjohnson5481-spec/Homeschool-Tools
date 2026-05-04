# HANDOFF — v0.42.3 Header.jsx crash fix + PlannerTab guard fix complete

## Current version
v0.42.3

## What is complete

### Block 1 — Security prerequisites
- v0.35.0–v0.36.1 — uid fields, Firestore rules, compliance fixed

### Block 2 — studentId migration (Sessions 4–7)
- v0.37.0–v0.39.1 — full academic records + backup + PDF import studentId migration

### Block 4 — Onboarding + Settings (Sessions 7–8b + hotfixes)
- v0.40.0 — OnboardingFlow.jsx created
- v0.41.0 — Onboarding gate wired into App.jsx
- v0.42.0 — Settings student management rewritten to /students/ subcollection
- v0.42.1 — Onboarding add form labels + step indicator cleanup
- v0.42.2 — Fix React error #31: DayStrip + AddSubjectSheet student object crash
- v0.42.3 — Fix React error #31: Header.jsx + PlannerTab.jsx student object crash
  - Header.jsx: was mapping students as string[], now maps as objects.
    key=s.studentId, compare student===s.studentId, render {s.name},
    call onStudentChange(s.studentId). 67 lines.
  - PlannerTab.jsx: students.includes(student) → students.some(s =>
    s.studentId === student); students[0] → students[0]?.studentId. 61 lines.

## What is broken right now
- Nothing known. All student-object render sites in the planner are now fixed.
  App is self-bootstrapping for new families.
- One document in /users/{uid}/students/ has empty name (from a test run).
  Rob to delete manually in Firebase console — no code change needed.

## File size watch
- SettingsTab.jsx: 246 lines — approaching 250 target
- SettingsTab.css: 250 lines — at target limit, below 300 hard limit
- backup.js: 256 lines — above 250 target, below 300 hard limit

## Deferred items
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
3. Confirm version is 0.42.3
4. Confirm with Rob what to build next (Session 9 candidates:
   home tab zero/zero fix, 175-day hardcode, or Phase 5 month view)
