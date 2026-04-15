# HANDOFF — v0.22.12 CLAUDE.md sync

## What was completed this session

No code changes. Single-file documentation session: applied 11
surgical edits to CLAUDE.md to remove all stale entries left over
from the v0.22.10–v0.22.12 cleanup work, add the seven new split
CSS files to the file-structure trees, and bump the version
references from v0.22.9 → v0.22.12.

### Edits applied (11)

1. **Current version line** — added `Current version: v0.22.12`
   as line 2 of CLAUDE.md, immediately under the title. Single
   source of truth at the top of the file.

2. **Planner tree — RETIRED SettingsSheet entries** — deleted
   `SettingsSheet.jsx` and `SettingsSheet.css` rows from the planner
   `components/` tree. Both files were deleted from disk in
   v0.22.10; the "RETIRED v0.22.6 — kept on disk" notes were stale.

3. **Planner tree — stale line counts** — stripped the
   "(NNN lines — over 300 limit, pending split)" annotations from
   `PlannerLayout.css`, `UploadSheet.css`, and `AddSubjectSheet.css`.
   All three files are now under 300 (260, 247, 215 respectively).

4. **Planner tree — added 4 new split files** placed adjacent to
   their parents (matching the existing tree's logical clustering
   convention rather than strict alphabetical, since the existing
   tree wasn't alphabetical):
   - `UndoSickSheet.css` (99 lines) right after `PlannerLayout.css`
     (it's the embedded sub-sheet split out from PlannerLayout)
   - `UploadResult.css` (89 lines) right after `UploadSheet.css`
   - `AddSubjectSheetChrome.css` (113 lines) right after `AddSubjectSheet.css`
   - `AddSubjectDayPicker.css` (87 lines) right after Chrome
   - The trailing `└── DebugSheet.css` line was re-anchored as the
     final entry (last `└── ` connector) since SettingsSheet was the
     previous final entry.

5. **Dashboard shell tree — DEAD entries** — deleted six lines
   (`ToolCard.jsx`/`.css`, shell-level `Header.jsx`/`.css`, shell-level
   `Dashboard.jsx`/`.css`). All six files were deleted from disk in
   v0.22.10. The planner's live `Header.jsx`/`.css` (in
   `tools/planner/components/`) was preserved — different directory.
   The trailing `└── ` connector on `SignIn.css` was updated since it
   became the new last entry in `components/`.

6. **Dashboard shell tree — stale line counts** — stripped
   "(NNN lines — over 300 limit)" from `HomeTab.css` and
   `SettingsTab.css`. Both now under (266 and 185).

7. **Dashboard shell tree — trailing stale note** — deleted the
   line "Dead files (ToolCard/Header/Dashboard) will be deleted in
   a cleanup session." That cleanup was completed in v0.22.10.

8. **Dashboard shell tree — added 3 new split files** in
   `tabs/`, adjacent to their parents:
   - `HomeHeader.css` (34 lines) right after `HomeTab.css`
   - `SettingsRow.css` (130 lines) right after `SettingsTab.css`
   - `SettingsSubjects.css` (63 lines) right after `SettingsRow.css`
   - The final `└── ` connector was re-anchored on `SettingsSubjects.css`.

9. **Tools status header** — bumped `(v0.22.9)` → `(v0.22.12)`.
   Also updated the dashboard entry inline reference from
   "unified app shell at v0.22.9" → "v0.22.12".

10. **CSS files over 300 lines list** — replaced the entire 8-line
    block (intro + 5 file rows + 2-line trailing note) with a single
    two-line current-state note: "All CSS files in
    packages/dashboard/src/ are currently under 300 lines. The split
    was completed across v0.22.11 and v0.22.12."

11. **Key decisions — SettingsSheet** — updated the parenthetical
    from "(disconnected but kept on disk pending deletion)" to
    "and deleted in v0.22.10". Reflects current reality.

### Deliberately preserved (historical context, not stale)

- Line 239 — `v0.22.9 to give wide phones (Galaxy S25 Ultra 412px,
  Pixel 8 Pro etc.) a native-app feel.` This is in the "Mobile
  layout — base styles" section describing when large-phone scaling
  was added. Historical, accurate.
- Line 534 — `### Phase 1 — ✅ COMPLETE at v0.22.9` in the
  project-wide Phase roadmap. Phase 1 was indeed declared complete
  at v0.22.9; v0.22.10–v0.22.12 are post-Phase-1 cleanup. Leaving
  the "completed at v0.22.9" anchor preserves the actual milestone.
- All planner Phase-1 log entries (v0.19.0 through v0.22.2). Pure
  history.
- `**Layout (current, v0.22+)**` design-system subsection. Still
  accurate — v0.22.12 is in the v0.22 series.

### Net diff

CLAUDE.md: 785 → 777 lines (-8). Net: 20 insertions, 28 deletions.
The over-300 list block trim and the six DEAD entries account for
most of the deletions; the seven new split files account for most
of the insertions.

---

## Verification

After the edits, grepped CLAUDE.md for every stale marker the audit
flagged (`DEAD`, `RETIRED`, `over 300`, `pending split`, `kept on
disk pending`, `will be deleted`, the five stale parenthetical line
counts, `v0.22.9` in the Tools status section). All stale matches
gone — only the two intentional historical references remain (lines
239 and 534, both flagged above).

Also verified all 7 new split files are now in the trees:
- `UndoSickSheet.css` (192), `UploadResult.css` (203),
  `AddSubjectSheetChrome.css` (206), `AddSubjectDayPicker.css` (207)
- `HomeHeader.css` (421), `SettingsRow.css` (428),
  `SettingsSubjects.css` (429)
- `Current version: v0.22.12` (line 2)

---

## What is currently incomplete / pending

1. **Browser smoke test** — none required this session. CLAUDE.md is
   docs-only; runtime unaffected.

2. **Carry-overs (untouched, still open):**
   - iPad portrait breakpoint decision (still falls into large-phone band)
   - iPhone SE 300px grid overflow
   - Planner Phase 2 features (auto-roll, week history, copy last week, export PDF)
   - Academic Records tab (Coming Soon placeholder)
   - Import merge bug (inherited from v0.22.3) — still not documented
     in CLAUDE.md, only in HANDOFF chain. Optional future addition.

3. **No version bump this session** — CLAUDE.md sync is docs-only;
   the live version stays at v0.22.12 (the version stamped in
   CLAUDE.md's new top line).

---

## What the next session should start with

1. Read CLAUDE.md + HANDOFF.md (standard). CLAUDE.md is now fully
   current — file trees match disk, version stamps consistent at
   v0.22.12, no stale "DEAD" or "over 300" markers remain.
2. Decide direction: feature work (Academic Records, planner Phase 2,
   TE Extractor React rewrite) vs. carry-over hygiene (iPad portrait
   breakpoint decision, iPhone SE grid overflow, import merge bug).

---

## Key file locations (touched this session)

```
CLAUDE.md     # 11 surgical edits — version stamp, both file trees, over-300 block, key-decisions parenthetical
HANDOFF.md    # this file
```

No source files were modified. No build needed. No version bump.
