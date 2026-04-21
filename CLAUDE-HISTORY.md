# CLAUDE-HISTORY.md — Iron & Light Johnson Academy
## Phase History & Migration Notes

Read this file only when Rob explicitly requests historical context.
Do not read by default.

---

## Phase roadmap — project-wide

### Phase 1 — ✅ COMPLETE at v0.22.9
- Unified app shell with 6-tab bottom nav (mobile) + 200px left sidebar (≥1024px desktop)
- Planner: per-day implicit subjects, PDF import, sick day cascade, month picker, batch add, large done checkbox, All Day Event
- Reward Tracker: award/deduct/spend sheets, log, cash conversion (15 pts = $1)
- HomeTab: morning summary with lessons + points for both students
- Unified Settings tab (dark mode, students, default subjects, clear cache, sign out)
- Custom domain homeschool.grasphislove.com
- Responsive: 400–1023 large-phone scaling band, 1024 desktop breakpoint
- TE Extractor: vanilla JS, served at /te-extractor/, links out from shell

### Phase 2 — ✅ COMPLETE at v0.24.1
- Academic Records tab — course catalog, enrollments, school years/quarters/breaks, grade entry, attendance, AI calendar import, Report/Transcript Generator, PDF generation, Firebase Storage, activities tracking, AI curriculum import
- Home tab rework — per-student cards, tappable mobile, expanded desktop
- Dynamic student lists everywhere (onSnapshot real-time)

### Desktop Redesign — ✅ COMPLETE at v0.27.4
- CalendarWeekView — 5-column Mon–Fri grid, today highlighted, drag-and-drop
- Backup system — Option C manual (export/diff restore/factory reset) + Option B auto 6-hour
- PDF diff import — Parse → Review → Publish flow
- Sick day desktop selector
- Restore from Backup diff engine — student selector, conflict highlighting

### Phase 3 — 🔒 NOT STARTED
- School Days compliance — user-entered days/hours requirement
- TE Extractor React rewrite

### Phase 4 — 🔒 NOT STARTED
- Three-tier responsive mobile typography
- Remove hardcoded Iron & Light Johnson Academy references — brand-agnostic shell
- 50-state compliance database
- PWA + Google Play TWA + Apple wrapper
- Stripe integration + Free/Pro feature gating
- Admin dashboard (Rob-only access)
- Student profiles migration (currently stored as name strings)
- Git tags added to every prompt

---

## Planner build log — Phase 1 (completed steps)

✓ Firebase/Firestore layer (firebase/planner.js)
✓ Netlify Function — parse-schedule (BJU Homeschool Hub "Print By Day" format)
✓ Hooks (useWeek, useSubjects, usePdfImport, usePlannerUI)
✓ PlannerLayout + Header + DayStrip
✓ SubjectCard + EditSheet
✓ AddSubjectSheet + UploadSheet
✓ Bug fix: addSubject no longer pre-populates future days
✓ Data model redesign: per-day implicit subjects
✓ Bug fix: PDF import uses parsedData.weekId/student
✓ Feature: Delete Week
✓ Feature: Month picker
✓ Feature: Upload sheet — rich parse preview, wipe toggle, success state, debug log
✓ Feature: Sick Day — cascade shift algorithm, Firestore markers, red dot on DayStrip
✓ Visual Polish Session 1 — Ink & Gold tokens, header redesign, DayStrip floating pill
✓ Visual Polish Session 2 — SubjectCard, all sheets, action bar, empty state
✓ Settings sheet — dark mode toggle, students list, default subjects
✓ v0.19.0 — PWA theme_color #22252e; student delete; Header students from Firestore
✓ v0.21.0 — All Day Event (allday key); desktop responsive layout ≥768px
✓ v0.21.1 — 11-fix polish pass
✓ v0.21.2 — Fix allday key (was __allday__, rejected by Firestore); weekId normalized to Monday
✓ Session 16 — SubjectCard three-column layout; AddSubjectSheet multi-day/multi-student batch add
✓ v0.22.0 — Desktop shell polish: planner header hidden; desktop week nav in content; student state lifted to App.jsx
✓ v0.22.2 — Desktop CSS audit + consolidation; day-strip non-sticky on desktop
✓ v0.22.6 — Unified Settings tab; planner SettingsSheet retired
✓ v0.22.8 — Removed max-width: 480px on mobile
✓ v0.22.9 — Phase 1 complete; 400–1023px large-phone scaling band

---

## Desktop calendar build log (v0.25–v0.27)

