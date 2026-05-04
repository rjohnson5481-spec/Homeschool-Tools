# HANDOFF — v0.44.5

## Completed this session
Bug fix: localStorage gate order — returning users now skip splash and onboarding entirely.

### What was done
**App.jsx** — Restructured the conditional return block. Previously, `cachedHasStudents` was defined at line 27 but not consulted until after `initialLoadComplete` resolved (line 72+), so the localStorage flag was never reached during the flash window. Now the entire `initialLoadComplete` and `students.length === 0` gate is wrapped in `if (!cachedHasStudents)`. Returning users (flag set) fall straight through to the main app shell on every load — zero splash, zero onboarding flash. New users (no flag) still wait for Firestore and see onboarding correctly. Also removed the now-unnecessary `hasStudents` derived value.

## What is broken right now
Nothing known.

## Next session start steps
1. Read CLAUDE.md + HANDOFF.md
2. Confirm task with Rob

## Key files changed this session
- `packages/dashboard/src/App.jsx` (114 lines)
