# CLAUDE.md — Iron & Light Johnson Academy Homeschool Tools
Current version: v0.38.0 — Block 2 Session 5: studentId migration — hooks, firebase layer, and components updated.

## What this repo is
A monorepo housing all digital tools for Iron & Light Johnson Academy. Growing toolset; new tools added over time. Every tool shares branding, design system, and Firebase project.

## The Johnson Family
- Rob (dad, homeschool teacher, MDiv student)
- Ashley (mom)
- Students: Orion and Malachi

## Repo structure
/
├── CLAUDE.md                  ← update after every session
├── CLAUDE-DESIGN.md           ← Ink & Gold (UI/CSS sessions only)
├── CLAUDE-HISTORY.md          ← phase history (only when requested)
├── HANDOFF.md                 ← overwrite at end of every session
├── scratch.js                 ← never committed, complex logic sandbox
├── netlify.toml
├── packages/
│   ├── shared/                ← design system, Firebase init, auth, components
│   └── dashboard/             ← unified app shell; tools live in src/tools/

Workspaces: ["packages/shared", "packages/dashboard"]. Reward tracker, te-extractor, and standalone planner package were retired in/before v0.30.0.

---

## Stack
- React + Vite, Firebase (Auth + Firestore + Storage), Netlify
- vite-plugin-pwa (dashboard is PWA entry point)
- @dnd-kit/core (drag-and-drop only, never hand-roll)
- pdf-lib (browser-side PDF generation)
- @netlify/functions 2.8.1, @netlify/blobs 8.1.0, firebase-admin 12.1.0

Locked dependencies — never upgrade without asking Rob: firebase, @dnd-kit/core, vite-plugin-pwa, react, react-dom, pdf-lib. All package.json entries use exact versions — no ^ or ~.

---

## Deployment
- Host: Netlify, connected to GitHub
- Primary: homeschool.grasphislove.com (live since 2026-04-15)
- Secondary: ironandlight.netlify.app
- App shell at root `/` — serves dashboard
- NOT GitHub Pages

netlify.toml:
[build]
  command = "npm install && npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

Order required — never reorder. No base directory; build runs from repo root via workspaces.

---

## Environment variables (Netlify dashboard only — never in code)
- ANTHROPIC_API_KEY — Netlify Functions only
- VITE_ANTHROPIC_API_KEY — CalendarImportSheet + CurriculumImportSheet (intentional exception; Netlify Function proxy hit 60s timeouts)
- VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID
- VITE_FIREBASE_STORAGE_BUCKET — homeschool-tools-ff73c.firebasestorage.app
- FIREBASE_SERVICE_ACCOUNT — scheduled-backup.js

Anthropic functions: parse-schedule.js (POST /api/parse-schedule, returns {student, weekId, days}), scheduled-backup.js (every 6 hours → Netlify Blobs).

---

## Firestore data model

### Planner
/users/{uid}/weeks/{weekId}/students/{studentName}/days/{0-4}/subjects/{subjectName}
  → { lesson, note, done, flag }
  Special key: 'allday' (NOT __allday__ — Firestore rejects double-underscore)

/users/{uid}/sickDays/{dateString}              → { student, date, subjectsShifted }
/users/{uid}/settings/students                  → { names: string[] }
/users/{uid}/subjectPresets/{studentName}       → { subjects: string[] }

weekId / dateString format: "YYYY-MM-DD" (weekId = Monday). Always use mondayWeekId() from constants/days.js. dayIndex: 0=Mon … 4=Fri.

CRITICAL: users/{uid} parent doc does NOT exist as a Firestore document. Use collectionGroup('subjects') for traversal from uid level. Use collectionGroup('settings') to discover users.

### Compliance (Phase 3)
/users/{uid}/settings/compliance
  → { daysEnabled, hoursEnabled, startingDays, startingHours,
      requiredDays, requiredHours,    // DEPRECATED top-level — removed via lazy migration on first save in Session 4.4 onwards. Doc may still contain them if no save has happened yet.
      requiredByStudent: { [name]: { requiredDays, requiredHours } }
    }