✓ v0.25.0 — CalendarWeekView built; replaces DayStrip layout at ≥1024px
✓ v0.25.3 — Selection state removed; click to open / hold to drag
✓ v0.26.x — Backup system Option C (manual) built
✓ v0.26.x — Backup system Option B (scheduled Netlify function) built
✓ v0.27.0 — PDF diff import (Parse→Review→Publish) replaces immediate-write import
✓ v0.27.4 — PlannerLayout split: PlannerActionBar + UndoSickSheet extracted

---

## Backup/restore build log (v0.27–v0.28)

✓ v0.27.5 — Export filename uses email username + date
✓ v0.27.6–v0.27.7 — Sick day desktop day selector; cascade wired to activeDay
✓ v0.27.8 — Full restore delete phase fixed — uses collectionGroup not nested walk
✓ v0.27.9 — Diff engine (generateRestoreDiff, applyRestoreDiff); RestoreDiffSheet mobile
✓ v0.28.0 — RestoreDiffCalendar desktop; mobile/desktop routing in RestoreDiffSheet
✓ v0.28.1 — Student selector in RestoreDiffCalendar
✓ v0.28.2–v0.28.3 — Undo sick day correct day from Firestore; desktop button fix
✓ v0.28.4 — Mobile sick day sheet restored to single day display
✓ v0.28.5 — useSickDay hook; Undo button driven by Firestore onSnapshot

---

## Migration — completed
- Planner: embedded inside PlannerTab — /planner/ separate build removed (session 14)
- Reward Tracker: embedded inside RewardsTab — /reward-tracker/ separate build removed (session 14)
- HomeTab: replaced tool card grid with morning summary dashboard
- TE Extractor stays external — vanilla JS, cannot be migrated into React shell

## Orphaned Firestore data (do not migrate — manual cleanup only)
Old paths from before the per-day redesign — still in Firestore but no longer read/written:
  /users/{uid}/subjectLists/{studentName}
  /users/{uid}/weeks/{weekId}/students/{studentName}/subjects/{subjectName}/days/{0-4}
Can be manually deleted from Firebase console. No migration script needed.

---

## Dashboard shell architecture detail

### Shell layout — state lifted to App.jsx
App.jsx owns:
- activeTab (string, default 'home')
- plannerStudent (string, default 'Orion')
- colorMode + toggleDarkMode (via useDarkMode)
- students + subjectsByStudent — from useSettings(uid, plannerStudent)

### Bottom nav tabs (in order — 6 tabs)
1. home → HomeTab. Icon: 🏠
2. planner → PlannerTab. Icon: 📅
3. rewards → RewardsTab. Icon: 🏅
4. te → window.location.href = '/te-extractor/'. Icon: 📄
5. academic → AcademicRecordsTab. Icon: 🎓
6. settings → SettingsTab. Icon: ⚙️

---

## TE Extractor architecture notes
- Vanilla HTML/CSS/JS — Vite build step added for VITE_ env var injection only
- Lives at packages/te-extractor/public/; Vite builds to ../../dist/te-extractor/
- vite.config.js at packages/te-extractor/vite.config.js (root: 'public', base: '/te-extractor/')
- Calls api.anthropic.com directly using VITE_ANTHROPIC_API_KEY
- System prompt (SYSTEM_PROMPT const) lives in app.js — not in a Netlify Function
- pdf-lib lazy-loaded from CDN for PDF splitter — do not remove or replace

## TE Extractor — Firebase CDN pattern
Firebase Auth + Firestore loaded via CDN ES module imports in inline script in index.html.
Firebase config uses Vite's %VITE_FIREBASE_*% HTML replacement syntax.
The inline script exposes:
  window.__teAuth, window.__teDb, window.__teUid, window.__teFirestore
app.js listens for document.dispatchEvent('te-auth-ready') to know when uid is available.

---

## All Day Event — data model detail
- Stored as 'allday' key in per-day subjects collection
- Path: /users/{uid}/weeks/{weekId}/students/{student}/days/{dayIndex}/subjects/allday
- Fields: { lesson: eventName, note: eventNote, done: false, flag: false }
- hasAllDayEvent() and getAllDayEvent() helpers in firebase/planner.js
- Always filter 'allday' from regular subject lists using .filter(s => s !== 'allday')
- SubjectCard renders full-width #22252e banner when subject === 'allday'
- IMPORTANT: __allday__ (double-underscore) rejected by Firestore — renamed to allday in v0.21.2

---

## Academic Records — grading scales
Letter (A–F): A=90-100, B=80-89, C=70-79, D=60-69, F=0-59
E/S/N/U: E=Excellent, S=Satisfactory, N=Needs Work, U=Unsatisfactory
Grade entry saves both percent (number) and letter — both stored in Firestore.
Cascading deletes not implemented — console.warn fires on parent deletes.
