# HANDOFF — end of session 2026-04-10

## What was completed this session
Full Phase 1 build of packages/planner — all 30 files written, committed,
and pushed to branch `claude/read-claude-docs-er59m`.

### Files built
**Constants**
- src/constants/firestore.js — Firestore path builders (single source of truth)
- src/constants/days.js — day labels, getMondayOf, toWeekId, getWeekDates,
  formatWeekLabel, getTodayDayIndex
- src/constants/routes.js — ROUTES object
- src/constants/subjects.js — SUBJECT_PRESETS array (15 subjects)

**Firebase**
- src/firebase/planner.js — subscribeSubjectList, saveSubjectList,
  subscribeDayData, updateCell (pure Firestore I/O, no business logic)

**Netlify Function**
- netlify/functions/parse-schedule.js — POST handler, calls claude-sonnet-4-20250514
  with PDF/image as document block, returns structured JSON by student → subject → days

**Config**
- packages/planner/package.json
- packages/planner/vite.config.js (base: '/planner/', outDir: '../../dist/planner')
- packages/planner/index.html

**Hooks**
- src/hooks/useWeek.js — week navigation, weekId/weekDates/prevWeek/nextWeek
- src/hooks/useSubjects.js — subject list + day data real-time subscriptions
- src/hooks/usePdfImport.js — file → base64 → POST /api/parse-schedule → result
- src/hooks/usePlannerUI.js — all local UI state (student, day, editTarget, etc.)

**App entry**
- src/main.jsx, src/App.jsx, src/planner.css

**Components (all with CSS)**
- PlannerLayout — full layout shell, toggle handlers, handleApplySchedule
- Header — 2-row 80px fixed: logo + week nav + Import/Sign out / student pills
- DayStrip — sticky 5-tab day selector at top: 80px
- SubjectCard — lesson card with done/flag toggles
- EditSheet — bottom sheet: lesson + note textareas, done/flag toggles, save
- AddSubjectSheet — preset grid + custom input
- UploadSheet — file picker → spinner → result summary → Apply to Week

**Deploy config**
- netlify.toml — added /api/* and /planner/* redirects before /* catch-all
- packages/dashboard/vite.config.js — added build.outDir: '../../dist'

---

## What is currently incomplete or untested
- **Swap Days feature** — not built; confirm with Rob before starting
- **Not merged to main** — all work is on `claude/read-claude-docs-er59m`;
  needs PR review + merge before Netlify auto-deploys
- **Not smoke-tested in browser** — npm install has not been run this session;
  no dev server started; no Firestore data verified
- **reward-tracker** — still needs migrating into monorepo structure

---

## What the next session should start with
1. Read CLAUDE.md + HANDOFF.md (required)
2. Confirm with Rob: merge the planner branch to main, or smoke-test first?
3. If smoke-testing: `npm install` from repo root, then run planner dev server
   and walk through the golden path (sign in → select day → add subject →
   edit lesson → mark done → flag → PDF import)
4. If merging: open PR from `claude/read-claude-docs-er59m` → main, verify
   Netlify build succeeds, check /planner route live
5. After merge: confirm with Rob whether to build Swap Days (Phase 1 step 9)
   or move to reward-tracker migration

---

## Decisions made this session (already added to CLAUDE.md)
- Planner header is 2 rows, 80px total (48px top + 32px student pills)
- usePlannerUI.js added to keep App.jsx permanently thin (~47 lines)
- PlannerLayout.jsx is the rendering layer — App.jsx does wiring only
- planner firebase/ has NO init.js or auth.js — use @homeschool/shared directly
- DayStrip sticky at top: 80px; each sheet has its own overlay class
- netlify.toml redirect order is load-bearing — /api/* and /planner/* must
  precede /* or the dashboard catch-all intercepts them
