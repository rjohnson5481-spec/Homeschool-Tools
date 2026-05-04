# HANDOFF — v0.44.1

## Completed this session
Bug fix: onboarding flash persistent fix — replaced useState/useEffect latch with synchronous ref-based gate.

### What was done
**App.jsx** — Removed `initialLoadComplete` useState and two useEffects (uid-reset effect + loading-watch effect). Replaced with two refs (`hasLoadedRef`, `prevUidRef`) that update synchronously during render. The uid comparison and the latch both execute in the same render pass, eliminating the one-render window where uid had changed but `initialLoadComplete` hadn't been reset yet — which was the root cause of the onboarding flash.

## What is broken right now
Nothing known.

## Next session start steps
1. Read CLAUDE.md + HANDOFF.md
2. Confirm task with Rob

## Key files changed this session
- `packages/dashboard/src/App.jsx` (97 lines)
