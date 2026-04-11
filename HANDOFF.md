# HANDOFF — end of session 2026-04-11

## What was completed this session
Three commits landed on main covering quick fixes, upload sheet improvements,
and the Sick Day feature.

---

### Commit 1 — Quick fixes
**Commit: `898c8e1`**

- **Flag card red:** `.subject-card--flag` sets `border-color: var(--red)` and
  faint red background `rgba(192,57,43,0.06)`
- **Note dot:** Removed note text preview from card body. Added always-visible
  8×8px dot in card header — filled `var(--forest)` when note exists,
  unfilled `var(--border)` when empty
- **Placeholder text:** Empty lesson shows "Tap to add lesson details" in muted italic
- **Calendar emoji:** Header "Cal" button changed to 📅 (explicitly requested by Rob)

Files changed:
- `components/SubjectCard.jsx` — hasNote bool, note dot span, removed note `<p>`,
  placeholder, `subject-card--flag` class
- `components/SubjectCard.css` — flag card style, indicators flex, note dot styles,
  removed old note styles, added `background 0.2s` to card transition
- `components/Header.jsx` — "Cal" → "📅"

---

### Commit 2 — Upload sheet improvements
**Commit: `2477a02`**

- **Rich parse preview:** Student · week-of header, one row per lesson (day abbrev +
  subject + "Day N" extracted via regex), scrollable when >6 rows, lesson/day count
  footer
- **Wipe toggle:** "Replace existing schedule" checkbox shown before applying; when
  checked, calls `wipeWeek(parsedData.weekId, parsedData.student)` before writing cells
- **Success state:** After applying, shows "✓ Applied — jumped to week of {date}"
  instead of auto-closing; user closes manually via "Close" button
- **Debug log:** `addLog(message)` in `usePdfImport` writes timestamped entries;
  "View Log" button in UploadSheet opens `DebugSheet` (z-index 300) with "Copy All"

New files:
- `components/DebugSheet.jsx` — log viewer, z-index 300, Copy All button
- `components/DebugSheet.css` — monospace log entries, overlay styles

Modified files:
- `hooks/usePdfImport.js` — added `log`, `addLog`, reset clears log, returns log
- `components/UploadSheet.jsx` — full rewrite: local `wipe`/`applied`/`showLog` state,
  rich preview, wipe toggle, success state, View Log button
- `components/PlannerLayout.jsx` — `handleApplySchedule` made async, wipe param added,
  removed `setShowUpload(false)` (user closes manually), sick banner + sick btn added,
  `planner-sick-banner` and `planner-sick-btn` CSS classes

---

### Commit 3 — Sick Day feature
**Commit: `4dbe485`**

Full sick day workflow: mark a day sick, shift lessons forward, see red dots on tabs.

**How it works:**
1. User taps "Sick Day" → `SickDaySheet` opens with all today's subjects checked
2. User deselects any subjects that should NOT shift (e.g., reading done before illness)
3. Confirm → cascade algorithm runs per selected subject:
   - Reads unbroken chain of consecutive scheduled days (up to 10)
   - Writes each link's data to the next position (reverse order, safe)
   - Deletes original sick-day cell
4. Writes sick day marker to `/users/{uid}/sickDays/{dateString}`
5. Red dot appears on that day's DayStrip tab; "Sick Day" banner shows when viewing

**Friday edge case:** `nextSchoolDay(4, weekId)` returns `{dayIndex: 0, weekId: nextWeekId}`
(adds 7 days to the Monday of the current week), bridging Friday → Monday correctly.

New files:
- `components/SickDaySheet.jsx` — checklist bottom sheet, all subjects checked by default
- `components/SickDaySheet.css` — slide-up sheet, max-height 40vh list, forest-pale checked

Modified files:
- `constants/firestore.js` — added `sickDayPath(uid, dateString)`
- `firebase/planner.js` — added `readCell` (getDoc), `writeSickDay`, `subscribeSickDays`
- `hooks/useSubjects.js` — added sick days subscription, `nextSchoolDay`, `performSickDay`,
  `sickDayIndices` Set computation (per-student client-side filter)
- `hooks/usePlannerUI.js` — added `showSickDay` / `setShowSickDay`
- `App.jsx` — destructures and passes `performSickDay`, `sickDayIndices`
- `components/DayStrip.jsx` — `sickDayIndices` prop, red dot span when `sickDayIndices.has(i)`
- `components/DayStrip.css` — `.day-strip-sick-dot` (6×6px, absolute, top-right of tab)
- `components/PlannerLayout.jsx` — `handleSickDayConfirm`, `isSickDay`, sick banner,
  sick button, `<SickDaySheet>` rendered when `showSickDay`

---

## What is currently incomplete or untested
- **Not smoke-tested in browser** — no live device testing this session.
  Golden path to verify:
  1. Flag a subject card → border and background turn red
  2. Note dot: empty = hollow circle, has note = filled forest circle
  3. No-lesson card shows "Tap to add lesson details" placeholder
  4. Calendar header button shows 📅
  5. Upload a PDF → rich preview with day/subject/lesson rows, scroll if long
  6. Wipe toggle: check it, apply → old cells deleted before new ones written
  7. Success state: "✓ Applied — jumped to week of..." shown; user closes manually
  8. View Log: opens debug sheet with timestamped entries, Copy All works
  9. Sick Day: tap button, sheet opens with all subjects checked
  10. Deselect one → confirm → that subject stays, others shift to next school day
  11. Red dot on sick day tab; "Sick Day" banner when viewing that day
  12. Friday sick day: subjects land on Monday of next week
  13. Chain collision: if Monday and Tuesday both have the same subject,
      Tuesday's lesson shifts to Wednesday, Monday's shifts to Tuesday
- **reward-tracker** — still needs migrating into monorepo structure

---

## What the next session should start with
1. Read CLAUDE.md + HANDOFF.md (required)
2. Confirm with Rob: smoke-test the live planner, or move to Phase 2?
3. Phase 2 options (from CLAUDE.md — do not build without Rob's go-ahead):
   - Auto-roll flagged lessons to next week
   - Week history browser
   - Copy last week as template
   - Export week as PDF

---

## Decisions made this session (already added to CLAUDE.md)
- sickDays Firestore collection: `/users/{uid}/sickDays/{dateString}`
  → `{ student, date, subjectsShifted[] }` — one doc per sick calendar date
- subscribeSickDays listens to full collection, filters client-side by week dateStrings
  (collection stays tiny; no Firestore query/where needed)
- sickDayIndices filters by `sickDays[ds]?.student === student` — markers are per-student
- nextSchoolDay(4, weekId) bridges Friday→Monday by adding 7 days to Monday of weekId
- Cascade writes in reverse order (last link first) — safe because chain is read into
  memory before any writes begin
- Success state: UploadSheet does NOT auto-close after apply; user closes manually
- DebugSheet z-index: 300 (above all other sheets at 200)
- Calendar emoji 📅 explicitly requested by Rob — exception to "no emoji in UI" rule
