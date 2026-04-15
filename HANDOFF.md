# HANDOFF — v0.22.7 desktop breakpoint raised to 1024px

## What was completed this session

Single-fix session. The desktop sidebar layout was triggering on wide
mobile phones (Galaxy S25 Ultra in landscape / some foldables) because
the breakpoint was set to 768px — wider than the widest phones sold
today. Raised the breakpoint to 1024px across every media query in the
dashboard so only actual tablets and desktop browsers get the sidebar
layout. Mobile bottom nav now stays active on every phone form factor.

### Commit 1 — breakpoint raised to 1024px

Replaced every `@media (min-width: 768px)` with `@media (min-width: 1024px)`
in the following CSS files. Each media query is a desktop layout switch —
verified by reading each file before editing. No non-breakpoint `768px`
values existed anywhere in the codebase. No `max-width: 767px` media
queries existed either.

Files edited (8 CSS files + 1 JSX comment + CLAUDE.md):
- `packages/dashboard/src/App.css` — line 35 shell offset + day-strip
  static + action-bar alignment
- `packages/dashboard/src/components/BottomNav.css` — line 75
  mobile bottom bar → 200px left sidebar
- `packages/dashboard/src/tabs/HomeTab.css` — line 281 home header
  hidden, full-width content, desktop button cluster (comment at
  line 279 also updated)
- `packages/dashboard/src/tabs/SettingsTab.css` — line 355 two-column
  grid
- `packages/dashboard/src/tools/planner/components/Header.css` —
  line 188 planner header hidden (comment at line 185 updated)
- `packages/dashboard/src/tools/planner/components/PlannerLayout.css`
  — line 287 `.planner-body` sizing, subjects grid, day header,
  desktop week nav, action bar buttons
- `packages/dashboard/src/tools/reward-tracker/components/RewardHeader.css`
  — line 104 header hidden (comment at line 100 updated)
- `packages/dashboard/src/tools/reward-tracker/components/RewardLayout.css`
  — line 20 full-width content + two-column grid (comment at
  line 17 updated)
- `packages/dashboard/src/tools/planner/components/PlannerLayout.jsx`
  — line 130 comment only (`≥768px` → `≥1024px`)

No JavaScript files use 768 as a numeric window-width check — grep
confirmed. The only JS reference was a comment (updated).

CLAUDE.md updates:
- `## Desktop layout (≥768px)` heading → `(≥1024px)`
- Four current-state descriptive references under that heading changed
  `≥768px` → `≥1024px`
- Authoritative line `Desktop breakpoint: 768px` → `1024px` with an
  explanatory parenthetical noting the Galaxy S25 Ultra reason
- "Dashboard — app shell architecture" section: `desktop (≥768px)` → `(≥1024px)`
- Desktop sidebar spec: `≥768px block` → `≥1024px block`
- "Layout (current, v0.22+)" section: `Desktop (≥768px)` → `(≥1024px)`
- Historical phase-tracking entries (v0.21.0 line 438, v0.22.0, etc.)
  left intact — those describe state at the time of that version and
  would misrepresent history if retroactively rewritten.

### Commit 2 — version bump to v0.22.7

- `packages/dashboard/package.json`:    0.22.6 → 0.22.7
- `packages/shared/package.json`:       0.22.6 → 0.22.7
- `packages/te-extractor/package.json`: 0.22.6 → 0.22.7

Build verified clean at both commits
(`@homeschool/dashboard@0.22.7`, `@homeschool/te-extractor@0.22.7`).

---

## What is currently incomplete / pending

1. **Browser smoke test** — not run. Walk through on device / emulator:
   - **Galaxy S25 Ultra (412×915 portrait, ~915×412 landscape)** —
     MUST show the mobile bottom nav in both orientations. Previously
     landscape (915w) tripped the 768px breakpoint and flipped to
     desktop sidebar mid-phone. Now the threshold is 1024px so no
     phone form factor trips it.
   - **iPad portrait (~810px)** — now sits below the 1024px threshold
     and will show mobile layout. This is a behavior change. If Rob
     wants iPad portrait to show the sidebar, the breakpoint needs
     another revisit (iPad landscape is ~1180px, still sidebar).
   - **iPad landscape (~1180px)** — sidebar, unchanged behavior.
   - **Desktop browser** — sidebar, unchanged behavior.
   - Any browser narrower than 1024px: bottom nav + planner 132px
     fixed header + full mobile planner layout.

2. **iPad portrait behavior change** — worth flagging to Rob. At 768px
   breakpoint, iPad portrait showed the sidebar layout. At 1024px it
   now shows the mobile layout (bottom nav + fixed planner header).
   If the family uses an iPad in portrait and relied on the sidebar
   experience, this is a regression we should either accept or reset
   the breakpoint to 900px or 960px — a middle ground that still
   excludes wide phones but includes iPad portrait.

3. **Dead source files** (inherited from v0.22.6, unchanged this session):
   - `packages/dashboard/src/tools/planner/components/SettingsSheet.jsx`
   - `packages/dashboard/src/tools/planner/components/SettingsSheet.css`

4. **Dead CSS selectors** (inherited, cheap to leave):
   - `.home-header-btn`, `.home-header-actions` in HomeTab.css
   - `.header-btn ⚙️` paired styles in planner Header.css

5. **Import merge bug** (inherited, still open) — see v0.22.3 HANDOFF.

6. **Chunk size** — dashboard JS bundle ~640 KB. Known/expected.

---

## What the next session should start with

1. Read CLAUDE.md + HANDOFF.md (standard).
2. Browser smoke test v0.22.7 on a Galaxy-class wide phone — confirm
   the mobile bottom nav is visible in landscape.
3. Decide the iPad portrait question (keep 1024px, drop to ~900px, or
   accept iPad portrait → mobile layout).
4. If the breakpoint moves again, redo the same sweep (8 CSS files +
   PlannerLayout.jsx comment + CLAUDE.md current-state references —
   the exact list above). Leave historical phase-tracking entries in
   CLAUDE.md alone.

---

## Key file locations (updated this session)

```
CLAUDE.md                                                          # breakpoint refs updated
packages/dashboard/
├── package.json                                                    # v0.22.7
├── src/
│   ├── App.css                                                     # @media 1024px
│   ├── components/BottomNav.css                                    # @media 1024px
│   ├── tabs/
│   │   ├── HomeTab.css                                             # @media 1024px + comment
│   │   └── SettingsTab.css                                         # @media 1024px
│   └── tools/
│       ├── planner/components/
│       │   ├── Header.css                                          # @media 1024px + comment
│       │   ├── PlannerLayout.css                                   # @media 1024px
│       │   └── PlannerLayout.jsx                                   # JSX comment 1024px
│       └── reward-tracker/components/
│           ├── RewardHeader.css                                    # @media 1024px + comment
│           └── RewardLayout.css                                    # @media 1024px + comment
packages/shared/package.json                                        # v0.22.7
packages/te-extractor/package.json                                  # v0.22.7
```