/users/{uid}/schoolDays/{dateString}
  → { hoursByStudent: { [name]: number } }

Compliance is per-student (required values, hours logging, day completion counts). Starting values are family-wide (entered once, seed both students).

### Academic Records
/users/{uid}/schoolYears/{yearId}            → { label, startDate, endDate }
/users/{uid}/schoolYears/{yearId}/quarters   → { label, startDate, endDate }
/users/{uid}/schoolYears/{yearId}/breaks     → { label, startDate, endDate }
/users/{uid}/courses/{courseId}              → { name, curriculum, gradingType }
/users/{uid}/enrollments/{enrollmentId}      → { courseId, student, yearId, notes, syncPlanner, gradeLevel }
/users/{uid}/grades/{gradeId}                → { enrollmentId, quarterId, grade, percent }
/users/{uid}/reportNotes/{noteId}            → { student, quarterId, notes }
/users/{uid}/savedReports/{reportId}         → { student, periodLabel, yearLabel, generatedAt, storageUrl, notes, includeToggles }
/users/{uid}/activities/{activityId}         → { student, name, startDate, endDate, ongoing, notes }

Firebase Storage: users/{uid}/reports/{reportId}.pdf

### Firestore Security Rules
match /users/{userId}/{document=**} { allow read, write: if request.auth.uid == userId; }
match /{path=**}/subjects/{subjectId} { allow read: if request.auth != null && resource.data.uid == request.auth.uid; }

R2 is uid-scoped as of v0.36.0. Never remove either rule.

---

## Package structure
packages/dashboard/src/
├── App.jsx                    ← auth + activeTab + plannerStudent + colorMode + useSettings
├── components/
│   ├── BottomNav.jsx          ← mobile bottom bar / desktop 200px sidebar
│   └── SignIn.jsx
├── tabs/
│   ├── HomeTab.jsx
│   ├── PlannerTab.jsx
│   ├── AcademicRecordsTab.jsx
│   ├── SettingsTab.jsx
│   └── DataBackupSection.jsx
├── hooks/
│   ├── useDarkMode.js
│   ├── useHomeSummary.js
│   └── useComplianceSummary.js  ← Phase 3 (reworked in Session 4.3)
├── firebase/
│   ├── backup.js              ← export, diff restore, factory reset
│   ├── compliance.js          ← subscribeCompliance, saveCompliance, subscribeSchoolDays
│   └── RestoreDiff*.{jsx,css}
└── tools/
    ├── planner/
    │   ├── components/        ← PlannerLayout, PlannerSheets, SubjectCard, CalendarWeekView, sheets, HoursInputRow
    │   ├── hooks/             ← useWeek, useSubjects, useSickDay, useMultiSelect, useCellToggles, useCompliance, usePdfImport, usePlannerHelpers, usePlannerUI, useSettings
    │   └── constants/         ← days.js (mondayWeekId), compliance.js (paths + COMPLIANCE_DEFAULTS)
    └── academic-records/
        └── components/        ← RecordsMainView, ComplianceSheet, other Records sheets

netlify/functions/
├── parse-schedule.js
└── scheduled-backup.js

---

## Responsive breakpoints
- `<400px` — small phone, 56px nav
- `400–809px` — large phone (S25 Ultra), scaled fonts/nav
- `≥810px` — desktop, 200px fixed sidebar, CalendarWeekView

Desktop is always 810px — never lower. Large phone band always bounded `(min-width: 400px) and (max-width: 809px)` — never bare min-width: 400px. Desktop changes are always additive via @media (min-width: 810px) — never modify base mobile.

---

## Tools status (v0.34.0)
- shared, dashboard shell, Home Tab, Planner, Academic Records, Backup → ✅ Complete
- School Days → ✅ Phase 3 complete — per-student compliance tracking. Records Attendance card and Home progress rows source from compliance data when daysEnabled.
- Month view → 🔒 Queued for Phase 5
- Reward Tracker, TE Extractor → 🗑 Removed in v0.30.0

