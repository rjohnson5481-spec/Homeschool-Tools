# HANDOFF — v0.22.6 unified Settings tab

## What was completed this session

Large session: built the unified Settings tab, rewired the sidebar, and
retired / disconnected the scattered dark-mode toggles + sign-out buttons.
Seven logical steps, six source commits + HANDOFF.

### Step 2 + 3 — `SettingsTab.jsx` + `SettingsTab.css` created
- `packages/dashboard/src/tabs/SettingsTab.jsx` (~230 lines, under the
  300 hard limit). Sections:
  - **Appearance** — a single row with the 🌙 icon + "Dark Mode" title +
    "Currently on/off" subtitle + a 44×26 toggle (gold when on,
    `var(--border)` when off). Uses the `colorMode` + `onToggleDarkMode`
    props passed in from `App.jsx`.
  - **Students** — reads from `useSettings(uid)`; one row per student
    with emoji avatar (`STUDENT_EMOJI = { Orion: '😎', Malachi: '🐼' }`,
    fallback `🧒`). Each row has an inline Edit button (opens an input
    in place) and a red `✕` Remove button. Remove opens a confirm row
    (`Remove <name>? [Remove] [Cancel]`). Guard: `canRemove = namedStudents.length > 1`
    — the last student cannot be deleted (no ✕ button rendered; the
    commitEdit path also refuses to delete the last named student).
    Bottom `+ Add Student` row appends an empty placeholder and enters
    edit mode on it (same pattern as the retired SettingsSheet).
  - **Planner** — two rows:
    - `Default Subjects` — expands inline into a sub-section with
      `.st-subjects-tabs` (per-student picker) + chip list of current
      subjects (each with a remove ✕) + `+ Add Subject` input. Uses
      `activeStudent / setActiveStudent / activeSubjects / saveSubjects`
      from `useSettings` (same logic as the retired SettingsSheet).
    - `School Year` — Coming Soon badge, no action.
  - **App** — two rows:
    - `Clear Cache` — exact same handler as the retired SettingsSheet
      (`caches.keys() → delete all → window.location.reload()` with a
      "Clearing…" state).
    - `Sign Out` — red text; calls `signOut()` from `@homeschool/shared`.
      Subtitle shows `user.email` when available.
  - **Version block** at the bottom: "Iron & Light Johnson Academy" +
    `v{pkg.version} · ironandlight.netlify.app` in centered muted text.
  - Desktop `≥768px`: two-column grid — left column = Appearance + Planner,
    right column = Students + App, version block spans full width below.
    Mobile = single column.
- `packages/dashboard/src/tabs/SettingsTab.css` (~285 lines). All tokens
  are Ink & Gold CSS vars (no hardcoded mode-specific colors). Class
  prefix `.st-*`. The single `@media (min-width: 768px)` block only
  changes `.st-tab` padding + `.st-grid` into a 1fr 1fr grid with 28px
  gap; mobile styles are unchanged at desktop width otherwise.

### Step 4 — Wired SettingsTab into `App.jsx`
- Added `import SettingsTab from './tabs/SettingsTab';`.
- Added the `activeTab === 'settings'` branch, passing
  `user`, `colorMode`, and `onToggleDarkMode` to `<SettingsTab>`.
- Dropped `colorMode` + `onToggleDarkMode` from the `<BottomNav>` props
  (the sidebar footer no longer owns them — Settings tab does).

### Step 5 — BottomNav: 6-tab nav, trimmed footer
- `packages/dashboard/src/components/BottomNav.jsx`:
  - Added `{ id: 'settings', icon: '⚙️', label: 'Settings' }` as the
    6th tab in `TABS`.
  - Dropped the `colorMode` / `onToggleDarkMode` props and the
    `.bn-footer-row` JSX block that hosted the mode toggle + sign-out.
  - Footer now renders just the version string.
  - Also removed the `signOut` import (no longer referenced).
