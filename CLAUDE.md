# CLAUDE.md — Iron & Light Johnson Academy Homeschool Tools
Current version: v0.22.12

## What this repo is
A monorepo housing all digital tools for Iron & Light Johnson Academy.
This is a growing toolset — new tools will be added over time.
Every tool shares the same branding, design system, and Firebase project.

## The Johnson Family
- Rob (dad, homeschool teacher, MDiv student)
- Ashley (mom)
- Students: Orion and Malachi

## Repo structure
/
├── CLAUDE.md                  ← you are here, update after every session
├── HANDOFF.md                 ← overwrite at end of every session
├── scratch.js                 ← never committed, complex logic sandbox
├── netlify.toml               ← global Netlify config
├── packages/
│   ├── shared/                ← design system, Firebase init, auth, components
│   ├── dashboard/             ← unified app shell; planner + reward-tracker live in src/tools/
│   └── te-extractor/          ← vanilla HTML/CSS/JS tool, no React, served from dist/te-extractor/

Root `package.json` workspaces: ["packages/shared", "packages/dashboard", "packages/te-extractor"].
`packages/planner` and `packages/reward-tracker` were retired in session 14 —
both tools now live at `packages/dashboard/src/tools/{planner,reward-tracker}/`
and render inside the dashboard shell. No separate builds, no separate routes.

---

## Stack (all tools)
- React + Vite
- Firebase Auth — Google sign-in, single family account, shared across tools
- Firebase Firestore — each tool uses its own collection namespace
- Netlify — single site, all tools deployed together, auto-deploy on push to main
- vite-plugin-pwa — dashboard is the installable PWA entry point
- @dnd-kit/core — drag-and-drop only, never hand-roll it

## Locked dependencies — do not upgrade or swap without asking Rob
- firebase (version pinned in package.json)
- @dnd-kit/core (version pinned in package.json)
- vite-plugin-pwa (version pinned in package.json)
- react + react-dom (version pinned in package.json)
All package.json entries use exact versions — no ^ or ~ prefixes.

---

