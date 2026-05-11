# HANDOFF — v0.46.0

## Completed this session
Security fix: VITE_ANTHROPIC_API_KEY removed from bundle. All Anthropic API
calls now go through Netlify Functions using server-side ANTHROPIC_API_KEY only.

### Root cause
CalendarImportSheet and CurriculumImportSheet called `api.anthropic.com`
directly from the browser using `VITE_ANTHROPIC_API_KEY`. Vite bakes all
`VITE_*` env vars into the public JS bundle at build time, so the key was
exposed to anyone who inspected the bundle. It was compromised by a bot.

### What was done

**netlify/functions/parse-calendar.js** (new, 110 lines) — Accepts
`{ file, mediaType, fileName, uid }`. Handles PDF (document block), image
(image block), and iCal/text (decodes base64 → plain text). Rate-limited
5/day via `users/{uid}/aiUsage/calendar`. Model: claude-haiku-4-5-20251001.

**netlify/functions/parse-curriculum.js** (new, 103 lines) — Same pattern.
Rate-limited 5/day via `users/{uid}/aiUsage/curriculum`. Returns `{ courses }`.

**netlify/functions/parse-schedule.js** (updated, 119 lines) — Added Firebase
Admin + rate limiting (10/day via `users/{uid}/aiUsage/schedule`). Now requires
`uid` in POST body.

**packages/dashboard/src/utils/compressImage.js** (new, 24 lines) — Pure
utility. Resizes images wider than 1200px to 1200px JPEG at 0.85 quality
before upload. Non-image files pass through unchanged.

**CalendarImportSheet.jsx** (updated, 175 lines) — Removed VITE key usage
and direct `api.anthropic.com` fetch. Added compressImage, `uid` prop, POST
to `/.netlify/functions/parse-calendar`. Handles 429 with user-friendly msg.

**CurriculumImportSheet.jsx** (updated, 182 lines) — Same changes. POST to
`/.netlify/functions/parse-curriculum`. Normalizes `{ title, publisher }`
response to `{ name, curriculum }` shape expected by downstream.

**AcademicRecordsSheets.jsx** — Added `uid={p.uid}` to both import sheets.

**usePdfImport.js** — `usePdfImport(uid)` now accepts uid, includes it in
POST body to `/api/parse-schedule`.

**PlannerTab.jsx** — `usePdfImport(user?.uid)` threads uid from auth.

**CLAUDE.md** — Removed VITE_ANTHROPIC_API_KEY env var entry and intentional
exception note. Updated key decisions and Anthropic functions description.
Added AI Rate Limiting section to Firestore data model.

Build: clean (389 modules, same as v0.45.1).

### Action required before using parse-calendar/parse-curriculum
The two new Netlify Functions also need `FIREBASE_SERVICE_ACCOUNT` (same
env var already set for scheduled-backup.js) — no new secrets needed.
`ANTHROPIC_API_KEY` already set. Both functions deploy automatically on
Netlify push. No Firestore index needed (aiUsage docs are simple doc reads).

## What is broken right now
Nothing known.

## Next session start steps
1. Read CLAUDE.md + HANDOFF.md
2. Confirm task with Rob

## Key files changed this session
- `netlify/functions/parse-calendar.js` (110 lines, new)
- `netlify/functions/parse-curriculum.js` (103 lines, new)
- `netlify/functions/parse-schedule.js` (119 lines, updated)
- `packages/dashboard/src/utils/compressImage.js` (24 lines, new)
- `packages/dashboard/src/tools/academic-records/components/CalendarImportSheet.jsx` (175 lines)
- `packages/dashboard/src/tools/academic-records/components/CurriculumImportSheet.jsx` (182 lines)
- `packages/dashboard/src/tools/academic-records/components/AcademicRecordsSheets.jsx`
- `packages/dashboard/src/tools/planner/hooks/usePdfImport.js`
- `packages/dashboard/src/tabs/PlannerTab.jsx`
- `packages/dashboard/package.json`
- `packages/shared/package.json`
- `CLAUDE.md`
