# HANDOFF — v0.44.3

## Completed this session
Bug fix: Onboarding flash — localStorage persistence so the gate opens instantly on return loads.

### What was done

**App.jsx** — Added `HAS_STUDENTS_KEY = 'ila_has_students'` module constant. Added `cachedHasStudents` derived from `localStorage.getItem` (synchronous, read each render). Added two useEffects: one syncs the flag whenever `studentsLoading` clears (sets when students > 0, removes when 0); one clears the flag on sign-out (`!loading && !user`). Changed onboarding gate from `students.length === 0` to `!(students.length > 0 || cachedHasStudents)`. All localStorage logic stays in App.jsx — SettingsTab and Header untouched.

**OnboardingFlow.jsx** — Added `localStorage.setItem('ila_has_students', 'true')` immediately before `onComplete()` in `handleFinish`, so newly onboarded families are also covered on their next load.

**Timing guarantee:** On a return load, `cachedHasStudents` is true before any Firestore snapshot arrives, so `hasStudents` is true as soon as `initialLoadComplete` latches. Onboarding never flashes. On sign-out and sign-in with a different account (or factory reset), the flag is cleared and onboarding shows correctly.

## What is broken right now
Nothing known.

## Next session start steps
1. Read CLAUDE.md + HANDOFF.md
2. Confirm task with Rob

## Key files changed this session
- `packages/dashboard/src/App.jsx` (112 lines)
- `packages/dashboard/src/components/OnboardingFlow.jsx` (222 lines)
