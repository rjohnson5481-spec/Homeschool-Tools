# HANDOFF — v0.30.1 cleanup sweep after rewards/TE removal

## What was completed this session
- HomeTab.jsx — removed the Points stat, `$cashValue`
  progress label, `pointsByStudent` destructure, `pts`
  variable, and the `points={...}` prop pass to
  StudentDetailSheet. Greeting, lessons, attendance, and
  Days stat untouched.
- StudentDetailSheet.jsx — removed the Quick Award
  section entirely: the JSX block, `awardAmt`/`awarded`/
  `timer` state, both useEffects, `handleAward`, and
  `onAwardPoints` prop. Imports of `useState`/`useRef`/
  `useEffect` dropped (all were Quick-Award-only). Header
  `{pts.points} pts` badge left in place — it now shows
  "0 pts" harmlessly and will be removed on the next
  StudentDetailSheet touch.
- StudentDetailSheet.css — removed `.sds-award-block`,
  `.sds-award-btns`, `.sds-award-btn`,
  `.sds-award-btn.selected`, `.sds-award-confirm`,
  `.sds-award-confirm:disabled`/`:hover`,
  `.sds-award-success`, and the award-related lines from
  the 400-809px media query.
- useHomeSummary.js — removed the rewardTracker
  onSnapshot subscription, the `pointsByStudent` state,
  the `cashValue()` helper, and `pointsByStudent` from
  the return value. Grep confirmed HomeTab was the only
  consumer and Fix 1 had already removed it.
- PlannerTab.jsx — dropped the dead `sickDayIndices`
  destructure (useSubjects no longer returns it) and the
  dead `sickDayIndices={...}` prop pass. PlannerLayout's
  prop signature intentionally untouched — it silently
  ignores the missing prop until its next refactor.
- constants/tools.js — deleted. Greps for
  `constants/tools` and `from.*tools'` inside
  `packages/dashboard/src/constants` both returned no
  hits, confirming zero consumers.
- PlannerLayout.jsx:133 — comment changed from `≥1024px`
  to `≥810px` (matches v0.28+ desktop breakpoint).
- MultiSelectBar.jsx:8 — comment changed from
  `max-width: 1023px` to `max-width: 809px`.
- Version bump — `@homeschool/dashboard` and
  `@homeschool/shared` moved from 0.30.0 → 0.30.1 (patch
  bump, cleanup/bug-fix release).

## What is broken or incomplete
- Netlify Blobs auto-backup (v0.28.6) is still
  unverified — confirm a backup appears in the Blobs
  store after the next scheduled run.
- firebase/backup.js still reads/writes the
  rewardTracker collection so old backups continue to
  round-trip. Safe — trim when the backup format is next
  revisited.
- useSubjects.js and useSickDay.js both subscribe to
  sick days. Duplicate listener — collapse on the next
  useSubjects touch.
- CalendarWeekView.jsx calls Firebase and useAuth
  directly instead of going through props/hooks.
  Refactor on next touch.
- PDF helpers + `handleMoveCell` still live inside
  PlannerLayout.jsx (275/300 lines). Must extract before
  adding any new code to that file.
- Emoji maps are hardcoded for Orion/Malachi in 4 files.
  Deferred — needs a per-student emoji setting.
- StudentDetailSheet header still renders
  `{pts.points} pts`. Always reads as "0 pts" since
  HomeTab no longer passes a points prop. Rip on the
  next StudentDetailSheet touch.
- HomeTab still defines a no-op `handleAwardPoints` and
  passes it as `onAwardPoints` to StudentDetailSheet,
  which no longer reads it. Harmless — delete on the
  next HomeTab touch.

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Confirm on main, pull latest
3. Ask Rob what we are building today

## Key files changed recently
- packages/dashboard/src/tabs/HomeTab.jsx
- packages/dashboard/src/tabs/StudentDetailSheet.jsx
- packages/dashboard/src/tabs/StudentDetailSheet.css
- packages/dashboard/src/hooks/useHomeSummary.js
- packages/dashboard/src/tabs/PlannerTab.jsx
- packages/dashboard/src/constants/tools.js (deleted)
- packages/dashboard/src/tools/planner/components/PlannerLayout.jsx
- packages/dashboard/src/tools/planner/components/MultiSelectBar.jsx
- packages/dashboard/package.json
- packages/shared/package.json
