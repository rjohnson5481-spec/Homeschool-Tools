# HANDOFF — v0.27.0 PDF Import Diff Preview

## What was completed this session

4 code commits + this docs commit on `main`:

```
1efe46e chore: bump to v0.27.0
55fc7fa feat: wire diff preview confirm into PlannerLayout
e7a04c8 feat: import diff preview with New/Changed/Unchanged badges
430db79 feat: add compareWithExisting diff logic to usePdfImport (v0.27.0)
```

### Commit 1 — Diff logic (`430db79`)
**usePdfImport.js** (96→111 lines): Added `compareWithExisting(parsedData, existingData)` — compares each parsed cell against Firestore data, returns `{ dayIndex, subject, lesson, status }` array where status is `'new'`, `'changed'`, or `'unchanged'`.

### Commit 2 — Diff preview UI (`e7a04c8`)
- **UploadSheet.jsx** (177→149 lines): Removed wipe toggle + all wipe state. "Apply to Week" → "Review Changes". Added `diff` state + `onConfirmImport` prop. Shows ImportDiffPreview when diff is set.
- **ImportDiffPreview.jsx** (49 lines, NEW): Review Changes screen with per-cell badges (NEW green, CHANGED gold, UNCHANGED muted). Days with only unchanged cells hidden. Footer: "N new · N changed · N unchanged". Cancel returns to parse preview, Confirm Import writes.
- **ImportDiffPreview.css** (33 lines, NEW): Badge colors, row layout, actions.

### Commit 3 — PlannerLayout wiring (`55fc7fa`)
**PlannerLayout.jsx** (347→353 lines): `handleApplySchedule` now reads existing cells via `readCell` for each parsed subject+day, calls `compareWithExisting`, passes diff to UploadSheet via callback. `handleConfirmImport` writes only new/changed cells. Removed all wipe logic.

### Commit 4 — Version bump (`1efe46e`)
0.26.3 → **0.27.0** across all 3 packages.

Build green.

---

## New import flow

Parse PDF → **Review Changes** (diff preview with badges) → **Confirm Import** (writes only new + changed cells)

No more "Replace existing schedule" wipe toggle. The diff preview makes it clear what will be written.

---

## File-size report

| File | Lines |
|---|---|
| `usePdfImport.js` | 111 |
| `UploadSheet.jsx` | 149 |
| `ImportDiffPreview.jsx` | 49 |
| `ImportDiffPreview.css` | 33 |
| `PlannerLayout.jsx` | 353 |

**Warning**: PlannerLayout.jsx at 353 lines — needs split next session.

---

## What the next session should start with

1. Read CLAUDE.md + HANDOFF.md.
2. Smoke test: import PDF → see Review Changes with badges → Confirm → verify only new/changed cells written.
3. Priority: split PlannerLayout.jsx (353 lines, over 300 limit).

## Key file locations

```
packages/dashboard/src/tools/planner/
├── hooks/usePdfImport.js                    # 96 → 111
└── components/
    ├── UploadSheet.jsx                      # 177 → 149
    ├── ImportDiffPreview.jsx                # NEW — 49
    ├── ImportDiffPreview.css                # NEW — 33
    └── PlannerLayout.jsx                    # 347 → 353
```
