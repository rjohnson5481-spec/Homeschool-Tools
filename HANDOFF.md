# HANDOFF — v0.43.3

## Completed this session
Bug fix: useSchoolSettings field name mismatch.

### What was done
- **useSchoolSettings.js** — line 18: `data?.schoolName` → `data?.name` to match the field OnboardingFlow writes. OnboardingFlow saves `{ name: ..., tagline: ... }` but the hook was reading `schoolName`, always falling back to `'My Homeschool'`. All school name display and pre-population now works correctly.

## What is broken right now
Nothing known.

## Next session start steps
1. Read CLAUDE.md + HANDOFF.md
2. Confirm task with Rob

## Key files changed this session
- `src/hooks/useSchoolSettings.js` (27 lines)
