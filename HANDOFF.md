# HANDOFF — Session ending 2026-04-14 (tenth session)

## What was completed this session

### Planner v0.21.0 — All Day Event + Desktop Responsive Layout

**Step 4 — Firestore helpers (commit 7f0852e)**
Added `hasAllDayEvent(subjects)` and `getAllDayEvent(subjects)` to
`packages/planner/src/firebase/planner.js`. Pure helpers — no new Firestore paths.

**Steps 5+6 — AllDay banner + show/hide toggle (commit 9b1b157)**
- `SubjectCard.jsx`: when `subject === '__allday__'`, renders full-width #22252e banner
  (event name in #e8c97a, optional note in muted white). Regular card logic unchanged.
- `PlannerLayout.jsx`: filters `__allday__` from regular subjects list; renders allday
  banner first; gold "Show subjects ↓ / Hide subjects ↑" toggle button when allday exists.

**Step 7 — All Day Event in AddSubjectSheet (commit 36ba304)**
- Gold "All Day Event" button at top of Add Subject sheet.
- Clicking reveals inline form (event name required, note optional).
- If allday already exists: shows "Edit All Day Event ›" which closes Add sheet and opens Edit.
- `onAddAllDay(name, note)` and `onEditAllDay()` props added to AddSubjectSheet.

**Step 8 — EditSheet allday support (commit 13c19be)**
- When `subject === '__allday__'`: title shows "All Day Event", label reads "Event name",
  Done/Flag toggles hidden, delete button reads "Remove All Day Event".

**Step 1 — Desktop header (commit 4ac9006)**
CSS-only. At ≥768px: week nav absolutely positioned centered in row 1 (pointer-events: none
with re-enable on children). Student row hidden. Total header height: 48px.

**Steps 2+3 — Desktop sidebar + content grid (commit c8b7cf0)**
- `DayStrip.jsx`: new props `students`, `student`, `onStudentChange`. Renders student pills
  and full day names (both hidden at mobile via CSS).
- `DayStrip.css`: at ≥768px, DayStrip becomes `position: fixed; left:0; top:48px; bottom:0;
  width:200px` sidebar with student pills and horizontal day rows.
- `PlannerLayout.css`: at ≥768px, planner-body shifts left:200px/top:48px; subjects use
  `repeat(auto-fill, minmax(340px, 1fr))` grid; action bar left:200px.

**Version bump + CLAUDE.md update (commits fd17700, 5b25bad)**
- planner package.json: 0.20.0 → 0.21.0
- CLAUDE.md: Desktop layout section, All Day Event data model, Phase 1 entry 27.

---

## Current state

All commits on `main`. Netlify deploying.

---

## What to do first next session

### 1. Smoke-test v0.21.0 end-to-end

**All Day Event:**
- Open /planner → tap + Add Subject → "All Day Event" tile should appear at top (#22252e, gold text)
- Tap it → inline form with "Event name" input appears
- Enter a name + optional note → tap "Add Event"
- Banner appears above subject cards: dark background, gold event name, "Show subjects ↓" toggle
- Tap banner → Edit sheet opens with "All Day Event" title, "Event name" label, no Done/Flag toggles, "Remove All Day Event" delete button
- Tap "+" Add Subject again → should show "Edit All Day Event ›" instead of the add form

**Desktop layout (open at ≥768px width):**
- Header should collapse to 1 row: brand left, week nav center, actions right. No student row.
- Left sidebar (200px): student pills at top (stacked), then Mon–Fri day rows with full names
- Content area: card grid auto-fills to 340px+ columns
- Tapping a student pill in the sidebar should switch students
- Action bar: aligned from left:200px

### 2. Planner smoke-test items still pending
- Import second PDF with toggle OFF — confirm existing done/note data preserved

### 3. Verify Firestore security rules (still unchecked from session 9)
Confirm rules allow reads/writes to `/users/{uid}/teExtractor/extractions/items/{docId}`.
See session 9 handoff for the exact rule to add if missing.

---

## Known incomplete / not started

- Subject count badges in desktop sidebar DayStrip NOT implemented — requires subscribing
  to all 5 days simultaneously. Currently the sidebar shows day name + date + sick dot only.
  To implement: add a `weekSubjectCounts` state to `useSubjects.js` that subscribes to
  all 5 days and returns `{ 0: N, 1: N, ... }`, then pass through PlannerLayout → DayStrip.

- reward-tracker: not migrated

- Academic Records: coming-soon placeholder only

- app.js in te-extractor is ~970+ lines — violates 300-line limit; natural split points:
  extraction logic, history, debug log, progress indicator, PDF splitter
