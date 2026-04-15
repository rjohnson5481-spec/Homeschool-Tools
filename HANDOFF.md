# HANDOFF — v0.22.2 (desktop CSS audit + CLAUDE.md sync)

## What was completed this session

### Task 1 — Desktop CSS audit and consolidation
Full audit of every `@media (min-width: 768px)` block across:
- `packages/dashboard/src/tools/planner/components/Header.css`
- `packages/dashboard/src/tools/planner/components/PlannerLayout.css`
- `packages/dashboard/src/tools/planner/components/DayStrip.css`
- `packages/dashboard/src/tools/planner/components/SubjectCard.css`
- `packages/dashboard/src/App.css`
- `packages/dashboard/src/components/BottomNav.css`

**Conflicts / dead rules found and removed:**

1. **DayStrip.css — entire desktop `@media` block (~145 lines) deleted.**
   It was built for the retired standalone-planner sidebar mode
   (`position: fixed; left: 0; width: 200px; flex-direction: column`) +
   a `.shell-content`-scoped revert block that undid all of it. All
   dead code; the planner only lives in the shell now. Mobile's base
   horizontal-pill layout works correctly at every width.

2. **App.css desktop block simplified** from 11 rule blocks to 3:
   - Removed `.shell-content .day-strip { ... position: sticky; top: 132px; flex-direction: row; background: var(--bg-card); border-radius: 12px; margin: 0 14px 14px; padding: 5px; gap: 3px; ... }` — most of that was reverting DayStrip's sidebar mode; with that mode gone, base already matches.
   - Removed `.shell-content .day-strip-students { display: none }` and `.shell-content .day-strip-full-name { display: none }` — only needed to counter the deleted sidebar block.
   - Removed `.shell-content .planner-body { margin-left: auto; margin-right: auto; max-width: none }` — PlannerLayout.css now owns the planner-body desktop rule directly.
   - Kept: `.shell-content { margin-left: 200px; padding-bottom: 0 }`, new `.shell-content .day-strip { position: static; top: auto }` (the day-title-clipping fix), and `.shell-content .planner-action-bar { left: 200px; right: 0; margin: 0; bottom: 0; max-width: none }`.

3. **PlannerLayout.css desktop block trimmed of dead rules:**
   - Removed `.planner-body { ... margin-left: 200px }` — App.css's `.shell-content .planner-body` (now deleted) was overriding this to `auto`; since both are gone, mobile's `margin-left: auto` correctly takes effect.
   - Removed `.planner-action-bar { left: 200px; max-width: none; margin: 0 }` — App.css's `.shell-content .planner-action-bar` is a strict superset.
   - Kept planner-only concerns: `.planner-body { margin-top: 0; max-width: none }`, `.planner-main` padding, `.planner-subjects` grid, `.planner-day-header*`, `.planner-day-add-btn { display: none }`, `.planner-week-nav-desktop*`, `.planner-action-btn*`.
   - Also reduced `.planner-main { padding-bottom }` from 156px (old mobile: action-bar + bottom-nav) to 100px (desktop has no bottom nav; only action-bar to clear).

**Where desktop rules live now (non-overlapping):**
- `App.css` → only shell-aware concerns (`.shell-content` offset, shell overrides for `.day-strip` and `.planner-action-bar`).
- `PlannerLayout.css` → only planner-internal desktop (body sizing, card grid, day header, week nav, action buttons).
- `Header.css` → single rule `.header { display: none }`.
- `DayStrip.css` → no desktop block.
- `SubjectCard.css` → no desktop block.
- `BottomNav.css` → the mobile-bar ↔ desktop-sidebar transition.

### Fix — Day title clipping
Root cause: `.shell-content .day-strip { top: 132px }` in App.css made
the day strip sticky at 132px from the viewport top. That 132px was
tuned for the mobile 132px fixed header. With the planner header hidden
on desktop, nothing is above the day strip and the 132px sticky offset
leaves 132px of empty space on the page; when the user scrolls, the
`.planner-main` content (including the day title) scrolled up into/behind
the sticky z-index-50 day strip — "partially hidden behind the day strip."

Fix: `.shell-content .day-strip { position: static; top: auto }` on desktop.
The shell already scrolls as a whole; the day strip just scrolls with it.
Mobile still uses sticky `top: 132px` because of the mobile fixed header.

