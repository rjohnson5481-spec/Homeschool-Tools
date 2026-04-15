# HANDOFF — v0.22.11 CSS file splits (2 of 5)

## What was completed this session

Four-commit refactor session knocking out the two smallest over-300-line
CSS files. Both drop under the hard limit; three splits remain for a
later session.

### Commit 1 — `refactor: split HomeHeader.css from HomeTab.css (v0.22.11)`

**Files touched (3):**
- `packages/dashboard/src/tabs/HomeHeader.css` — NEW, 34 lines
- `packages/dashboard/src/tabs/HomeTab.css` — 324 → 266 lines
- `packages/dashboard/src/tabs/HomeTab.jsx` — +1 import line

**What moved:** Only the live brand-header rules (`.home-header`,
`.home-header-brand`, `.home-header-logo`, `.home-header-name`,
`.home-header-accent`) — exactly what `HomeTab.jsx:28-36` actually renders.

**What got deleted outright:** `.home-header-actions` and
`.home-header-btn` (+ `:hover`) — approximately 22 lines of dead CSS
that have had no JSX since v0.22.6 when the right-side icon buttons
were removed. Not moved to HomeHeader.css; removed from the codebase.
Flagged as dead in the v0.22.10 diagnostic.

**Comments cleaned up:**
- Old line 1: `Outer wrapper — no padding; header is full-width` →
  new: `Outer wrapper`. The "header is full-width" phrase was stale
  (the outer wrapper never styled the header — it just contained it).
- Old line 7: `Brand header — dark bar with dark mode toggle + sign-out`
  → deleted with the block. In HomeHeader.css it becomes
  `Brand header — dark bar with logo + school name (mobile only)`,
  which matches the v0.22.6 reality.

**@media blocks:** Left entirely untouched in HomeTab.css per spec.
The desktop `@media (min-width: 1024px)` block still contains
`.home-header { display: none }` — that rule targets a class now
defined in HomeHeader.css, but CSS cascade works on the rendered
element, not on file origin, so it's fine. Both files are imported
by HomeTab.jsx in the same render so the cascade resolves correctly.

**Import order in HomeTab.jsx:** `HomeTab.css` first, then
`HomeHeader.css` immediately below. Base styles load in deterministic
order; the desktop `display: none` override in HomeTab.css still fires
because `@media` rules layer on top regardless of file source order.

### Commit 2 — `refactor: split UploadResult.css from UploadSheet.css`

**Files touched (3):**
- `packages/dashboard/src/tools/planner/components/UploadResult.css`
  — NEW, 89 lines
- `packages/dashboard/src/tools/planner/components/UploadSheet.css`
  — 333 → 247 lines
- `packages/dashboard/src/tools/planner/components/UploadSheet.jsx`
  — +1 import line

**What moved to UploadResult.css:**
- Result-preview block (lines 183–246 of the old file): `result-meta`,
  `divider`, `lesson-list`, `day-group` (+ `:last-child`), `day-header`,
  `lesson-row`, `lesson-subject`, `lesson-num`, `result-footer`.
- View Log button (lines 248–262 of the old file): `.upload-sheet-log-btn`
  + `:hover`. Moved because it only renders after a parsed result.
- Scoped slice of the large-phone `@media (min-width: 400px) and
  (max-width: 1023px)` block — specifically the 5 result/log overrides
  (`result-meta`, `day-header`, `lesson-row`, `lesson-num`,
  `result-footer`). A dedicated @media block was created in
  UploadResult.css for these.

**What stayed in UploadSheet.css:**
- Backdrop, sheet panel + slide-up + handle, ink header, body
  container, file picker zone, wipe toggle, parsing spinner, error
  pill, success banner, footer with cancel + import/apply buttons.
- The large-phone @media block with the remaining 11 rules
  (title, body, file-hint, filename, wipe-row, spinner-row, error,
  success, footer, cancel, import/apply).

**No `@media (min-width: 1024px)` block existed in this file — so
nothing desktop-related to worry about.**

**Import order in UploadSheet.jsx:** `UploadSheet.css` first, then
`UploadResult.css`. No cascade concerns — the two files have disjoint
selectors.

### Commit 3 — `chore: bump version to v0.22.11`