- `packages/dashboard/src/components/BottomNav.css`:
  - Mobile `.bn-tab` now has `min-width: 0` + `padding: 6px 1px` (was
    `6px 2px`) so the 6th tab still shares width cleanly on narrow
    phones; `.bn-label` gets `overflow: hidden; text-overflow: ellipsis`
    so "TE Extractor" falls back to an ellipsis instead of overflowing
    the pill. Desktop `.bn-label` explicitly restores `overflow: visible`
    since sidebar rows have plenty of width.
  - Deleted the old `.bn-footer-row`, `.bn-mode-btn`, `.bn-signout`
    rules entirely. `.bn-footer` now centers the single `.bn-version`
    line.

### Step 6 — Removed scattered dark-mode + sign-out controls
- `packages/dashboard/src/tabs/HomeTab.jsx`:
  - Dropped the `signOut`, `useDarkMode` imports and the mode/toggle
    destructure.
  - Removed the `.home-header-actions` div (with its 🌙/🚪 buttons).
    The `home-header` now renders the brand-only strip on mobile; it's
    still `display: none` on desktop (sidebar owns branding).
  - `HomeTab.css` untouched — `.home-header-btn` etc. are dead
    selectors but harmless.
- `packages/dashboard/src/tools/reward-tracker/components/RewardHeader.jsx`:
  - Dropped `mode` + `onToggleDark` props and the `rh-mode-btn` button.
  - Added a matching right-side `rh-back-spacer` div so the centered
    brand stays centered now that the right button is gone.
- `packages/dashboard/src/tools/reward-tracker/components/RewardHeader.css`:
  - Deleted `.rh-mode-btn` + `:hover` rules.
  - `.rh-school-version` rule preserved (the `v0.21.2` span stays —
    historical text kept intact; out of scope to change).
- `packages/dashboard/src/tools/reward-tracker/components/RewardLayout.jsx`:
  - Dropped the `useDarkMode` import + call. `<RewardHeader>` and
    `<LogPage>` no longer receive `mode` / `onToggleDark`.
- `packages/dashboard/src/tools/reward-tracker/components/LogPage.jsx`:
  - Dropped `mode` / `onToggleDark` from props; `<RewardHeader>` now
    called with just `onBack`.

### Step 7 — Disconnected planner SettingsSheet
- `packages/dashboard/src/tools/planner/components/Header.jsx`:
  - Dropped the `onSettings` prop from the destructure + the `⚙️`
    settings button from the actions row. The other three icons
    (📅 Calendar, ⬆️ Import, 🚪 Sign out) are unchanged. The mobile
    planner header still has a sign-out button — the spec for this
    session said "the scattered dark mode toggles and sign-out
    buttons" live in HomeTab and RewardHeader; the planner header's
    Sign Out was not called out, so it stays.
- `packages/dashboard/src/tools/planner/components/PlannerLayout.jsx`:
  - Removed the `SettingsSheet` import.
  - Removed `showSettings` + `setShowSettings` from the destructured
    props.
  - Removed `onSettings={() => setShowSettings(true)}` from the
    `<Header>` call.
  - Removed the `{showSettings && <SettingsSheet ... />}` render block.
- `packages/dashboard/src/tools/planner/hooks/usePlannerUI.js`:
  - Dropped the `[showSettings, setShowSettings]` pair from state +
    return (no remaining readers after the PlannerLayout disconnect).
- `packages/dashboard/src/tools/planner/components/SettingsSheet.jsx`
  + `SettingsSheet.css` intentionally **left on disk** (per the spec,
  "do not delete it yet — just disconnect it"). Nothing imports them;
  Vite tree-shakes them out of the bundle.

### Version bump to v0.22.6
- `packages/dashboard/package.json`:    0.22.5 → 0.22.6
- `packages/shared/package.json`:       0.22.5 → 0.22.6
- `packages/te-extractor/package.json`: 0.22.5 → 0.22.6

Build verified clean at every commit
(`@homeschool/dashboard@0.22.6`, `@homeschool/te-extractor@0.22.6`).

---

## What is currently incomplete / pending

