# HANDOFF — v0.23.1 Phase 2 Session 2: Course Catalog UI

## What was completed this session

Five code commits landed on main covering the Course Catalog flow:
the `useCourses` hook, the `CourseCatalogSheet` bottom sheet, the
`AddEditCourseSheet` stacked editor, wiring into `AcademicRecordsTab`,
and the version bump. The HANDOFF commit timed out twice during the
original run; this prompt closes it out.

### Commit log (origin/main)

```
22f964c chore: bump version to v0.23.1
39db1c2 feat: wire course catalog into AcademicRecordsTab (v0.23.1)
296dadb feat: add AddEditCourseSheet with stacked sheet pattern
e56f4de feat: add CourseCatalogSheet
76da07b feat: add useCourses hook
```

### Commit 1 — `feat: add useCourses hook` (76da07b)

`packages/dashboard/src/tools/academic-records/hooks/useCourses.js`
(81 lines).

Wraps the four course functions from `firebase/academicRecords.js`
(`getCourses`, `addCourse`, `saveCourse`, `deleteCourse`) into a React
hook. Pattern matches the planner hooks: `useState` + `useEffect`
+ `useCallback`-wrapped mutators that call Firestore and then reload
the list so the UI stays in sync after every write.

Returns: `{ courses, loading, error, addCourse, updateCourse,
removeCourse }`. `addCourse` returns the new document id; the other
two mutators are fire-and-reload. All three throw on failure (so
callers can `await` and catch) AND set `error` state.

`hooks/.gitkeep` placeholder removed in this commit (first real
hook file landed).

### Commit 2 — `feat: add CourseCatalogSheet` (e56f4de)

- `components/CourseCatalogSheet.jsx` — 89 lines
- `components/CourseCatalogSheet.css` — 241 lines

Bottom sheet listing the user's course catalog. Mounts the
`useCourses(uid)` hook directly (no prop-drilling courses through
the parent — the hook owns the data). Fires `onEditCourse(course)`
or `onAddCourse()` to the parent, which decides whether to open
the AddEditCourseSheet.

Sheet chrome matches the AddSubjectSheet conventions: overlay +
slide-up panel + drag handle + ink header + scrollable body. Class
prefix `cc-` to avoid collisions with planner sheets. Sheet panel
animation is `@keyframes cc-sheet-up` (translateY 100% → 0, 0.3s
ease).

Course rows: 8px color dot (cycled through 8 brand-aligned hex
colors by index), course name (bold), curriculum (small muted text
if present), grading-type badge (gold-pale "Letter" or blue-tint
"E/S/N/U" with dark-mode override), chevron `›`. Empty state and
loading state both render as plain centered muted text.

`+ Add Course` button at the bottom matches `.planner-add-btn`
exactly (dashed border, hover turns gold).

z-index: **300** on `.cc-sheet-overlay`. Comment block at the top
of the CSS file documents the stacking contract with
AddEditCourseSheet.css.

Large-phone `@media (min-width: 400px) and (max-width: 1023px)`
block at the end scales up font sizes and padding. No
`@media (min-width: 1024px)` block — sheets behave the same on
desktop (per spec).

### Commit 3 — `feat: add AddEditCourseSheet with stacked sheet pattern` (296dadb)

- `components/AddEditCourseSheet.jsx` — 136 lines
- `components/AddEditCourseSheet.css` — 286 lines

Stacked bottom sheet for adding or editing one course. **New pattern
for this app** — sheets are stackable now. The catalog stays open
behind while the editor is up; closing the editor returns to the
catalog instead of dismissing both.

z-index contract:
- `.cc-sheet-overlay`  → 300 (catalog backdrop)
- `.aec-sheet-overlay` → 310 (editor backdrop, sits above catalog)
- `.aec-sheet`         → 311 (editor panel, sits above its own backdrop)

Both CSS files document this contract in their top comment block —
do not change without coordinating with the other.

Form fields:
- **Course Name** (required) — text input, 16px font-size to
  prevent iOS Safari auto-zoom on focus, autofocus on open
- **Curriculum** (optional) — text input, 16px
- **Grading Scale** (required) — two side-by-side toggle buttons:
  "Letter (A–F)" or "E / S / N / U". Selected state uses
  gold-pale background + gold border + gold text. Default is Letter.

