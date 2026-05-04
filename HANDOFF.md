# HANDOFF — v0.44.6

## Completed this session
Bug fix: Onboarding flash root cause — pre-auth empty state was wiping the localStorage flag.

### What was done

**App.jsx** — Added `if (loading || !user) return` guard at the top of the cache sync useEffect. Previously, `useStudents(undefined)` would set `studentsLoading=false` with empty students before Firebase Auth resolved, causing the effect to call `localStorage.removeItem(HAS_STUDENTS_KEY)`. The flag was gone by the time auth resolved, so the fast path was never taken. Also added `loading` and `user` to the dependency array.

**useStudents.js** — Replaced two separate `useState` declarations with a single uid-tagged `state` object. Derived `students` and `loading` from the state only when `state.uid === uid`, so stale pre-auth state can never satisfy the load gate on a uid transition. `loading` is `true` any time `uid` is truthy but the state hasn't caught up yet.

**useSchoolSettings.js** — Same uid-tagged pattern applied. State object carries `{ uid, schoolName, tagline, loading }`. Derived values fall back to defaults when `state.uid !== uid`.

## What is broken right now
Nothing known.

## Next session start steps
1. Read CLAUDE.md + HANDOFF.md
2. Confirm task with Rob

## Key files changed this session
- `packages/dashboard/src/App.jsx` (116 lines)
- `packages/dashboard/src/hooks/useStudents.js` (42 lines)
- `packages/dashboard/src/hooks/useSchoolSettings.js` (39 lines)