1. **Browser smoke test** — not run yet. Walk through:
   - **Mobile** bottom nav shows all 6 tabs without horizontal scroll
     ("TE Extractor" may ellipsis on narrow screens — intentional).
   - **Desktop** sidebar lists all 6 nav items; footer shows only the
     version (no mode toggle, no sign-out).
   - **Settings tab** on mobile: single column. On desktop: two
     columns with version below. Dark mode toggle flips `<html data-mode>`
     immediately and re-themes every open tab. Student Add / Edit / Remove
     all write to Firestore and the planner picks up the new list in
     real time via `useSettings`. Default Subjects sub-section per
     student works just like the retired SettingsSheet. Clear Cache
     clears caches + reloads. Sign Out signs out.
   - **HomeTab** still shows the mobile brand strip at the top but no
     right-side icon buttons. On desktop the home-header is hidden.
   - **Reward tracker** header shows brand centered with back-button
     balance on both sides, no 🌙 toggle.
   - **Planner** header still has 📅 ⬆️ 🚪 icons on mobile (no ⚙️).

2. **Dead source files** (kept on disk, tree-shaken from bundle):
   - `packages/dashboard/src/tools/planner/components/SettingsSheet.jsx`
   - `packages/dashboard/src/tools/planner/components/SettingsSheet.css`
   The spec said "do not delete it yet". Delete when Rob confirms.

3. **Dead CSS selectors** (cheap to leave):
   - `.home-header-btn`, `.home-header-actions` in HomeTab.css — the
     elements no longer render. Harmless.
   - `.header-btn ⚙️` paired styles in planner Header.css — same.

4. **Import merge bug** (inherited, still open) — see v0.22.3 HANDOFF.

5. **CLAUDE.md minor drift** (inherited) — still lists `planner.css`
   under `tools/planner/` in the file-structure section. Also now
   missing a "Settings tab" entry under the shell file structure.
   Non-critical documentation drift.

6. **Chunk size** — dashboard JS bundle ~640 KB. Known/expected.

---

## What the next session should start with

1. Read CLAUDE.md + HANDOFF.md (standard).
2. Browser smoke test v0.22.6 — the full checklist above.
3. Delete retired `SettingsSheet.jsx` + `.css` once Rob confirms the
   new Settings tab covers the gap.
4. Update CLAUDE.md: add Settings tab architecture (shell-owned
   `colorMode`, `useSettings` consumed by both PlannerTab and
   SettingsTab, 6-tab nav, unified clear-cache + sign-out + dark-mode).

---

## Key file locations (updated this session)

```
packages/dashboard/
├── package.json                                       # v0.22.6
├── src/
│   ├── App.jsx                                        # + SettingsTab branch; stopped passing colorMode to BottomNav
│   ├── components/
│   │   ├── BottomNav.jsx                              # 6 tabs; footer = version only; dropped signOut import
│   │   └── BottomNav.css                              # mobile 6-tab fit + ellipsis fallback; trimmed footer rules
│   ├── tabs/
│   │   ├── HomeTab.jsx                                # dropped mode/sign-out buttons; header = brand only on mobile
│   │   ├── SettingsTab.jsx                            # NEW — unified settings
│   │   └── SettingsTab.css                            # NEW
│   └── tools/
│       ├── planner/
│       │   ├── components/
│       │   │   ├── Header.jsx                         # dropped ⚙️ button + onSettings prop
│       │   │   └── PlannerLayout.jsx                  # dropped SettingsSheet import + render + ui props
│       │   └── hooks/usePlannerUI.js                  # dropped showSettings state
│       └── reward-tracker/components/
│           ├── RewardHeader.jsx                       # dropped mode toggle; symmetric right spacer
│           ├── RewardHeader.css                       # dropped .rh-mode-btn rules
│           ├── RewardLayout.jsx                       # dropped useDarkMode; header props trimmed
│           └── LogPage.jsx                            # dropped mode/onToggleDark props
Left on disk (intentionally disconnected, not deleted):
├── src/tools/planner/components/SettingsSheet.jsx
└── src/tools/planner/components/SettingsSheet.css
packages/shared/package.json                            # v0.22.6
packages/te-extractor/package.json                      # v0.22.6
```
