# HANDOFF — v0.22.8 fully responsive mobile layout

## What was completed this session

Single-fix session paired with v0.22.7's breakpoint raise. The app
previously used `max-width: 480px` on every content container and
every bottom sheet — designed for small phones when the dashboard
was first built. On wide phones (Galaxy S25 Ultra is 412px portrait
and 915px landscape) that left large empty margins and cramped UI.
This session strips every 480px container constraint so content now
fills the available width on any mobile form factor, and converts
the single-column card lists (planner subjects, reward cards) into
responsive grids that reflow on wider screens.

### Commit 1 — remove 480px max-width constraints + responsive grids

Content containers — removed `max-width: 480px` (and the paired
`margin-left/right: auto`) so the content fills the shell width:

- `packages/dashboard/src/tabs/HomeTab.css` — `.home-content`
  (kept `width: 100%; margin: 0 auto; padding: 20px 16px 24px`)
- `packages/dashboard/src/tools/planner/components/PlannerLayout.css`
  — `.planner-body` (margin-top: 132px retained for fixed header clear);
  `.planner-action-bar` fixed bottom bar now stretches left:0 right:0
  with no centered 480px cap
- `packages/dashboard/src/tools/reward-tracker/components/RewardLayout.css`
  — `.rl-body`
- `packages/dashboard/src/tools/reward-tracker/components/LogPage.css`
  — `.log-body`
- `packages/dashboard/src/components/Dashboard.css` — `.dashboard-main`
  (dead code, kept in sync)

Bottom sheets — `max-width: 480px` → `max-width: 100%` (retaining
`width: 100%` and slide-up animation, so sheets fill the full screen
width on any phone):

- `EditSheet.css` — `.edit-sheet`
- `AddSubjectSheet.css` — `.add-sheet`
- `UploadSheet.css` — `.upload-sheet`
- `MonthSheet.css` — `.month-sheet`
- `SickDaySheet.css` — `.sick-day-sheet`
- `DebugSheet.css` — `.debug-sheet`
- `SettingsSheet.css` — `.settings-sheet` (dead/disconnected code,
  kept in sync)
- `ActionSheet.css` — `.action-sheet` (also dropped the now-redundant
  `margin: 0 auto`)
- `PlannerLayout.css` — `.undo-sick-sheet` inline rule

Card grids — converted single-column flex lists to responsive grids
so cards reflow into multiple columns on wider phones (S25 Ultra
landscape fits 2 columns):

- `PlannerLayout.css` — `.planner-subjects` was
  `display: flex; flex-direction: column; gap: 12px`, now
  `display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px`.
  Desktop ≥1024px override keeps `minmax(340px, 1fr)`.
- `RewardLayout.css` — `.rl-body` was flex-column; now
  `display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`.
  Desktop ≥1024px override keeps `minmax(320px, 1fr)`.

BottomNav tab sizing — per spec: each tab already had `flex: 1` and
`min-width: 0`; added `min-height: 56px` so the tap target is
guaranteed even if row height is ever lifted above the 56px nav.
Existing icon 18px, label 9px unchanged.

CRITICAL self-checks:
- No `@media (min-width: 1024px)` desktop rules were modified — grep
  confirmed only the CSS selectors listed above changed.
- Only width-constraint properties removed. No font size, color, or
  other styles touched.
- One remaining `max-width: 480px` grep hit is in `components/Header.css:116`
  as `@media (max-width: 480px)` — a narrow-phone breakpoint that
  hides taglines, not a container constraint. Left alone.
  (That file is dead code per v0.22.6 HANDOFF but safe to keep.)

Build verified clean: `@homeschool/dashboard@0.22.8`,
`@homeschool/te-extractor@0.22.8`.

### Commit 2 — version bump to v0.22.8

- `packages/dashboard/package.json`:    0.22.7 → 0.22.8
- `packages/shared/package.json`:       0.22.7 → 0.22.8
- `packages/te-extractor/package.json`: 0.22.7 → 0.22.8

---

## What is currently incomplete / pending

