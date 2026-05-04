# HANDOFF — v0.44.2

## Completed this session
Bug fix: useStudents and useSchoolSettings reset loading to true when uid becomes available.

### What was done
Both hooks previously set `loading = false` when uid was null (via the null-uid branch of their useEffect), then did not reset it to `true` before the Firestore subscription was created when uid changed. This meant the App.jsx ref gate could see `studentsLoading === false` and `schoolSettingsLoading === false` before any snapshot had arrived, latching `hasLoadedRef.current = true` too early and flashing onboarding.

Fix: added `setLoading(true)` (and `setStudents([])` in useStudents) at the top of the uid-present branch in each useEffect, before the subscription is created. Loading now accurately reflects "waiting for first snapshot" for the entire window between uid becoming available and the first Firestore response.

## What is broken right now
Nothing known.

## Next session start steps
1. Read CLAUDE.md + HANDOFF.md
2. Confirm task with Rob

## Key files changed this session
- `packages/dashboard/src/hooks/useStudents.js` (36 lines)
- `packages/dashboard/src/hooks/useSchoolSettings.js` (29 lines)