## Deployment
- Host: Netlify, connected to GitHub repo
- Primary URL: `homeschool.grasphislove.com` (custom domain, live as of 2026-04-15)
- Secondary URL: `ironandlight.netlify.app` (Netlify default, still works as fallback)
- App shell at root `/` — serves the dashboard (which contains all tools as tabs)
- TE Extractor at `/te-extractor/` (separate vanilla-JS build, links out from shell)
- No `/planner/` or `/reward-tracker/` routes — those tools are tabs inside the shell
- netlify.toml has exactly three redirects: /api/* → functions, /te-extractor/* → its index, /* → root index (SPA)
- NOT GitHub Pages

## netlify.toml
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

Order is required: /api/* and /te-extractor/* must precede /* or the
dashboard catch-all swallows them. Never reorder these blocks.
No base directory — build runs from repo root via workspaces.
command includes npm install so Netlify installs deps before building.
packages/planner and packages/reward-tracker were retired (session 14) —
their redirects are removed. Both tools now live inside the dashboard shell.

---

## Environment variables (Netlify dashboard only — never in code)
- ANTHROPIC_API_KEY — Netlify Functions only (parse-schedule), never client-side
- VITE_ANTHROPIC_API_KEY — TE Extractor only (intentional exception — see below)
- VITE_FIREBASE_API_KEY 
- VITE_FIREBASE_AUTH_DOMAIN 
- VITE_FIREBASE_PROJECT_ID 
- VITE_FIREBASE_APP_ID 

## Anthropic API pattern
All Anthropic calls go through Netlify Functions — with one intentional exception (see below).
Current functions:
- netlify/functions/parse-schedule.js (planner PDF import)
  Client calls: POST /api/parse-schedule with { file: base64, mediaType }
  Returns: application/json { student, weekId, days }
Function calls Anthropic API using server-side ANTHROPIC_API_KEY
Model: claude-sonnet-4-20250514

## TE Extractor — intentional exception to API key rule
The TE Extractor calls api.anthropic.com directly from the client
using VITE_ANTHROPIC_API_KEY injected at build time.
This is intentional — the tool is family-internal, behind Google Auth,
and will never be public facing. The Netlify Function proxy caused
gateway timeouts that could not be resolved within Netlify Pro limits.
Do not revert this to a Netlify Function without Rob's explicit instruction.

---

## Firestore data model
/users/{uid}/weeks/{weekId}/students/{studentName}/days/{0-4}/subjects/{subjectName}
  → { lesson: string, note: string, done: boolean, flag: boolean }

/users/{uid}/sickDays/{dateString}
  → { student: string, date: string, subjectsShifted: string[] }

/users/{uid}/settings/students
  → { names: string[] }

/users/{uid}/subjectPresets/{studentName}
  → { subjects: string[] }
  Note: stores per-student default subject presets shown in Settings sheet.
  Path uses subjectPresets (not settings/defaultSubjects) for valid 4-segment Firestore doc path.

weekId / dateString format: "YYYY-MM-DD" (weekId = Monday of that week)
Always normalize external weekId strings (e.g., from AI parse results) via mondayWeekId()
in constants/days.js before any Firestore writes. new Date('YYYY-MM-DD') parses as UTC
midnight — use new Date(y, m-1, d) (local date) inside mondayWeekId to avoid timezone shift.

Subjects are implicit — a subject exists on a given day only when its
document exists. No separate subject list document. Querying all subjects
for a day = simple collection read of .../days/{dayIndex}/subjects.

dayIndex: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri

sickDays collection: one document per calendar date that was marked sick.
Filtered client-side by current week dates — collection is small (~360 docs/year max).

## Reward Tracker — Firestore data model
/users/{uid}/rewardTracker/{studentName}
  → { points: number }

/users/{uid}/rewardTracker/{studentName}/log/{docId}
  → { type: 'award' | 'deduct' | 'spend', points: number, note: string, createdAt: serverTimestamp }

Note: path is `rewardTracker/{studentName}` with NO `students/` segment in
between. A document path must have an even number of segments; adding
`students/` would have made it odd. This is the v0.21.2 path-segment fix —
do not "normalize" it to match the planner's `weeks/{weekId}/students/{name}` shape.

Initial seed: Orion 50 pts, Malachi 60 pts. Seeding guarded by localStorage flag
`rewardTracker_seeded_{uid}` — only runs once per browser on first visit after auth.
Cash value: 15 pts = $1.00 (floor division). Next $1 threshold = next multiple of 15 above balance.

---

## Orphaned Firestore data (do not migrate — manual cleanup only)
Old paths from before the per-day redesign are still present in Firestore
but are no longer read or written by the app:
  /users/{uid}/subjectLists/{studentName}  → { subjects: string[] }
  /users/{uid}/weeks/{weekId}/students/{studentName}/subjects/{subjectName}/days/{0-4}
These can be manually deleted from the Firebase console. No migration script needed.

---

## File structure — planner tool
Planner now lives inside the dashboard shell. The shell's PlannerTab
(`packages/dashboard/src/tabs/PlannerTab.jsx`) is the entry point and
wires the planner hooks into PlannerLayout. The legacy `main.jsx` +
`App.jsx` + `planner.css` in `tools/planner/` were deleted in v0.22.4.

packages/dashboard/src/tools/planner/
├── firebase/
│   ├── planner.js               # all Firestore reads/writes
│   └── settings.js              # read/write for settings students + subject presets
│   # NO init.js or auth.js here — import db/auth/useAuth from @homeschool/shared
├── hooks/
│   ├── useWeek.js               # week navigation state
│   ├── useSubjects.js           # subject list + day data subscriptions
│   ├── usePdfImport.js          # file upload + Netlify Function call
│   ├── usePlannerUI.js          # local UI state (sheet-open flags, editTarget, day)
│   ├── useDarkMode.js           # dark mode toggle (legacy — shell also has its own)
│   └── useSettings.js           # students list + per-student subjects from Firestore
├── components/
│   ├── PlannerLayout.jsx        # full page layout, all sheets, toggle handlers
│   ├── PlannerLayout.css        # layout shell styles
│   ├── UndoSickSheet.css        # undo sick day confirmation sheet styles (99 lines)
│   ├── Header.jsx               # 3-row 132px fixed header; students from Firestore
│   ├── Header.css               # header styles
│   ├── DayStrip.jsx             # sticky day tab selector
│   ├── DayStrip.css             # day strip styles
│   ├── SubjectCard.jsx          # lesson card with done/flag toggles, large checkbox
│   ├── SubjectCard.css          # card styles
│   ├── EditSheet.jsx            # bottom sheet: lesson/note editor
│   ├── EditSheet.css            # edit sheet styles
│   ├── UploadSheet.jsx          # PDF import: picker → spinner → result
│   ├── UploadSheet.css          # upload sheet styles
│   ├── UploadResult.css         # parsed result preview + view log styles (89 lines)
│   ├── AddSubjectSheet.jsx      # batch add: day pills + student pills + summary
│   ├── AddSubjectSheet.css      # add sheet styles
│   ├── AddSubjectSheetChrome.css  # sheet overlay/panel/header/confirm styles (113 lines)
│   ├── AddSubjectDayPicker.css  # day pills + per-day detail styles (87 lines)
│   ├── MonthSheet.jsx           # calendar bottom sheet, week jump
│   ├── MonthSheet.css           # month sheet styles
│   ├── SickDaySheet.jsx         # sick day checklist, cascade shift confirmation
│   ├── SickDaySheet.css         # sick day sheet styles
│   ├── DebugSheet.jsx           # PDF import log viewer
│   └── DebugSheet.css           # debug sheet styles
└── constants/
    ├── subjects.js              # SUBJECT_PRESETS array
    ├── days.js                  # DAY_NAMES, DAY_SHORT, date helpers, mondayWeekId
    ├── months.js                # MONTH_NAMES, getCalendarGrid
    ├── routes.js                # ROUTES object
    └── firestore.js             # Firestore path builder functions

## Planner-specific layout decisions
- Header is 3 rows: Row 1 (48px) = logo + brand + 4 icon buttons;
  Row 2 (~52px) = week navigation centered; Row 3 (32px) = student selector pills.
  Total: 132px.
- planner-body margin-top: 132px to clear the fixed header
- DayStrip is sticky at top: 132px, z-index: 50
- All bottom sheets use slide-up animation from translateY(100%)
- Each sheet has its own overlay class (not shared) to avoid CSS conflicts
- safe-area-inset-bottom applied to all sheets for iPhone home bar

## Mobile layout — base styles
- Mobile-first. Content fills the full viewport width with 16px horizontal padding.
- No `max-width: 480px` anywhere — removed in v0.22.8. Bottom sheets also use `max-width: 100%`.
- `.planner-subjects` and `.rl-body` use a responsive grid
  `repeat(auto-fill, minmax(300px, 1fr))` so subject cards / student cards
  reflow to 2 columns on wide phones (Galaxy S25 Ultra landscape ~915px).
- Bottom nav height: 56px base (iPhone SE / small phones below 400px).
- Large phone scaling: `@media (min-width: 400px) and (max-width: 1023px)` — added in
  v0.22.9 to give wide phones (Galaxy S25 Ultra 412px, Pixel 8 Pro etc.) a
  native-app feel. Inside this band: bottom nav grows to 68px, nav icon 18→24px,
  nav label 9→12px; planner header grows to ~140px; all sheet text inputs are
  forced to 16px to suppress iOS Safari auto-zoom on focus. Desktop (≥1024px)
  is explicitly unaffected — the query is bounded at 1023px max.
- Three-tier responsive layout (small / medium / large phone with distinct
  typography scales) is deferred to Phase 4.

## Responsive breakpoints (canonical)
- `<400px` — small phone base (iPhone SE, iPhone 13 mini). Compact nav 56px, base font sizes.
- `400–1023px` — large phone (Galaxy S25 Ultra, Pixel 8 Pro, iPhone 15 Pro Max). Scaled-up fonts/spacing/nav, still mobile shell.
- `≥1024px` — desktop (iPad Pro landscape, laptop, desktop). 200px fixed sidebar, shell content offset.
- iPad portrait (~810px) currently falls into the large-phone band (mobile shell with bottom nav). Carry-over decision — see HANDOFF history.

---

## Desktop layout (≥1024px) — all rules are additive media queries; mobile is UNCHANGED
Desktop = shell sidebar at left + planner content column to the right.

- Planner Header: `display: none` at ≥1024px. Shell sidebar provides branding, nav, sign-out, and a Student selector when the Planner tab is active.
- Shell `<BottomNav>` flips to a 200px fixed left sidebar at ≥1024px (`#22252e`, gold active state, vertical tab list). Student selector renders only when `activeTab === 'planner'` and hides on all other tabs.
- `.shell-content { margin-left: 200px; padding-bottom: 0 }` at ≥1024px — clears the sidebar.
- Desktop week nav lives inside `.planner-body` as `.planner-week-nav-desktop` (JSX, not in Header) — sits above the DayStrip. Gold chevrons, ink label.
- `.day-strip` is `position: static` in the shell at ≥1024px — sticky behavior is dropped on desktop because the shell scrolls as a whole and a sticky strip would clip the day title scrolling beneath it. Mobile stays sticky at `top: 132px` for the fixed header.
- `.planner-body` on desktop: `margin-top: 0; max-width: none;` (mobile margin-left/right: auto centers inside shell content).
- `.planner-subjects`: grid `repeat(auto-fill, minmax(340px, 1fr))`, gap 14px.
- `.planner-action-bar` on desktop: `left: 200px; right: 0; bottom: 0; max-width: none; margin: 0` (set in App.css so the planner layer stays sidebar-unaware).
- Desktop-only day header (.planner-day-header) reveals day title + subject count. The inline "+ Add" is `display: none` on desktop (redundant with the bottom dashed "+ Add Subject").
- Desktop breakpoint: 1024px. Never add desktop-only JSX — CSS media queries only. (Raised from 768px in v0.22.7 — the 768px breakpoint was triggering the desktop sidebar on wide mobile phones like the Galaxy S25 Ultra.)

### Where desktop rules live (avoid re-creating conflicts)
- `App.css` @media → shell-aware concerns only: `.shell-content` offset, `.shell-content .day-strip` non-sticky, `.shell-content .planner-action-bar` alignment. Anything referencing the 200px sidebar or the `.shell-content` scope lives here.
- `PlannerLayout.css` @media → planner-only: `.planner-body` sizing, `.planner-main` padding, `.planner-subjects` grid, `.planner-day-header*`, `.planner-day-add-btn { display:none }`, `.planner-week-nav-desktop`, `.planner-week-nav-btn`, `.planner-action-btn*`.
- `Header.css` @media → single rule `.header { display: none }`.
- `DayStrip.css` → no @media. Mobile horizontal pill layout is correct at every width; shell-awareness is handled in App.css.
- `SubjectCard.css` → no @media. Card geometry is intrinsic; the grid in PlannerLayout drives multi-column at desktop.
- `BottomNav.css` @media → mobile-bottom-bar → desktop-left-sidebar transition, brand / student / footer sections.

## All Day Event — data model
- Stored as `allday` key in the existing per-day subjects collection.
  Path: /users/{uid}/weeks/{weekId}/students/{student}/days/{dayIndex}/subjects/allday
  Fields: { lesson: eventName, note: eventNote, done: false, flag: false }
- `hasAllDayEvent(subjects)` and `getAllDayEvent(subjects)` helpers in firebase/planner.js.
- `subjects` (Object.keys(dayData)) includes `allday` — always filter it from regular
  subject lists using `.filter(s => s !== 'allday')`.
- SubjectCard renders a full-width #22252e banner when subject === 'allday'.
- EditSheet hides Done/Flag toggles and shows 'All Day Event' title when subject === 'allday'.
- AddSubjectSheet shows '+ All Day Event' at top; if one exists, shows 'Edit All Day Event ›'.
- IMPORTANT: `__allday__` (double-underscore) is rejected by Firestore as a reserved ID.
  Key was renamed from `__allday__` to `allday` in v0.21.2.

---

## File size rules — enforce strictly
- Hard limit: 300 lines per source file (JSX / JS / CSS)
- CLAUDE.md is explicitly exempt — it is a reference document, not a code file.
  Keep it as long as it needs to be; the value is completeness, not brevity.
- Target: under 200 lines per source file
- One responsibility per file — if you need "and" to describe what
  a file does, split it
- Components never contain business logic — extract to hooks/
- Firebase calls never live in components — extract to firebase/
- If a file approaches 250 lines, stop and split before continuing
- Never combine multiple components in one file

All CSS files in packages/dashboard/src/ are currently under
300 lines. The split was completed across v0.22.11 and v0.22.12.

---

## Constants rule
All string literals, Firestore path builders, day labels, and subject
lists live in constants/. Never hardcode these values in components
or hooks. If it's used in more than one place, it belongs in constants/.

---

## Complex logic rule
Any non-trivial logic gets prototyped in scratch.js first.
Test it in isolation before integrating into a component or hook.
scratch.js is never committed to the repo.

---

## Build order — always follow this
1. Read packages/shared before building anything — use what exists
2. Never duplicate branding, tokens, Firebase init, or auth
3. Firebase + Auth layer before any UI
4. Firestore read/write layer before components
5. Netlify Function for any Anthropic API call before import UI
6. PWA manifest + service worker before other config
7. Constants files before any component that needs them
8. Data model confirmed working before adding features
9. Stop and confirm with Rob before starting a new phase or new tool
10. When adding a new tool, add it to the dashboard first

---

## Session discipline
- Maximum 3 files changed per prompt — if more are needed, break into steps
- Always read the relevant file before editing it
- Never assume file contents — always read first
- Do not build and debug in the same prompt — keep them separate
- Never work on top of already-broken code — revert and restart clean
- New feature = commit the current working state first

## Handling complex features
- Prototype non-trivial logic in scratch.js before integrating
- Write a plain English description of what a function should do
  and what would break it before writing the code
- Never work out complex logic inside a component being built simultaneously

## End of every session — required
Before closing, do both of these:
1. Update CLAUDE.md with any decisions made this session not already documented
2. Overwrite HANDOFF.md with:
   - What was completed this session
   - What is currently broken or incomplete
   - What the next session should start with
   - Any decisions that still need to be added to CLAUDE.md

## Start of every session — required
1. Read CLAUDE.md in full
2. Read HANDOFF.md
3. Confirm with Rob: what are we building today?
4. Identify which files will be touched before writing any code

---
## Tools status (v0.22.12)
- shared            → ✅ Complete — tokens, fonts, Firebase init, auth hook
- dashboard         → ✅ Complete — unified app shell at v0.22.12; mobile bottom nav (56/68px) / desktop 200px left sidebar at ≥1024px; 6 tabs including unified Settings; shared dark-mode + student state lifted to App.jsx
- planner           → ✅ Complete — integrated into shell at `packages/dashboard/src/tools/planner/`; batch add (day pills + student pills), large done checkbox, desktop card grid, PDF import via Anthropic Netlify Function
- reward-tracker    → ✅ Complete — integrated into shell at `packages/dashboard/src/tools/reward-tracker/`; dark mode, award/deduct/spend sheets, cash conversion (15 pts = $1.00)
- te-extractor      → ✅ Complete at v0.20.4 — vanilla HTML/CSS/JS, deployed at /te-extractor, links out from shell (React rewrite deferred to Phase 3)
- academic-records  → 🔒 Phase 2 — "Coming Soon" placeholder tab in shell
- school-year / ND compliance → 🔒 Phase 3

## Dashboard — app shell architecture
The dashboard is the unified app shell. Planner and reward tracker are
integrated as tabs. Navigation is a bottom bar on mobile and a 200px
fixed left sidebar on desktop (≥1024px).

### Shell layout — state lifted to App.jsx
App.jsx is intentionally thin. It owns:
- `activeTab` (string, default `'home'`) — current shell tab
- `plannerStudent` (string, default `'Orion'`) — shared between PlannerTab and the sidebar student selector
- `colorMode` + `toggleDarkMode` (via `useDarkMode`) — shared dark-mode state; SettingsTab toggles, every tab re-themes automatically through `<html data-mode>`
- `students` + `subjectsByStudent` — from `useSettings(uid, plannerStudent)` at the shell level; passed down to PlannerTab (for AddSubjectSheet presets + Header) AND to BottomNav (for the desktop sidebar's Student section)

After auth: renders `<div class="app-shell">` → `<div class="shell-content">` + `<BottomNav>`.
- `.app-shell`: min-height 100vh, flex column
- `.shell-content`: flex 1; padding-bottom `calc(56px + safe-area)` on mobile to clear the fixed bottom nav; `calc(68px + safe-area)` at ≥400px for the taller large-phone nav; `margin-left: 200px; padding-bottom: 0` at ≥1024px
- `<BottomNav>` is `position: fixed; bottom: 0; z-index: 100` on mobile; at ≥1024px it flips to `top: 0; left: 0; width: 200px; height: 100vh; flex-direction: column;` — a dark sidebar

### Bottom nav / sidebar tabs (in order — 6 tabs as of v0.22.6)
1. `home` → HomeTab (morning summary dashboard — today's date, student pills, 3 summary cards for lessons/Orion pts/Malachi pts, tappable lesson list, quick actions). Icon: 🏠
2. `planner` → PlannerTab. Icon: 📅
3. `rewards` → RewardsTab. Icon: 🏅
4. `te` → external full-page navigate: `window.location.href = '/te-extractor/'` (never migrates to React — vanilla JS tool). Icon: 📄
5. `academic` → AcademicRecordsTab (Phase 2 placeholder). Icon: 🎓
6. `settings` → SettingsTab (unified: dark mode, students, default subjects, clear cache, sign out). Icon: ⚙️

### Desktop sidebar spec
- Width 200px, fixed left, full viewport height, `#22252e` background (hardcoded — never changes with dark-mode toggle, consistent with all header-like surfaces).
- Brand block at top: logo + "IRON & LIGHT / JOHNSON ACADEMY" + tagline — rendered on desktop only via `.bn-brand { display: none }` mobile base.
- Tab list: vertical rows (icon + label). Active tab uses `rgba(201,168,76,0.12)` background + gold-light icon/label + `rgba(201,168,76,0.18)` border.
- Student section: `.bn-students` renders only when `activeTab === 'planner' && students.length > 0` (JSX gate) and only on desktop via CSS (`display: none` base, `display: block` inside the ≥1024px block). Label "STUDENT" in small caps / 9px / white-35%. Student pills full-width, active uses gold-pale bg + gold-light text.
- Footer: sign-out button + `v{pkg.version}` — desktop only.

### File structure — dashboard shell
packages/dashboard/src/
├── main.jsx                 # app entry, seeds color-mode, mounts App
├── App.jsx                  # auth + activeTab + plannerStudent + colorMode + useSettings
├── App.css                  # resets + .app-shell + .shell-content + desktop shell overrides + 400–1023 shell offset
├── components/
│   ├── BottomNav.jsx        # 6-tab persistent nav (bottom bar / desktop sidebar); brand + student selector + footer desktop-only
│   ├── BottomNav.css        # nav styles (mobile bottom bar, 400–1023 taller scaling, ≥1024 sidebar)
│   ├── SignIn.jsx           # Google sign-in screen
│   └── SignIn.css
├── tabs/
│   ├── HomeTab.jsx          # morning summary dashboard + mobile brand strip (hidden on desktop)
│   ├── HomeTab.css          # home tab styles
│   ├── HomeHeader.css       # brand header styles, mobile only (34 lines)
│   ├── PlannerTab.jsx       # wires planner hooks + lifted student props into PlannerLayout
│   ├── RewardsTab.jsx       # wires reward tracker hooks into RewardLayout
│   ├── AcademicRecordsTab.jsx # Coming Soon placeholder (Phase 2)
│   ├── PlaceholderTab.css   # shared styles for coming-soon tabs
│   ├── SettingsTab.jsx      # unified settings: Appearance / Students / Planner / App / Sign Out / version
│   ├── SettingsTab.css      # settings tab styles
│   ├── SettingsRow.css      # settings row + icon + body + actions styles (130 lines)
│   └── SettingsSubjects.css # default subjects sub-section styles (63 lines)
├── hooks/
│   ├── useDarkMode.js       # dark mode toggle (color-mode localStorage key, html data-mode)
│   └── useHomeSummary.js    # live Firestore — students, today's subjects for active student, both students' points
├── constants/
│   ├── tools.js             # TOOLS array (legacy, mostly unused)
│   └── school.js            # school name constants
└── tools/
    ├── planner/             # full planner tool (components, hooks, firebase, constants)
    └── reward-tracker/      # full reward tracker tool (components, hooks, firebase)

### Bottom nav design rules
- Background: always `#22252e` — never changes in dark mode (same as all headers)
- 6 equal-width tabs, `flex: 1`, `min-width: 0` so long labels (e.g. "TE Extractor") ellipsis on narrow phones
- Heights (responsive):
  - base (<400px):       56px; icon 18px; label 9px; tab min-height 56px
  - ≥400px and ≤1023px: 68px; icon 24px; label 12px; tab min-height 68px
  - ≥1024px:             collapses to 200px left sidebar (height: 100vh)
- Active tab: icon + label `#e8c97a`, icon pill `rgba(201,168,76,0.15)` background
- Inactive tab: `rgba(255,255,255,0.45)`
- No border-top (dark background is anchor enough)
- Safe area inset bottom for iPhone home bar
- The large-phone scaling media query is bounded `(min-width:400px) and (max-width:1023px)`
  so it does NOT leak into the desktop sidebar layout

### Migration — completed
- Planner: embedded inside PlannerTab — /planner/ separate build removed.
- Reward Tracker: embedded inside RewardsTab — /reward-tracker/ separate build removed.
- HomeTab: replaced tool card grid with morning summary dashboard.
- TE Extractor stays external — vanilla JS, cannot be migrated into React shell.

## Phase tracking — planner
Phase 1 — COMPLETE:
  ✓ 1. Firebase/Firestore layer (firebase/planner.js)
  ✓ 2. Netlify Function — parse-schedule (BJU Homeschool Hub "Print By Day" format)
  ✓ 3. Config files (package.json, vite.config.js, index.html)
  ✓ 4. Hooks (useWeek, useSubjects, usePdfImport, usePlannerUI)
  ✓ 5. App entry (main.jsx, App.jsx, planner.css)
  ✓ 6. PlannerLayout + Header + DayStrip
  ✓ 7. SubjectCard + EditSheet
  ✓ 8. AddSubjectSheet + UploadSheet
  ✓ 9. Deploy config (netlify.toml redirects, dashboard outDir)
  ✓ 10. Bug fix: addSubject no longer pre-populates future days
  ✓ 11. Data model redesign: per-day implicit subjects (3 batches, main)
  ✓ 12. Bug fix: PDF import uses parsedData.weekId/student (importCell + jumpToWeek)
  ✓ 13. Bug fix: subject card lesson clamped to 3 lines, note to 2 lines
  ✓ 14. Feature: Delete Week — clears all cells for current student+week
  ✓ 15. Feature: Month picker — calendar bottom sheet, tapping weekday jumps to week
  ✓ 16. Quick fixes: flag card red, note dot indicator, placeholder text, calendar emoji
  ✓ 17. Feature: Upload sheet — rich parse preview, wipe toggle, success state, debug log
  ✓ 18. Feature: Sick Day — cascade shift algorithm, Firestore markers, red dot on DayStrip
  ✓ 19. Fix: flag card lighter red tint + red flag badge (was gold)
  ✓ 20. Fix: upload preview grouped by day with bold day headers
  ✓ 21. Fix: debug log enhanced — file size, response time, raw preview, subjects, per-cell writes
  ✓ 22. Fix: sick day cascade within-week only; Friday overflow warning in SickDaySheet
  ✓ 23. Visual Polish Session 1 — Ink & Gold tokens, header redesign, DayStrip floating pill, logo wired
  ✓ 24. Visual Polish Session 2 — SubjectCard, all sheets, action bar, empty state, dashboard, month picker
  ✓ 25. Settings sheet — dark mode toggle, students list, default subjects, coming-soon sections, clear cache
  ✓ 26. v0.19.0 polish — PWA theme_color #22252e; School Year & Compliance merged coming-soon;
         student delete with inline confirmation; Header students from Firestore;
         AddSubjectSheet quick-picks from per-student Firestore presets
  ✓ 27. v0.21.0 — All Day Event (allday key); desktop responsive layout ≥768px
         (single-row header, 200px DayStrip sidebar, auto-fill card grid, action bar shift)
  ✓ 28. v0.21.1 — 11-fix polish pass: All Day Event banner no longer flashes on save;
         sidebar always #22252e dark; header logo 42px + larger fonts at desktop;
         card grid gap:14px; desktop day-title header with subject count;
         header icons right-aligned + emoji font; done-pill replaced with tap-to-edit hint;
         desktop action bar Import pushed right
  ✓ 29. v0.21.2 — Fix 1: renamed allday key (was __allday__, rejected by Firestore);
         Fix 2A: weekId normalized to Monday in handleApplySchedule (mondayWeekId helper);
         Fix 2B: one-time migration from two bad Tuesday weekIds (2026-04-07, 2026-04-14)
         to correct Monday weekIds without overwriting good data
  ✓ 30. Session 16 — SubjectCard three-column layout (large 36px checkbox left,
         content center, 28px flag right; checkbox/flag stopPropagation);
         dark-mode contrast fixes (.edit-sheet-label / .add-sheet-section-label
         use var(--text-secondary); subject name uses var(--text-primary));
         AddSubjectSheet rewritten as multi-day/multi-student batch add with
         day pills + student pills + summary + confirm; batch handler accepts
         lessonDetails { [dayIndex]: text } as third arg to pre-fill cells.
  ✓ 31. v0.22.0 — Desktop shell polish: planner header hidden (.header display:none);
         desktop week nav moved into content (.planner-week-nav-desktop in .planner-body);
         student state lifted to App.jsx; desktop sidebar hosts Student selector
         (BottomNav .bn-students) shown only when activeTab === 'planner';
         .planner-day-add-btn hidden on desktop (redundant with bottom dashed button).
  ✓ 32. v0.22.1 — Tightened week-nav padding to 8px 28px 0 so the day strip
         sits flush under the week nav (cohesive unit).
  ✓ 33. v0.22.2 — Desktop CSS audit + consolidation:
         DayStrip.css desktop @media block deleted entirely (mobile horizontal
         pill layout is correct at every width); App.css desktop block pared
         to shell-aware rules only (.shell-content offset, day-strip
         position:static, action-bar alignment); PlannerLayout.css desktop
         block trimmed of dead rules that App.css already owned.
         Day-title-clipping bug fixed by making the day strip non-sticky on
         desktop (was sticky at top:132px, which clipped content scrolling
         beneath it once the mobile header no longer existed).

Phase 2 (do not build yet):
  - Auto-roll flagged lessons to next week
  - Week history browser
  - Copy last week as template
  - Export week as PDF

---

## Phase roadmap — project-wide
### Phase 1 — ✅ COMPLETE at v0.22.9
  - Unified app shell with 6-tab bottom nav (mobile) + 200px left sidebar (≥1024px desktop)
  - Planner: per-day implicit subjects, PDF import, sick day cascade, month picker,
    batch add (day pills + student pills), large done checkbox, All Day Event
  - Reward Tracker: award / deduct / spend sheets, log, cash conversion (15 pts = $1)
  - HomeTab: morning summary with lessons + points for both students
  - Unified Settings tab (dark mode, students, default subjects, clear cache, sign out)
  - Custom domain `homeschool.grasphislove.com`
  - Responsive: 400–1023 large-phone scaling band, 1024 desktop breakpoint
  - TE Extractor: vanilla JS, served at /te-extractor/, links out from shell

### Phase 2 — 🔒 NOT STARTED
  - Academic Records tab (transcripts, cumulative view)
  - Planner Phase 2 items (auto-roll flagged lessons, week history, copy last week, export PDF)

### Phase 3 — 🔒 NOT STARTED
  - School Year + ND compliance tracking
  - TE Extractor React rewrite (migrate into shell, keep same Anthropic API exception)

### Phase 4 — 🔒 NOT STARTED
  - Three-tier responsive mobile typography (distinct scales for small / medium / large phone)
  - Remove all hardcoded "Iron & Light Johnson Academy" references — make the shell brand-agnostic for future families
  - 50-state compliance database (expand beyond ND)

## TE Extractor — architecture notes
- Vanilla HTML/CSS/JS — Vite build step added for VITE_ env var injection only
- Lives at packages/te-extractor/public/; Vite builds to ../../dist/te-extractor/
- vite.config.js at packages/te-extractor/vite.config.js (root: 'public', base: '/te-extractor/')
- Static assets (manifest.json, sw.js) copied by build script post-Vite
- Served at /te-extractor/ via netlify.toml redirect
- Calls api.anthropic.com directly using VITE_ANTHROPIC_API_KEY — see exception note above
- System prompt (SYSTEM_PROMPT const) lives in app.js — not in a Netlify Function
- System prompt output uses Ink & Gold colors (#22252e banners, #c9a84c accents, #e8c97a lesson numbers)
- Ink & Gold only applies to the extractor app UI chrome (sidebar, buttons, form)
- Logo at packages/te-extractor/public/logo.png (copy of shared/src/assets/logo.png)
- pdf-lib lazy-loaded from CDN for PDF splitter — do not remove or replace
- Source migrated from github.com/rjohnson5481-spec/Claude-Test (flat repo root)

## TE Extractor — Firebase CDN pattern
Firebase Auth + Firestore are loaded via CDN ES module imports in an inline
`<script type="module">` block in index.html (NOT npm packages or app.js imports).
Firebase config uses Vite's `%VITE_FIREBASE_*%` HTML replacement syntax (replaced at build time).
The inline script runs before app.js and exposes:
  window.__teAuth      — Firebase Auth instance
  window.__teDb        — Firestore instance
  window.__teUid       — authenticated user's uid (set after onAuthStateChanged fires)
  window.__teFirestore — { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp }
app.js listens for `document.dispatchEvent('te-auth-ready')` to know when uid is available.
If not signed in, the inline script redirects to / immediately.
Firestore path for extraction history: /users/{uid}/teExtractor/extractions/items/{docId}
Fields: { fileName, lessons, html, previewText (200 char), createdAt (serverTimestamp) }

---

## Key decisions — do not revisit without Rob's explicit instruction
- Monorepo, single Netlify site — not GitHub Pages
- `homeschool.grasphislove.com` is the primary domain (custom domain, live 2026-04-15).
  `ironandlight.netlify.app` remains as the Netlify-default fallback.
- Single Firebase project shared across all tools
- Google sign-in only — single family account
- Anthropic API key server-side only — never in client bundle (TE Extractor is the sole exception — family-internal tool, see architecture notes)
- Mobile-first, content fills viewport width with 16px horizontal padding. No `max-width: 480px` on mobile (removed v0.22.8).
- Desktop breakpoint is `1024px` (raised from 768px in v0.22.7 for Galaxy S25 Ultra compatibility — do not lower without a new reason).
- Large-phone scaling band is `400px–1023px` — bounded so it never touches the desktop sidebar.
- Lexend font only — no serif fonts in the UI
- Ink & Gold color system only — no new tokens
- No grade tracking in any tool
- @dnd-kit/core for drag-and-drop — never hand-roll
- Exact dependency versions — no ^ or ~ in package.json
- TE Extractor links out from the shell via `window.location.href` — a React rewrite is deferred to Phase 3 (do not migrate opportunistically).
- Three-tier mobile responsive typography (distinct scales for small / medium / large phone) is deferred to Phase 4.
- CLAUDE.md is explicitly exempt from the 300-line file-size rule.
- Unified Settings tab owns all app settings — planner's `SettingsSheet` was retired in v0.22.6 and deleted in v0.22.10.
- Planner student state is lifted to `App.jsx` so the desktop sidebar Student selector shares it with the Planner tab — do not re-scope to PlannerTab.

### Dark mode token rule
Never hardcode colors that need to work in both light and dark. Always
use CSS variables (`var(--text-primary)`, `var(--text-secondary)`, `var(--bg-card)`, etc.).

Hardcoded literals are ONLY correct on brand chrome:
- Header / sidebar / bottom nav / sheet-header backgrounds are always `#22252e` regardless of mode — the brand anchor.
- Active-state gold accents (`#e8c97a`, `#c9a84c`) on the dark chrome stay the same in both modes.

Token choice (tricky spots):
- Card body text (subject names, lesson text, titles) → `var(--text-primary)` NOT `var(--ink)`. `--ink` is near-black in both modes (it re-tints toward card-chrome for ink backgrounds) and becomes unreadable on dark card backgrounds.
- Section headings, sheet labels, small-caps dividers → `var(--text-secondary)` NOT `var(--text-muted)`. `--text-muted` is too faint for small-caps headings in dark mode.

When a hardcoded color must only apply in one mode, scope with `[data-mode="dark"]` rules.

---

## Design System — Ink & Gold
### All tokens and components live in packages/shared
### Never redefine in individual tools

**Font**
Single font family: Lexend (Google Fonts)
Weights: 300, 400, 500, 600, 700
Stack: 'Lexend', system-ui, sans-serif — applied to ALL elements globally
Form elements override explicit: input, textarea, button, select all inherit Lexend.
Body base: 14px. No serif fonts anywhere in the UI.

**Logo**
File: packages/shared/src/assets/logo.png
Import: import logo from '@homeschool/shared/assets/logo.png'
Both Header components render: <img src={logo} alt="ILA" className="header-logo" />

**Color tokens — Light mode (default)**
--bg-base:       #f2f0ed
--bg-surface:    #ebe8e3
--bg-card:       #ffffff
--bg-card-hover: #faf8f5
--border:        #eae6e0
--border-light:  #f0ece6
--ink:           #22252e
--ink-light:     #3a3d48
--gold:          #c9a84c
--gold-light:    #e8c97a
--gold-pale:     rgba(201,168,76,0.10)
--red:           #c0392b
--red-lt:        #fdf0ed
--text-primary:  #2a2520
--text-secondary:#5a5248
--text-muted:    #a8a09a

**Color tokens — Dark mode**
--bg-base:       #1c1e24
--bg-surface:    #22252e
--bg-card:       #2a2d35
--bg-card-hover: #32353f
--border:        #363944
--border-light:  #3a3d48
--ink:           #3a3d48
--ink-light:     #4a4e5a
--gold:          #c9a84c
--gold-light:    #e8c97a
--gold-pale:     rgba(201,168,76,0.12)
--red:           #e05252
--red-lt:        rgba(224,82,82,0.10)
--text-primary:  #e8e8e8
--text-secondary:#a0a8b8
--text-muted:    #5a6070

Dark mode: toggle data-mode="light" / data-mode="dark" on <html>
All tokens scoped to [data-mode] selectors
All color transitions: transition: 0.3s

No backward-compat aliases — all components now use Ink & Gold tokens directly.

**Layout (current, v0.22+)**
- Mobile: planner header is a 132px fixed 3-row stack (`#22252e`). Shell has `<BottomNav>` as a 56px fixed bottom bar.
- Desktop (≥1024px): planner header is `display: none` — the shell's 200px fixed left sidebar owns branding + nav + sign-out + Student selector. Content column has `margin-left: 200px`. Planner's own week nav sits above the DayStrip inside `.planner-body`.
- All chrome backgrounds are `#22252e` (hardcoded) — never changes between light/dark.

**Header**
- Background: #22252e — hardcoded literal in both Header.css files, NOT a CSS var
- Planner: 3 rows — Row 1 (48px) logo + brand + 4 icon buttons; Row 2 (~52px) week nav centered; Row 3 (32px) student pills. Total: 132px.
- Dashboard: single row, 60px, logo + school name + 2 icon buttons
- Logo: 34–38px square, border-radius: 8px — uses logo.png (see Logo section above)
- School name structure:
    Line 1: "IRON & LIGHT" — LIGHT wrapped in .header-school-accent (color: #e8c97a)
    Line 2: "JOHNSON ACADEMY"
    Tagline: "Faith · Knowledge · Strength" (rgba(255,255,255,0.35))
- Icon buttons: 32×32px, background: rgba(255,255,255,0.08), border: rgba(255,255,255,0.13)
- Active student tab: color: #e8c97a (gold)
- Student row border-top: 1px solid rgba(255,255,255,0.07)

**DayStrip**
- Floating pill container: background var(--bg-card), border-radius: 12px,
  padding: 5px, margin: 0 14px 14px
- Active day: background #22252e (dark pill), white text
- Today: date number in var(--gold), 2px solid underline in var(--gold)
- Today + active: date in var(--gold-light) for contrast on dark pill
- Sick day: red dot via CSS ::after centered below date number (not top-right corner)

**Sidebar nav items**
- 44x44px, border-radius: 10px
- Default: color: var(--text-muted), no background
- Hover: background: var(--bg-card)
- Active: background: var(--gold-pale), color: var(--gold),
  box-shadow: inset 0 0 0 1px rgba(201,168,76,0.2)

**Cards**
- background: var(--bg-card), border: 1px solid var(--border),
  border-radius: 12px, padding: 22px
- shadow light: 0 1px 4px rgba(0,0,0,0.06)
- shadow dark: 0 1px 6px rgba(0,0,0,0.25)
- Title: 12px, font-weight: 600, letter-spacing: 0.08em,
  text-transform: uppercase, color: var(--text-secondary)
- Hover: border-color: var(--gold-light),
  box-shadow: 0 4px 16px rgba(201,168,76,0.12),
  transform: translateY(-2px)

**Buttons**
- Primary: background: var(--gold), color: #fff,
  border-radius: 8px, padding: 7px 16px, 13px, font-weight: 600
  hover: var(--gold-light)
- Ghost: transparent, border: 1px solid var(--border),
  color: var(--text-secondary)
  hover: border var(--gold), color var(--gold)
- Text link: color: var(--gold-light), no border/background

**Progress bars**
- Track: 4px, background: var(--border), border-radius: 2px
- Fill: linear-gradient(90deg, var(--gold), var(--gold-light))
- Thumb: 12x12px, background: var(--gold-light),
  border: 2px solid var(--bg-base),
  box-shadow: 0 0 0 2px var(--gold-light)

**Lesson rows**
- padding: 10px 14px, border-radius: 8px
- hover: background: var(--bg-card-hover)
- Color dot: 8x8px circle left of content
- Sub-label: italic, 11px, color: var(--text-muted)
- Date: right-aligned, 11px, color: var(--text-muted)

**Section dividers**
- 11px, font-weight: 600, letter-spacing: 0.1em,
  text-transform: uppercase, color: var(--text-muted)
- ::after flex line: height: 1px, background: var(--border), flex: 1

**General vibe — non-negotiable**
- Warm charcoal + gold. Header is always #22252e — the strongest brand anchor.
- Content area is warm cream/white in light, dark charcoal in dark. Never gray-blue.
- Lexend 300-400 body, 500-600 emphasis
- Gold (#c9a84c) is the primary accent — active states, highlights, CTAs
- Borders always warm-toned, never neutral gray
- Spacing generous: 28px page padding, 20px between cards,
  22px internal card padding


  ## Branch strategy
Always work directly on main.
Never create feature branches.
After each confirmed working step, commit and push directly to main.
Netlify auto-deploys on every push to main.
Do not open pull requests. Do not create branches named claude/* or feature/*.

## Netlify build — final confirmed config
- No base directory
- Command: npm install && npm run build (runs from repo root)
- Publish: dist
- Root package.json runs --workspaces --if-present to build all packages
- Do not change this without Rob's explicit instruction
