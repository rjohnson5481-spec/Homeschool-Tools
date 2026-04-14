# HANDOFF — Session 15 (morning summary + desktop sidebar)

## What was completed this session

### Fix 1 — Dead tool card links
- `ToolCard.jsx`: added `onClick` prop — renders `<button>` instead of `<a>` when provided
- `ToolCard.css`: added `button.tool-card-link` reset styles
- `HomeTab.jsx`: accepts `onTabChange` prop; Planner + Rewards cards call `onTabChange`
- `App.jsx`: passes `onTabChange={setActiveTab}` to `<HomeTab>`

### Fix 2 — Morning summary dashboard
- New hook: `packages/dashboard/src/hooks/useHomeSummary.js`
  - Subscribes (onSnapshot) to: student settings list, today's subjects for active student,
    Orion's points, Malachi's points
  - Returns live data + `setActiveStudent` for student switching
- `HomeTab.jsx`: complete rewrite — today's date, student pills, 3 summary cards
  (lessons done/total, Orion pts + cash, Malachi pts + cash), lesson list with
  tap-to-open-planner, quick action buttons (Open Planner + Award Points)
- `HomeTab.css`: complete rewrite with new styles (`.home-content`, `.home-summary-row`,
  `.home-lesson-list`, `.home-actions`)

### Fix 3 — Dark mode + sign-out on HomeTab
- Added `<header className="home-header">` to HomeTab:
  - Left: logo + "IRON & LIGHT / JOHNSON ACADEMY" (LIGHT in #e8c97a)
  - Right: dark mode toggle (🌙/☀️) + sign-out (🚪)
  - Uses `useDarkMode` from `hooks/useDarkMode.js`
  - Calls `signOut` from `@homeschool/shared`
  - Hidden on desktop (sidebar provides branding) via `@media (min-width: 768px)`

### Fix 4 — CLAUDE.md netlify.toml section updated
- Removed `/planner/*` and `/reward-tracker/*` redirect docs (both retired)
- Updated to reflect current 3-redirect config + no-base-directory note

### Feature — Desktop left sidebar
- `BottomNav.jsx`: added brand section (logo + name + tagline) and sign-out footer
  (both hidden on mobile, visible on desktop via CSS)
- `BottomNav.css`: full `@media (min-width: 768px)` sidebar — 200px fixed left,
  full viewport height, brand at top, tabs stacked vertically, sign-out + version at bottom
- `App.css`: desktop `.shell-content` → `margin-left: 200px; padding-bottom: 0`
- `App.css`: `.shell-content .day-strip` overrides revert the planner's desktop DayStrip
  sidebar mode when embedded in the shell (avoids two sidebars at left: 0)
- `App.css`: `.shell-content .planner-action-bar` corrected to `left: 200px; bottom: 0`

---

## What is currently incomplete / pending

1. **Chunk size warning**
   - JS bundle is ~635 KB (>500 KB). Expected with both tools merged.
   - Address with dynamic imports if load time becomes a concern.

2. **Import merge bug (calm-whistling-clock.md plan)**
   - Rob reported second PDF import with "Replace existing schedule" OFF still overwrites data.
   - Full diagnostic plan at `/root/.claude/plans/calm-whistling-clock.md`.
   - Next step: add console.logs to UploadSheet, PlannerLayout, useSubjects in
     `packages/dashboard/src/tools/planner/` (the shell copy, not the retired package).
   - Do NOT add logs to the retired `/planner/` package files.

3. **Planner desktop layout inside shell — partially resolved**
   - The planner's DayStrip desktop sidebar (fixed left: 0) was overriding the shell sidebar.
   - Fixed in App.css: `.shell-content .day-strip` reverts to sticky/horizontal mode.
   - The planner no longer shows its desktop card grid layout when in the shell (DayStrip
     isn't a sidebar, so the grid trigger was the DayStrip sidebar being present).
   - Planner subjects still show as a flex column on desktop. The grid layout
     (`repeat(auto-fill, minmax(340px, 1fr))`) only activates via the planner's own desktop
     CSS — it still applies (the override doesn't disable it). Verify in browser.

4. **HomeTab header on desktop**
   - `.home-header` is hidden on desktop (sidebar provides branding).
   - Sidebar sign-out is in BottomNav footer — works on all tabs on desktop.
   - HomeTab sign-out button only visible on mobile. This is correct.

5. **BottomNav bn-signout font-family bug**
   - `BottomNav.css` has `font-family` declared twice in `.bn-signout` (inherit + emoji).
   - Minor — doesn't affect function. Fix next session.

---

## What the next session should start with

1. Read CLAUDE.md + HANDOFF.md (standard)
2. Test desktop layout in browser — confirm: sidebar visible, content shifted right,
   planner DayStrip horizontal (not a sidebar), action bar at correct position
3. If import merge bug still reported by Rob: follow `calm-whistling-clock.md` plan
4. Fix the duplicate `font-family` in `.bn-signout`
5. Consider enabling planner card grid on desktop inside shell (subjects auto-fill grid)

---

## Decisions made this session (update CLAUDE.md)

### HomeTab architecture (add to CLAUDE.md)
```
packages/dashboard/src/
├── hooks/
│   └── useHomeSummary.js   # live Firestore: students, today's subjects, points
├── tabs/
│   └── HomeTab.jsx         # morning summary: date, student pills, 3 cards, lessons, actions
│   └── HomeTab.css         # morning summary styles
```

### Desktop sidebar (add to CLAUDE.md)
- BottomNav becomes a 200px left sidebar at ≥768px (background: #22252e always)
- Shell content gets `margin-left: 200px; padding-bottom: 0` at ≥768px
- Planner DayStrip desktop sidebar disabled inside shell — override in App.css
  forces it back to sticky/horizontal to avoid two sidebars
- HomeTab header hidden on desktop (`.home-header { display: none }` at ≥768px)

### CLAUDE.md tools status update needed
- dashboard → ✅ Shell complete — planner + rewards embedded, morning summary, desktop sidebar