---

## Roadmap

### Phase 3 — School Days compliance (mid-rework)
Per-student tracking of state-required days and hours. ND state law requires per-student tracking; family-wide design from Sessions 1–4 is being rolled back.

Sessions complete: 1 settings, 2 hours input (family-wide; superseded), 3 Records relocation, 3.6 modal sheet, 4 dashboard (family-wide; KNOWN-WRONG), 4.1 per-student data migration.

Sessions remaining:
- 4.2 rollback Session 4. Delete ComplianceCard, pendingRecordsAction, listener useEffect, Home/Sheet renders. Keep useComplianceSummary.
- 4.3 rework useComplianceSummary to return per-student maps.
- 4.4 per-student required-value inputs in ComplianceSheet. Delete old top-level requiredDays/requiredHours from Firestore (contract phase of expand-then-contract).
- 4.5 planner hours input writes per-student data via schoolDays/{date}.hoursByStudent[student].
- 5 Records Attendance card + Home per-student progress sources from compliance instead of calendar math when daysEnabled.
- 6 deferred: planned days view.

### Phase 4 — Multi-family launch readiness
Launch blockers — Phase 4 Block 1 complete as of v0.36.0:
1. ✅ Add `uid` field to subject cell writes (v0.35.0)
2. ✅ Tighten Firestore R2 rule to uid-scope subjects reads (v0.36.0)
3. ✅ Rewrite useComplianceSummary collectionGroup query to filter on uid (v0.36.0)
Note: composite index on subjects (uid ASC, done ASC) must be created in Firebase
console — Firestore will log a link on first run of compliance summary.

Phase 4 broader scope: brand-agnostic shell, student profiles migration (currently name strings), Stripe + Free/Pro gating, admin dashboard, 50-state compliance database.

### Phase 5 — Calendar + Public Launch Polish
Month view (unlocks Friday sick-day cascade fix), multi-week lesson import, ICS import, event/appointment planning, offline service worker, privacy policy, Google Play TWA, iOS Median.co wrapper.

---

## File size rules
- Hard limit: 300 lines per source file (JSX/JS/CSS)
- CLAUDE.md, CLAUDE-DESIGN.md, CLAUDE-HISTORY.md exempt
- Target: under 250 lines; if approaching, stop and split before continuing
- One responsibility per file
- Components never contain business logic — extract to hooks/
- Firebase calls never live in components — extract to firebase/

## Constants rule
All string literals, Firestore path builders, day labels, subject lists live in constants/. Never hardcode in components or hooks.

## Complex logic rule
Non-trivial logic prototypes in scratch.js first. Never committed.

## Build order
1. Read packages/shared before building anything
2. Never duplicate branding, tokens, Firebase init, or auth
3. Firebase + Auth before any UI
4. Firestore read/write layer before components
5. Constants before components that need them
6. Stop and confirm with Rob before starting a new phase or new tool

---

## Session discipline
- Always read the file before editing it
- Maximum 3 files per code prompt; break larger work into steps
- Don't build and debug in the same prompt
- Never work on top of broken code — revert and restart clean
- New feature = commit working state first
- Fresh Claude Code chat for every new session

## HANDOFF separation rule
Substantial sessions (4+ files or 5+ commits) end at "version bump pushed." HANDOFF rewrite runs as a separate prompt afterward. Smaller sessions keep HANDOFF inline.

## HANDOFF.md content rule
HANDOFF is a state snapshot, not a planning document.

Belongs in HANDOFF: what was completed, what's broken right now, next session start steps, key files changed.

Belongs in CLAUDE.md: roadmap, session plans, design decisions, process rules, phase prerequisites.

If a HANDOFF section exceeds ~50 lines, content has drifted into planning territory — move forward-looking content to CLAUDE.md.

## Credentials rule
Never display service account JSON contents in any context — chat, screenshots, terminal output. Verify file shape only:
- `Test-Path <path>` (true/false)
- `(Get-Content <path> -Raw).Length` (character count)
- `(Get-Content <path> -Raw).Substring(0,1)` (single character)