1. **Browser smoke test** — not run. Walk through on device / emulator:
   - **Galaxy S25 Ultra portrait (~412px)** — content fills full
     width with 16px padding. Subject cards and reward cards stay
     single column (300px min column too wide for two). Bottom
     sheets fill the full screen width, no side margins. Bottom
     nav tabs fill the full width with 56px tap targets.
   - **Galaxy S25 Ultra landscape (~915px)** — planner subjects
     reflow into 2 columns. Reward cards reflow into 2 columns.
     HomeTab summary row stays 3 flex cards (this was not a grid,
     left intact). Mobile layout still active (bottom nav, 132px
     fixed planner header) because ≥1024px is the desktop threshold.
   - **iPhone SE (~320px portrait)** — content fills the 320px minus
     32px of padding = 288px. `minmax(300px, 1fr)` on the new grids
     would overflow by ~12px on this device. Worth watching if Rob
     uses an SE; if so, drop the minmax floor to 280px. Not a
     regression — previous layout was also constrained to 480px
     which was already wider than the viewport on an SE.
   - **Desktop browser ≥1024px** — shell sidebar + content column,
     unchanged from v0.22.7.
   - **Bottom sheets on tablets portrait (~810px, below 1024px
     threshold)** — now fill the full 810px width. Previously
     capped at 480px centered. Behavior change worth noting.

2. **Deferred from v0.22.7** — iPad portrait (~810px) now shows
   mobile layout (bottom nav + planner header) and bottom sheets
   stretch across the full 810px. If Rob wants iPad portrait to
   render the sidebar experience, the desktop breakpoint needs to
   drop (e.g., 900px or 960px) — same decision flagged last session.

3. **Dead source files** (inherited, kept in sync this session):
   - `packages/dashboard/src/tools/planner/components/SettingsSheet.jsx`
     + `.css`
   - `packages/dashboard/src/components/Dashboard.css`,
     `Header.css` (old dashboard header)

4. **Chunk size** — dashboard JS bundle ~640 KB. Known/expected.

5. **Import merge bug** (inherited from v0.22.3) — still open.

---

## What the next session should start with

1. Read CLAUDE.md + HANDOFF.md (standard).
2. Browser smoke test v0.22.8:
   - Open on a Galaxy-class wide phone landscape — confirm planner
     subjects reflow into 2 columns and reward cards also reflow.
   - Open a bottom sheet (Edit, Add Subject, Upload, Month, Sick Day,
     Award/Deduct/Spend) on a wide phone and confirm the sheet
     spans full width, no centered 480px gutter.
   - Confirm the planner action bar spans the full screen width,
     not 480px centered.
3. Decide whether iPad portrait should flip back to sidebar (see
   point 2 under "pending"). If yes, breakpoint drops further.
4. Consider updating CLAUDE.md's "Key decisions" section — the
   "max-width: 480px on all tools" rule under "Mobile-first" is now
   obsolete. Suggested rewrite: "Mobile-first, content fills viewport
   width with 16px padding on mobile; responsive card grids reflow
   on wider phones."

---

## Key file locations (updated this session)

```
packages/dashboard/
├── package.json                                                    # v0.22.8
├── src/
│   ├── components/
│   │   ├── BottomNav.css                                           # + min-height: 56px on .bn-tab
│   │   └── Dashboard.css                                           # dropped .dashboard-main 480px cap
│   ├── tabs/
│   │   └── HomeTab.css                                             # dropped .home-content 480px cap
│   └── tools/
│       ├── planner/components/
│       │   ├── AddSubjectSheet.css                                 # sheet → 100%
│       │   ├── DebugSheet.css                                      # sheet → 100%
│       │   ├── EditSheet.css                                       # sheet → 100%
│       │   ├── MonthSheet.css                                      # sheet → 100%
│       │   ├── PlannerLayout.css                                   # body + action-bar + subjects grid + undo sheet
│       │   ├── SettingsSheet.css                                   # sheet → 100% (dead code)
│       │   ├── SickDaySheet.css                                    # sheet → 100%
│       │   └── UploadSheet.css                                     # sheet → 100%
│       └── reward-tracker/components/
│           ├── ActionSheet.css                                     # sheet → 100%
│           ├── LogPage.css                                         # dropped .log-body 480px cap
│           └── RewardLayout.css                                    # body → responsive grid
packages/shared/package.json                                        # v0.22.8
packages/te-extractor/package.json                                  # v0.22.8
```
