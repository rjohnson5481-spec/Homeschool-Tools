# HANDOFF — v0.30.0 4-tab shell, rewards + TE Extractor removed

## What was completed this session
- Rewards tab removed — RewardsTab.jsx deleted, entire
  `packages/dashboard/src/tools/reward-tracker/` directory
  (15 files) deleted, App.jsx no longer imports or renders
  it, BottomNav TABS entry removed.
- TE Extractor tab + package removed — entire
  `packages/te-extractor/` directory (10 files) deleted,
  workspaces reduced to `["packages/shared", "packages/dashboard"]`,
  netlify.toml `/te-extractor/*` redirect block removed
  (`[build]` block + `/api/*` + SPA catch-all preserved).
- BottomNav tab order is now exactly Home / Planner / Records
  / Settings.
- App.jsx dead-prop pass `onTabChange={setActiveTab}` to
  HomeTab removed (HomeTab never consumed it; it was only
  there for cross-tab jumps to rewards).
- HomeTab.jsx minimally touched to preserve the build: the
  now-broken `import { awardPoints } from
  '../tools/reward-tracker/firebase/rewardTracker.js'` is
  gone and `handleAwardPoints` is a no-op.
- Version bump to v0.30.0 — milestone. Only `@homeschool/dashboard`
  and `@homeschool/shared` get the bump; te-extractor's
  package.json was deleted.

## What is broken or incomplete
- Netlify Blobs auto-backup fix (v0.28.6) is deployed but
  unverified — confirm a backup appears in the Blobs store
  after the next scheduled run.
- PlannerTab.jsx still destructures sickDayIndices from
  useSubjects (now undefined) and passes a dead sickDayIndices
  prop to PlannerLayout. Harmless — clean up on the next
  PlannerTab touch.
- Two stale JSX comments (PlannerLayout.jsx:133 `≥1024px`,
  MultiSelectBar.jsx:8 `max-width: 1023px`) still reference
  the old breakpoint. Sweep on next touch of each file.
- StudentDetailSheet's "Quick Award" UI is orphaned — the
  sheet still renders +1/+5/+10 buttons and the confirm
  button, but `onAwardPoints` is a no-op so the taps do
  nothing. Remove the Quick Award block from
  StudentDetailSheet.jsx (and matching CSS) on its next
  touch.
- `useHomeSummary.js` still subscribes to
  `/users/{uid}/rewardTracker/{name}` and returns
  `pointsByStudent`. HomeTab still renders a "Points" stat +
  a `$cashValue` line. Data is now frozen (Firestore docs
  remain but nothing writes). If desired, rip the points
  path + UI on a follow-up.
- `firebase/backup.js` still reads/writes the rewardTracker
  collection so old backups continue to round-trip. Safe to
  leave — nothing in the live app depends on it — but worth
  trimming when the backup format is next revisited.
- `constants/tools.js` is dead (no import sites) and still
  lists reward-tracker + te-extractor entries. Leave or
  delete on the next unrelated pass.
- VITE_ANTHROPIC_API_KEY is still used by
  CalendarImportSheet and CurriculumImportSheet (academic
  records) — do not remove the env var.

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Confirm on main, pull latest
3. Ask Rob what we are building today

## Key files changed recently
- packages/dashboard/src/App.jsx
- packages/dashboard/src/components/BottomNav.jsx
- packages/dashboard/src/tabs/HomeTab.jsx
- packages/dashboard/src/tabs/RewardsTab.jsx (deleted)
- packages/dashboard/src/tools/reward-tracker/ (deleted, 15 files)
- packages/te-extractor/ (deleted, 10 files)
- package.json (workspaces)
- netlify.toml (TE redirect removed)
- packages/dashboard/package.json
- packages/shared/package.json
- CLAUDE.md