Edit mode adds a small red text "Remove Course" button below the
fields. Tapping it inline-confirms ("Remove this course? This
cannot be undone." with Cancel + Confirm in a red-tint card). No
separate confirmation sheet — inline only.

Footer: Cancel (ghost) + Save (gold). Save disabled while name
is empty. Save fires `onSave({ name, curriculum, gradingType })`
with trimmed values; gradingType is `'letter'` or `'esnu'` from
`constants/academics.js`.

State re-seeds from props every time the sheet opens — passing in
a new `course` while the sheet is open will reset the form to that
course's values (works because `useEffect` watches `[open, course]`).

`components/.gitkeep` placeholder removed in this commit (first
real component file landed).

### Commit 4 — `feat: wire course catalog into AcademicRecordsTab (v0.23.1)` (39db1c2)

- `tabs/AcademicRecordsTab.jsx` — 123 lines (rewrote the
  Coming Soon placeholder; was 12 lines)
- `tabs/AcademicRecordsTab.css` — 132 lines (new)

Tab now renders:
- Header: title "Academic Records", subtitle "2025–2026" (hardcoded
  for now — will become dynamic when the school year UI lands)
- Quick Actions section with 5 vertical action rows:
  - 📚 Manage Course Catalog → opens CourseCatalogSheet
  - 👤 Manage Enrollments → disabled, "Soon" badge
  - 📥 Import Curriculum Data → disabled
  - 🗓️ Manage School Year & Quarters → disabled
  - 📄 Generate Report Card → disabled

Sheet state lives in this component:
- `catalogSheetOpen` — toggles CourseCatalogSheet visibility
- `addEditSheetOpen` — toggles AddEditCourseSheet visibility
- `editingCourse` — null in Add mode; course object in Edit mode

Handler logic per spec:
- Tap a course in catalog → `setEditingCourse(course)` +
  `setAddEditSheetOpen(true)` (catalog stays open behind)
- Tap "+ Add Course" → `setEditingCourse(null)` +
  `setAddEditSheetOpen(true)`
- `onSave`: if `editingCourse` exists call `updateCourse`, else
  `addCourse`; close editor only
- `onDelete`: call `removeCourse(editingCourse.id)`, close editor;
  catalog reloads itself via `useCourses` reload-after-write
- Closing the editor leaves the catalog open
- Closing the catalog closes both and clears `editingCourse`

**uid plumbing decision** — App.jsx renders
`<AcademicRecordsTab />` with no props (verified by reading
App.jsx in full). Two existing patterns in the codebase: HomeTab
calls `useAuth()` itself; SettingsTab takes `user` as a prop.
Followed HomeTab's pattern (`useAuth()` direct call) since it
requires zero changes to App.jsx. Spec said to stop and report
if App.jsx needed changes — by going with `useAuth()` directly,
no stop was needed.

### Commit 5 — `chore: bump version to v0.23.1` (22f964c)

- `packages/dashboard/package.json`:    0.23.0 → **0.23.1**
- `packages/shared/package.json`:       0.23.0 → **0.23.1**
- `packages/te-extractor/package.json`: 0.23.0 → **0.23.1**

Patch bump — Phase 2 Session 2 is incremental on the v0.23 line,
not a new feature boundary.

Build verified clean at every commit
(`@homeschool/dashboard@0.23.1`, `@homeschool/te-extractor@0.23.1`).

### HANDOFF retry note

The HANDOFF.md commit (commit 6 of the original 6-commit build
order) timed out twice during the original session. This prompt
is the third attempt. All five code commits landed and pushed
clean before the timeouts; only the docs commit was missing.
Push status confirmed before writing — origin/main is at
`22f964c chore: bump version to v0.23.1`.

---

## File size report (post-session)

All new files under 300 lines. None of the existing >200-line
files were touched.

| File | Lines |
|---|---|
| `hooks/useCourses.js` | 81 |
| `components/CourseCatalogSheet.jsx` | 89 |
| `components/CourseCatalogSheet.css` | 241 |
| `components/AddEditCourseSheet.jsx` | 136 |
| `components/AddEditCourseSheet.css` | 286 |
| `tabs/AcademicRecordsTab.jsx` | 123 |
| `tabs/AcademicRecordsTab.css` | 132 |

Closest to the limit is AddEditCourseSheet.css at 286 — comfortable
margin under 300, but worth watching if much more is added to that
file before splitting.

---

## What was NOT built (intentionally)

Per spec: "No grade entry, no enrollment, no report card yet."

- ❌ `useEnrollments`, `useGrades`, `useSchoolYears`, `useQuarters`
  hooks — not yet wired
- ❌ The other 4 quick-action buttons are visually disabled with
  "Soon" badges
- ❌ The "2025–2026" subtitle is hardcoded — will become dynamic
  when the school-year UI lands
- ❌ No deletion-cascade UX — the data layer documented earlier
  (deleteCourse won't cascade-delete enrollments) is still the
  caller's responsibility, but the editor doesn't warn about
  enrollments yet (no enrollment UI exists to dangle)
- ❌ No CLAUDE.md entries for the new tool yet — file structure,
  data model description for academics, etc.

---

## What is currently incomplete / pending

1. **Browser smoke test** — not run. Priority checks:
   - Open Academic Records tab → see header, subtitle "2025–2026",
     and 5 quick-action rows (1 enabled, 4 disabled with "Soon"
     badges).
   - Tap "Manage Course Catalog" → catalog sheet slides up.
   - Empty state on first load: "No courses yet…" message.
   - Tap "+ Add Course" → AddEditCourseSheet stacks on top
     (catalog still visible behind through its overlay tint).
     Confirm Letter is selected by default. Type a name + curriculum.
     Tap Save → editor closes, catalog reloads with the new course
     visible.
   - Tap an existing course → editor opens with form pre-filled.
     Change something, tap Save → row updates in catalog.
   - In editor, tap "Remove Course" → inline confirm appears in
     red tint card. Tap Cancel → reverts. Tap Confirm → editor
     closes, course gone from catalog.
   - On a wide phone (≥400px), confirm large-phone scaling
     applies (taller rows, larger fonts).
   - On iOS Safari, focus an input — confirm no auto-zoom
     (16px font-size guard should prevent it).
   - Confirm grading-type badge colors render correctly in both
     light and dark modes (E/S/N/U badge has a dark-mode override).

2. **CLAUDE.md drift** — academic-records tool tree, data model,
   and Phase 2 progress are not documented yet. Worth a sweep
   when convenient. Low priority — runtime unaffected.

3. **Carry-overs (untouched, still open):**
   - iPad portrait breakpoint decision (still falls into
     large-phone band)
   - iPhone SE 300px grid overflow
   - Planner Phase 2 features (auto-roll, week history, copy
     last week, export PDF)
   - Import merge bug (inherited from v0.22.3)

---

## What the next session should start with

1. Read CLAUDE.md + HANDOFF.md (standard).
2. Smoke test v0.23.1 — the full Course Catalog flow.
3. Begin **Phase 2 Session 3 — Enrollment UI**:
   - Likely scope: `useEnrollments` hook,
     EnrollmentListSheet (similar bottom sheet),
     AddEditEnrollmentSheet (stacked editor that picks a course +
     student + year), and a "Manage Enrollments" quick action
     becoming live in the tab.
   - Cascade-delete UX: when removing a course, warn if
     enrollments reference it; offer to delete them too OR
     keep them (orphan handling is a real UX question).
   - Decide whether to lift `useCourses` results into the tab
     and pass `courses[]` down to the enrollment editor (vs.
     remounting `useCourses` inside that sheet too).

---

## Key file locations (created/modified this session)

```
packages/dashboard/
├── package.json                                                    # v0.23.1
├── src/
│   ├── tabs/
│   │   ├── AcademicRecordsTab.jsx                                  # 123 lines (replaced 12-line placeholder)
│   │   └── AcademicRecordsTab.css                                  # NEW — 132 lines
│   └── tools/academic-records/
│       ├── components/
│       │   ├── CourseCatalogSheet.jsx                              # NEW — 89 lines
│       │   ├── CourseCatalogSheet.css                              # NEW — 241 lines (z-index 300)
│       │   ├── AddEditCourseSheet.jsx                              # NEW — 136 lines
│       │   ├── AddEditCourseSheet.css                              # NEW — 286 lines (z-index 310/311)
│       │   └── (.gitkeep)                                          # REMOVED in commit 2
│       └── hooks/
│           ├── useCourses.js                                       # NEW — 81 lines
│           └── (.gitkeep)                                          # REMOVED in commit 1
packages/shared/package.json                                        # v0.23.1
packages/te-extractor/package.json                                  # v0.23.1
```

Total new-file additions: 7 source files (1088 lines combined),
2 `.gitkeep` placeholders removed (folders now have real files).
1 existing file rewritten (AcademicRecordsTab.jsx). 3 package.json
version bumps. App.jsx untouched (used `useAuth()` direct-call
pattern).
