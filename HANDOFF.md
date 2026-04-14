# HANDOFF — Session 14 (cleanup + weekId display fix)

## What was completed this session

### 1. Retired packages/planner and packages/reward-tracker
- Deleted `packages/planner/` and `packages/reward-tracker/` directories
- Updated root `package.json` workspaces from `["packages/*"]` glob to explicit list:
  `["packages/shared", "packages/dashboard", "packages/te-extractor"]`
- Removed `/planner/*` and `/reward-tracker/*` redirect blocks from `netlify.toml`
  (only `/api/*`, `/te-extractor/*`, and `/*` remain)
- Build verified clean after retirement

### 2. Fixed weekId display in import preview sheet
- `UploadSheet.jsx` was displaying `result.weekId` raw (from AI parse response)
- AI can return a non-Monday date (e.g. "2026-04-14" Tue instead of "2026-04-13" Mon)
- Wrapped all three display sites with `mondayWeekId()` imported from `../constants/days.js`:
  - Success state: "Applied — jumped to week of …"
  - Preview meta: "Student · Week of …"
  - Per-day date headers in the lesson list
- `handleApply` left unchanged — PlannerLayout already normalizes via `mondayWeekId()` before writes

---

## What is currently incomplete / pending

1. **HomeTab — replace tool cards with morning summary**
   - Currently shows old tool card grid. Links point to /planner and /reward-tracker — both retired.
   - Replace with morning summary: today's date, which student's day it is, point balances.

2. **Dark mode + sign-out missing from shell HomeTab**
   - Dark mode toggle and sign-out only accessible inside each tool's own header.
   - HomeTab needs an accessible dark mode toggle and sign-out. Confirm approach with Rob.

3. **Chunk size warning**
   - JS bundle is 634 KB (>500 KB threshold). Expected with both tools merged.
   - Not a blocker. Address with dynamic imports if load time becomes a concern.

4. **Import merge bug (calm-whistling-clock.md plan)**
   - Rob reported second PDF import with "Replace existing schedule" OFF still overwrites data.
   - Full diagnostic plan at `/root/.claude/plans/calm-whistling-clock.md`.
   - Next step: add console.logs to UploadSheet, PlannerLayout, useSubjects — confirm still
     reproducible in the shell tab (not the retired /planner/ URL), then fix.

5. **CLAUDE.md netlify.toml section needs update**
   - CLAUDE.md still documents the old config with `/planner/*` and `/reward-tracker/*` blocks.
   - Update to reflect the current 3-redirect config.

---

## What the next session should start with

1. Read CLAUDE.md + HANDOFF.md (standard)
2. Confirm HomeTab tool card links are dead and begin morning summary replacement
3. Address dark mode + sign-out on HomeTab (confirm approach with Rob first)
4. If Rob reports import merge bug still present: follow calm-whistling-clock.md plan
5. Update CLAUDE.md netlify.toml section

---

## Current netlify.toml (confirmed working)
```toml
[build]
  command = "npm install && npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/te-extractor/*"
  to = "/te-extractor/index.html"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Current root workspaces
```json
"workspaces": ["packages/shared", "packages/dashboard", "packages/te-extractor"]
```
