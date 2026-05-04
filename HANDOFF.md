# HANDOFF — v0.44.4

## Completed this session
Bug fix: Sick day false positive — prop name mismatch in PlannerLayout → useSickDay.

### What was done
**PlannerLayout.jsx line 87** — Changed `student` → `studentId: student` in the `useSickDay` call. The hook destructures `studentId` but the caller was passing the prop as `student`, so `studentId` was `undefined` inside the hook. With an empty sickDays collection, every `sickDays[date]?.studentId` evaluates to `undefined`, and `undefined === undefined` is `true` — making all 5 day tabs appear as sick days. One character fix closes the false positive entirely.

## What is broken right now
Nothing known.

## Next session start steps
1. Read CLAUDE.md + HANDOFF.md
2. Confirm task with Rob

## Key files changed this session
- `packages/dashboard/src/tools/planner/components/PlannerLayout.jsx` (262 lines)