- `packages/dashboard/package.json`:    0.22.10 → 0.22.11
- `packages/shared/package.json`:       0.22.10 → 0.22.11
- `packages/te-extractor/package.json`: 0.22.10 → 0.22.11

Build verified clean at every commit
(`@homeschool/dashboard@0.22.11`, `@homeschool/te-extractor@0.22.11`).

---

## File size report (post-session)

| File | Before | After | Status |
|---|---|---|---|
| HomeTab.css | 324 | **266** | ✅ under 300 |
| UploadSheet.css | 333 | **247** | ✅ under 300 |
| HomeHeader.css | — | 34 | ✅ new, tiny |
| UploadResult.css | — | 89 | ✅ new, tiny |

### Still over 300 (three files remain — next split session)

| File | Lines | Suggested split (per v0.22.10 diagnostic) |
|---|---|---|
| AddSubjectSheet.css | 408 | Extract day-picker (day pills + per-day details, 78 lines) → ~330 |
| SettingsTab.css | 376 | Extract Default Subjects sub-section (63 lines) → ~313; second split of row styles (122 lines) brings it under 200 |
| PlannerLayout.css | 360 | Extract Undo Sick Day sheet (99 lines) → ~261. Largest single win; the sheet is fully self-contained |

All three have suggested seams documented in the diagnostic. Easy next
session.

---

## What is currently incomplete / pending

1. **Browser smoke test** — not run. Priority checks:
   - HomeTab renders correctly on mobile (brand header bar at top, all
     the same). HomeHeader.css carries the styles now; verify by
     toggling dark mode (header should stay `#22252e` — still does).
   - Desktop `@media (min-width: 1024px) { .home-header { display: none } }`
     still hides the header above 1024px (rule still lives in HomeTab.css).
   - UploadSheet result preview renders correctly after a successful
     parse: meta line, per-day groups with bold day headers, indented
     lesson rows, result footer, View Log button.
   - Large-phone (400–1023px) overrides for result preview still apply:
     meta 15px, day-header 14px, lesson-row 14px, lesson-num 13px,
     result-footer 13px.

2. **Three CSS files still over 300 lines** — see table above.

3. **Dead CSS deleted this session:** 22 lines of unused
   `.home-header-actions` + `.home-header-btn` + `:hover` removed
   from HomeTab.css. Not a regression — there was no JSX for these
   since v0.22.6.

4. **Carry-overs from earlier sessions (untouched this session):**
   - iPad portrait breakpoint decision (still falls into large-phone band)
   - iPhone SE 300px grid overflow
   - Planner Phase 2 features (auto-roll, week history, copy last week, export PDF)
   - Academic Records tab (Coming Soon placeholder)
   - Import merge bug (inherited from v0.22.3)
   - CLAUDE.md DEAD-file entries — now stale since v0.22.10 deleted the
     eight files they describe. Low priority.

---

## What the next session should start with

1. Read CLAUDE.md + HANDOFF.md (standard).
2. Browser smoke test v0.22.11 — HomeTab and UploadSheet post-parse
   preview.
3. Pick the next split: biggest win is PlannerLayout.css (extract
   Undo Sick Day sheet, 99 lines) or AddSubjectSheet.css (extract
   day picker, 78 lines). SettingsTab.css is the largest but needs
   two splits to get under 200.

---

## Key file locations (touched this session)

```
packages/dashboard/
├── package.json                                                    # v0.22.11
├── src/
│   ├── tabs/
│   │   ├── HomeTab.jsx                                             # + import './HomeHeader.css'
│   │   ├── HomeTab.css                                             # 324 → 266 (split + 22 dead lines removed)
│   │   └── HomeHeader.css                                          # NEW — 34 lines
│   └── tools/planner/components/
│       ├── UploadSheet.jsx                                         # + import './UploadResult.css'
│       ├── UploadSheet.css                                         # 333 → 247 (split)
│       └── UploadResult.css                                        # NEW — 89 lines
packages/shared/package.json                                        # v0.22.11
packages/te-extractor/package.json                                  # v0.22.11
```

Total: 6 files touched (2 created, 2 edited + slimmed, 2 imports
added), plus 3 package.json version bumps. Net diff: two files split
cleanly, two files under the limit, 22 lines of dead CSS purged.
