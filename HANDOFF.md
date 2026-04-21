# HANDOFF — v0.28.6 Netlify Blobs siteID + token fix

## What was completed this session
- Scheduled backup getStore call now passes siteID + token
  explicitly — resolves MissingBlobsEnvironmentError on the
  6-hour schedule
- Version bump to v0.28.6

## What is broken or incomplete
- Done circle in CalendarWeekView does nothing on desktop
- Duplicate subscribeSickDays in useSubjects + useSickDay
  — collapse on next useSubjects touch
- PDF helpers and handleMoveCell still in PlannerLayout.jsx
  — extract on next touch
- Home tab greeting always says Good Morning — should match
  time of day
- Netlify Blobs auto-backup fix is deployed but unverified —
  confirm a backup appears in the Blobs store after the next
  scheduled run (or invoke the function manually)

## Next session must start with
1. Read CLAUDE.md and HANDOFF.md
2. Confirm on main, pull latest
3. Ask Rob what we are building today

## Key files changed recently
- netlify/functions/scheduled-backup.js
- packages/dashboard/package.json
- packages/shared/package.json
- packages/te-extractor/package.json