Never use `Get-Content <path>` or `-TotalCount 1` (compact JSON = whole file on one line).

## End of every session
1. Update CLAUDE.md with any new decisions
2. Overwrite HANDOFF.md (state only, not plans)
3. Verify before carrying forward any "What is broken" bullet — drop if resolved, don't propagate stale bullets

## Start of every session
1. Read CLAUDE.md
2. Read HANDOFF.md
3. Read CLAUDE-DESIGN.md for UI/CSS sessions
4. Confirm with Rob what we're building today

---

## Local development environment
Rob's Windows 11 machine is set up for scripts that need Firestore admin access (one-time migrations, audits).

- Repo: C:\Users\rjohn\Code\Home-School-Planner
- Service account JSON: C:\Users\rjohn\Downloads\firebase-service-account.json
- Node.js ≥ 18, Git installed

Pattern: Claude writes script under scripts/ (own private package.json). Rob pulls, cd's to scripts/, runs npm install, sets `$env:GOOGLE_APPLICATION_CREDENTIALS`, runs DRY_RUN=true first, then live. Claude Code follow-up deletes script.

The Claude Code sandbox cannot reach Firestore. Any script needing live Firestore access runs from Rob's machine.

---

## Branch strategy
Always work directly on main. Never create feature branches. Commit and push after each working step. Netlify auto-deploys on push to main. No PRs, no claude/* or feature/* branches.

## Netlify build (do not change without Rob's instruction)
- No base directory
- Command: npm install && npm run build (from repo root)
- Publish: dist

---

## Key decisions — do not revisit without Rob's instruction
- Monorepo, single Netlify site, homeschool.grasphislove.com primary
- Firebase + Google sign-in only; single family today, multi-family Phase 4
- Desktop breakpoint 810px (raised from 768px for S25 Ultra)
- Large phone band 400–809px bounded
- No max-width on mobile
- allday key (Firestore rejects __allday__)
- weekId always Monday via mondayWeekId()
- collectionGroup('subjects') for backup/restore + dashboard query
- collectionGroup('settings') for user discovery
- R2 read rule never removed (collectionGroup support); uid-scoped as of v0.36.0
- Reward Tracker + TE Extractor removed v0.30.0; tabs are exactly Home/Planner/Records/Settings
- CalendarImportSheet + CurriculumImportSheet call Anthropic directly (Netlify proxy timeouts)
- Settings tab owns settings except compliance (Compliance lives in Records as Quick Action sheet)
- Student state lifted to App.jsx
- Work directly on main, no feature branches
- 300-line hard limit per source file
- Grade entry saves both percent + letter
- Attendance currently calendar math (weekdays − breaks − sick days); Session 5 swaps to per-student compliance count when daysEnabled
- pdf-lib for PDF generation; Firebase Storage for saved report PDFs (users/{uid}/reports/)
- Student stored as name string (Phase 4 migrates to profile docs)
- Cascading deletes not implemented (console.warn on parent deletes)
- Restore from Backup uses diff engine; Full Restore is two-step confirmation
- Backup export filename uses email username + date
- useSickDay hook owns sick-day Firestore listener; Undo driven by Firestore not local state
- Sick day Friday overflow: FridayComingSoonSheet opens before any write when Friday has lessons; deferred until month view
- Sick day confirm auto-writes "Sick Day" allday cell (skipped if user placed custom allday); Undo deletes auto-written cell only
- Mobile multi-select (≤809px): long-press 500ms enters select mode; MultiSelectBar replaces bottom nav at z-index 110; 'allday' never selectable; state in useMultiSelect hook; BottomNav.jsx never modified
- Compliance is per-student (required values, hours logging, day counts); starting values family-wide
- Phase 3 expand-then-contract migration v0.32.1: settings/compliance has both old top-level fields AND new requiredByStudent map; old fields deleted in Session 4.4
