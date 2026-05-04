# HANDOFF — v0.44.0

## Completed this session
Bundle fix: Header duplication + onboarding flash + compliance display.

### What was done

**FIX 1 — Header.css** — Added `.header-brand { display: none; }` inside the existing `@media (min-width: 810px)` block. The whole `.header` was already hidden at desktop; this adds an explicit brand rule for clarity.

**FIX 2 — HomeTab.jsx + App.jsx** — Removed the `<header className="home-header">` brand block from HomeTab entirely (JSX + logo import + schoolName prop). App.jsx updated to call `<HomeTab />` with no props. Also wrapped the attendance progress row in `{daysRequired > 0 && (...)}` to fix the "163 of 0 days" display when compliance is enabled but requiredDays is 0.

**FIX 3 — App.jsx** — Replaced the bare `studentsLoading || schoolSettingsLoading` gate with an `initialLoadComplete` latch state that resolves to `true` only after both Firestore hooks have fired their first snapshot. Prevents the onboarding screen from flashing on page refresh.

## What is broken right now
Nothing known.

## Next session start steps
1. Read CLAUDE.md + HANDOFF.md
2. Confirm task with Rob

## Key files changed this session
- `packages/dashboard/src/tools/planner/components/Header.css` (206 lines)
- `packages/dashboard/src/tabs/HomeTab.jsx` (121 lines)
- `packages/dashboard/src/App.jsx` (94 lines)
