# HANDOFF — Session ending 2026-04-14 (eleventh session)

## What was completed this session

### Planner v0.21.1 — 10 fixes applied (Fix 6 was CSS-verified, no code change needed)

**Fix 1 — All Day Event banner no longer disappears (commit 50397c8)**
Removed `setDayData({})` from the `useSubjects` cleanup function.
The blank reset was causing `__allday__` to vanish while the Firestore
subscription rebuilt (especially noticeable in React StrictMode).
Stale data now persists until the new snapshot arrives.

**Fix 2 — Desktop sidebar always #22252e dark (commit acdd40f)**
`DayStrip.css` desktop media query: replaced `var(--bg-surface)` and theme
vars with hardcoded dark values — `#22252e` background, white-tinted text,
gold active states, semi-transparent borders. Sidebar looks correct in both
light and dark mode.

**Fix 3+4+5 (commit 72a48cc)**
- Fix 3: Desktop header logo bumped to 42px, school name fonts 14/12px, left
  padding 20px on header-top.
- Fix 4: `.planner-subjects` desktop grid now has `gap: 14px`.
- Fix 5: Desktop day-title header added — "Monday, April 13" h2 + "X subjects ·
  Y completed" subtitle + "+ Add" button right-aligned. Hidden on mobile via
  `display: none` base rule. Bottom padding bumped to 100px on desktop.

**Fix 6+7+8 (commit bf93f0a)**
- Fix 6: Mobile today gold underline was already correct in CSS — verified only.
- Fix 7: `.header-btn` font-family now includes Apple Color Emoji + Segoe UI Emoji
  so emoji (📅 calendar) renders properly instead of grey boxes.
- Fix 8: `justify-content: space-between` added to `.header-top` so action icons
  are right-aligned on mobile.

**Fix 9 — Desktop action bar layout (commit 9f35359)**
At ≥768px: buttons lose `flex: 1` stretch, import button gets `margin-left: auto`
to push it to the right. Sick Day + Clear Week stay left.

**Fix 10 — SubjectCard: done pill removed (commit 4fb8141)**
Removed the "Mark done" pill button. Replaced with a subtle "Tap to edit" hint
(11px, weight 300, var(--text-muted)) visible only when the card is not done.
Done state is still toggled via the edit sheet. Removed `onToggleDone` from
SubjectCard props + cleaned up done-btn CSS.

**Fix 11 — Version bump + CLAUDE.md update (this commit)**
planner + dashboard package.json → 0.21.1
CLAUDE.md phase entry 28 added.

---

## Current state

All commits on `claude/read-claude-docs-er59m` branch.
Branch is ahead of main — push and merge to main for Netlify to deploy.

---

## What to do first next session

### 1. Push + merge this branch to main
```
git push -u origin claude/read-claude-docs-er59m
```
Then merge to main (or Rob merges via GitHub).

### 2. Smoke-test v0.21.1 end-to-end
**All Day Event:**
- Add an All Day Event → banner should persist (no flash/disappear)
- Re-tap + Add Subject → "Edit All Day Event ›" should appear

**Desktop layout (open at ≥768px):**
- Sidebar is dark (#22252e), student pills gold-highlighted, day names white-tinted
- Header: logo is noticeably larger, school text bigger, icons right-aligned
- Card grid fills with gap between cards
- Day header visible at top of content: "Monday, April 13" + "X subjects · Y completed" + "+ Add" button
- Action bar: Sick Day + Clear Week on left, Import on right
- Subject cards show "Tap to edit" hint instead of done pill; cards are clean

**Mobile layout (unchanged):**
- Today's day shows gold underline (confirm not overridden)
- Header icons right-aligned
- Emoji calendar icon renders (not grey box)

### 3. Pending smoke-test from v0.21.0
- Import second PDF with "Replace existing schedule" toggle OFF —
  confirm existing done/note data is preserved (import merge mode)

### 4. Verify Firestore security rules (still unchecked from session 9)
Confirm rules allow reads/writes to `/users/{uid}/teExtractor/extractions/items/{docId}`.
See session 9 handoff for the exact rule to add if missing.

---

## Known incomplete / not started

- Subject count badges in desktop sidebar DayStrip NOT implemented — requires subscribing
  to all 5 days simultaneously. To implement: add `weekSubjectCounts` state to
  `useSubjects.js` that subscribes to all 5 days and returns `{ 0: N, 1: N, ... }`,
  then pass through PlannerLayout → DayStrip.

- reward-tracker: not migrated

- Academic Records: coming-soon placeholder only

- app.js in te-extractor is ~970+ lines — violates 300-line limit; natural split points:
  extraction logic, history, debug log, progress indicator, PDF splitter
