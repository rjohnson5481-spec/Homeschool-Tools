# HANDOFF — v0.27.9 Unified Restore Flow (Session A)

## What was completed this session

4 code commits + this docs commit on `main`. This is Session A of two — diff engine + mobile diff review screen + DataBackupSection changes. Session B will build the desktop diff view and finalize wiring.

```
da79f0f chore: bump version to v0.27.9
2dfa528 feat: DataBackupSection — Restore from Backup + Factory Reset Restore
8586843 feat: RestoreDiffSheet mobile diff review screen
0caccaf feat: backup diff engine — generateRestoreDiff + applyRestoreDiff (v0.27.9)
```

### Commit 1 — Diff engine (`0caccaf`)
File: `packages/dashboard/src/firebase/backup.js` (+77 lines, existing exports untouched)

Two new exports appended after `importFullRestore`:

- **`generateRestoreDiff(uid, backup)`** → `{ [weekId]: { [dayIndex]: [items] } }`
  - Reads every live subject doc under this uid via `collectionGroup('subjects')` + prefix filter (same pattern `exportAllData` and `importFullRestore` already use).
  - Walks `backup.data.weeks` and classifies each cell: `NEW` (not in Firestore), `MATCH` (both lesson and note identical), `CHANGED` (exists but lesson or note differs).
  - Any live doc not covered by the backup is emitted as `DELETE`.
  - Each item: `{ subject, student, status, backup, current, checked }`. `checked` defaults `true` for NEW/CHANGED/DELETE, `false` for MATCH (MATCH is a no-op).

- **`applyRestoreDiff(uid, diff)`** → `{ applied }`
  - Walks the nested diff. For checked non-MATCH items: NEW/CHANGED → `setDoc` with `item.backup`; DELETE → `deleteDoc`. Runs all ops in parallel via `Promise.all`.

### Commit 2 — RestoreDiffSheet mobile sheet (`8586843`)
Files: `packages/dashboard/src/firebase/RestoreDiffSheet.jsx` (197 lines), `RestoreDiffSheet.css` (262 lines)

Note: the user spec requested the component live in `src/firebase/` (colocated with `backup.js`) rather than the usual tabs/ or components/ tree. Followed literally.

- Bottom slide-up modal, 92vh tall, Ink & Gold surface colors.
- Header bar — hardcoded `#22252e`, shows backup filename + summary (`X conflicts · Y days unchanged · tap a day to review`).
- Multi-week warning banner (gold-pale) appears only when the diff spans >1 week.
- Accordion per day that has at least one non-MATCH item (MATCH-only days are hidden from the body but counted in `Y days unchanged`).
- Day header: day name + date, subject count, conflict/no-conflicts badge, chevron. Conflicted days are expanded by default; no-conflict days collapsed.
- Subject rows: gold checkbox (placeholder for MATCH), subject + student, lesson text variant per status:
  - NEW → backup lesson + green `new` tag
  - CHANGED → backup lesson + gold `backup` tag, then current lesson + grey `current` tag
  - MATCH → single lesson line + grey `match` tag, no checkbox
  - DELETE → current lesson + red `will delete` tag, subject name rendered in `var(--red)`
- Footer: Cancel + Restore Selected. Restore clones the incoming diff with the local `checked` state, calls `applyRestoreDiff`, and closes on success.
- All colors via CSS variables (`--gold`, `--text-primary`, `--border`, etc.) except `#22252e` on the header per the brand rule. Dark-mode green overrides scoped via `[data-mode="dark"]`. Lexend inherited globally.

CSS trimmed from a 323-line first draft to 262 lines by consolidating rules (single-line declarations for small utilities, collapsed blank lines) — still split-ready if it grows. No new file was added; everything stayed in the two specified files.

### Commit 3 — DataBackupSection updates (`2dfa528`)
File: `packages/dashboard/src/tabs/DataBackupSection.jsx` (120 → 124 lines)

- **Removed** the Import & Merge row entirely along with its `handleMergeFile` handler, `mergeResult` state, and `mergeRef`.
- **Added** a "Restore from Backup" row (🔄 icon, ghost Choose File button). File pick → `generateRestoreDiff(uid, backup)` → opens `<RestoreDiffSheet>`. State: `diffData = { filename, diff }`.
- **Relabeled** Full Restore → "Factory Reset Restore" everywhere (row title, two modal titles, button label "Factory Reset"). Reuses existing `.st-row--danger` + `.st-row-title--danger` classes (already defined in `SettingsRow.css`) plus an inline `boxShadow: inset 3px 0 0 var(--red)` left-accent bar on the row and an inline `1.5px solid var(--red)` border on the button. Warning text still uses the existing `.db-danger-sub` class.
- Two-step confirmation (⚠️ warning → type RESTORE → file pick) preserved exactly. The file pick still calls `importFullRestore` unchanged.
- No edit to `DataBackupSection.css` — it wasn't in the allowed-files list for this session. Red-border styling uses existing classes + minimal inline styles.

### Commit 4 — Version bump (`da79f0f`)
0.27.8 → **0.27.9** across dashboard, shared, te-extractor.

---

## What Session B needs to build

**Desktop diff view** for the same restore flow. The mobile sheet renders as a bottom slide-up modal at all widths right now — on desktop (≥1024px) it should become a side panel / split view instead (design to be decided Session B).

**Final wiring** candidates Session B should consider:
- Busy/loading state in `DataBackupSection` while `generateRestoreDiff` runs (currently only shows `busy` on the button label; a small spinner or toast may help for large backups).
- Success toast or row-level success message after `applyRestoreDiff` returns — right now the sheet just closes.
- Confirmation before `Restore Selected` if many DELETE items are checked, so a tap-through can't silently destroy a lot of data.
- Surface `generateRestoreDiff` / `applyRestoreDiff` errors — current sheet logs to `console.warn` and leaves busy=false; no user-facing error state.

**Known gaps still carried from v0.27.8** (not touched this session):
- Diff engine only compares weekly subject cells — it does NOT diff schoolYears, courses, enrollments, grades, reportNotes, activities, savedReports, sickDays, subjectPresets, rewardTracker, or settings/students. Session B should decide whether to extend the diff to those surfaces or keep the new flow planner-only.
- `settings/students` is still never deleted by `importFullRestore` when the backup is missing that key (pre-existing issue).

## What the next session should start with

1. Read CLAUDE.md + HANDOFF.md.
2. Smoke test the new mobile flow on a real backup file: Export → edit some lessons in Firestore → Restore from Backup → expand a day with conflicts → uncheck one item → Restore Selected → verify only the checked items changed in Firestore.
3. Design and build the desktop diff layout (probably an inline view inside the Settings tab content column rather than a modal, using the same `applyRestoreDiff` API).

## Key file locations

```
packages/dashboard/src/firebase/backup.js                       # +generateRestoreDiff +applyRestoreDiff
packages/dashboard/src/firebase/RestoreDiffSheet.jsx            # NEW — 197 lines, mobile diff review
packages/dashboard/src/firebase/RestoreDiffSheet.css            # NEW — 262 lines, sheet styles
packages/dashboard/src/tabs/DataBackupSection.jsx               # Import&Merge removed; Restore/Factory rows added
packages/dashboard/package.json                                 # 0.27.9
packages/shared/package.json                                    # 0.27.9
packages/te-extractor/package.json                              # 0.27.9
```