### Task 2 — CLAUDE.md sync to v0.22.1 architecture
Surgical updates:
- **Repo structure**: dropped `packages/planner` and `packages/reward-tracker` (retired session 14); noted that they now live at `packages/dashboard/src/tools/{planner,reward-tracker}/`; documented the root workspaces list.
- **Deployment**: "Tools at /planner, /reward-tracker, etc." → shell at /, TE Extractor at /te-extractor/.
- **File structure — planner tool**: path prefix changed from `packages/planner/src/` to `packages/dashboard/src/tools/planner/`; noted the orphaned legacy `main.jsx`/`App.jsx`.
- **Desktop layout**: fully rewritten — `display: none` header, 200px shell sidebar, desktop week nav in content, day strip non-sticky, grid layout, action bar alignment.
- **Added "Where desktop rules live"** sub-section so the next session doesn't re-create cross-file conflicts.
- **Tools status**: all four tools now ✅; dashboard marked complete as app shell.
- **Dashboard app shell architecture**: updated to describe lifted `plannerStudent` state + `useSettings` at the shell level + both students/activeStudent passed to BottomNav; added desktop sidebar spec.
- **File structure — dashboard shell**: added `hooks/useHomeSummary.js`, `tools/planner/`, `tools/reward-tracker/`; updated tab descriptions (no more "migration-in-progress placeholder").
- **Migration plan (next session)**: renamed to "Migration — completed" with past-tense items.
- **Phase tracking — planner**: added session 16 + v0.22.0/0.22.1/0.22.2 entries.
- **Dark mode token rule**: added as its own block under Key decisions — `var(--text-primary)` not `var(--ink)` on cards; `var(--text-secondary)` not `var(--text-muted)` on headings; hardcoded `#22252e` is allowed on chrome.
- **Layout (Design System)**: stale 60/80/68px chrome description replaced with current 132px-mobile / 200px-desktop-sidebar layout.

### Version bump to v0.22.2
- `packages/dashboard/package.json`: 0.22.1 → 0.22.2
- `packages/shared/package.json`:    0.22.1 → 0.22.2
- `packages/te-extractor/package.json`: 0.22.1 → 0.22.2

Build verified clean at each step (`@homeschool/dashboard@0.22.2`,
`@homeschool/te-extractor@0.22.2`). Mobile layout completely untouched.

---

## What is currently incomplete / pending

1. **Browser smoke test** — key things to verify visually:
   - **Day title no longer clipped** when scrolling on desktop. Title stays in flow with the rest of `.planner-main`; day strip scrolls away with the page rather than sticking.
   - Mobile: day strip still sticks at `top: 132px` below the 132px mobile header.
   - Desktop week nav still sits flush above the day strip (one cohesive unit).
   - Card grid still fills content width on desktop with auto-fill 340px min.
   - Action bar still aligned to the 200px shell sidebar edge and viewport bottom.
   - Student selector in sidebar still only appears on Planner tab.

2. **Orphaned file** (inherited) — `packages/dashboard/src/tools/planner/App.jsx`
   + possibly `main.jsx` inside tools/planner and tools/reward-tracker are
   orphaned. Dead code, tree-shaken out. Safe to delete.

3. **Import merge bug** (inherited from session 15) —
   `calm-whistling-clock.md` plan at `/root/.claude/plans/`.

4. **BottomNav.css minor bug** (inherited) — `.bn-signout` has
   `font-family` declared twice. Harmless.

5. **Chunk size** — dashboard JS bundle ~640 KB. Known/expected.

---

## What the next session should start with

1. Read CLAUDE.md + HANDOFF.md (standard).
2. Browser smoke test v0.22.2 — verify day title no longer clips when
   scrolling, and that nothing else regressed from the CSS cleanup.
3. Delete orphaned `tools/planner/App.jsx` + `main.jsx` (and the reward
   tracker counterparts if present) once confirmed unused.
4. If import merge bug still repros: follow `calm-whistling-clock.md`.

---

## Key file locations (updated this session)

```
packages/dashboard/
├── package.json                                     # v0.22.2
├── src/
│   ├── App.css                                      # desktop block simplified (3 blocks)
│   └── tools/planner/components/
│       ├── DayStrip.css                             # desktop @media block removed
│       └── PlannerLayout.css                        # desktop block trimmed of dead rules
packages/shared/package.json                          # v0.22.2
packages/te-extractor/package.json                    # v0.22.2
CLAUDE.md                                             # synced to v0.22.1 architecture
```
