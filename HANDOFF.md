# HANDOFF — v0.23.0 Phase 2 Academic Records data layer

## What was completed this session

Six-commit Phase 2 kickoff. Built the complete data layer for
Academic Records — folder scaffold, two constants files, and the
Firestore I/O module. **No UI, no components, no tab wiring.** The
foundation only. Next session can build hooks and components on top
of this without revisiting the data shape.

### Commit 1 — `feat: scaffold academic-records folder structure (v0.23.0)`

Created `packages/dashboard/src/tools/academic-records/` with four
empty subdirectories:
- `constants/`
- `firebase/`
- `hooks/`
- `components/`

Mirrors the planner tool's layout exactly. Empty folders aren't
trackable in git, so each got a `.gitkeep` placeholder. As real
files land in each folder, the corresponding `.gitkeep` is removed:
- Removed in commit 2: `constants/.gitkeep`
- Removed in commit 4: `firebase/.gitkeep`
- Still present (no files yet): `hooks/.gitkeep`, `components/.gitkeep`

### Commit 2 — `feat: add grading scales constants`

`packages/dashboard/src/tools/academic-records/constants/scales.js`
(26 lines, zero dependencies).

Three exported constants:
- `LETTER_SCALE` — 5-row array: A (90–100), B (80–89), C (70–79),
  D (60–69), F (0–59), each with `descriptor`.
- `ESNU_SCALE` — 4-row array: E / S / N / U with descriptors.
  No percentage thresholds (these are descriptive grades for
  skills/conduct/electives — no numeric mapping).
- `GRADING_TYPES` — `{ LETTER: 'letter', ESNU: 'esnu' }` enum
  object.

### Commit 3 — `feat: add academic records Firestore path builders`

`packages/dashboard/src/tools/academic-records/constants/academics.js`
(47 lines).

Modeled exactly on `tools/planner/constants/firestore.js`. Top-of-file
data-model comment block summarizes the entire schema.

**Path builders exported:**
- `schoolYearDoc(uid, yearId)`
- `quartersCol(uid, yearId)` + `quarterDoc(uid, yearId, quarterId)`
- `coursesCol(uid)` + `courseDoc(uid, courseId)`
- `enrollmentsCol(uid)` + `enrollmentDoc(uid, enrollmentId)`
- `gradesCol(uid)` + `gradeDoc(uid, gradeId)`

**Plain string constants exported:**
- `GRADING_TYPE_LETTER = 'letter'`
- `GRADING_TYPE_ESNU = 'esnu'`

These mirror the keys in `scales.js GRADING_TYPES` for code that
imports from `academics.js` and doesn't want to pull `scales.js`
just for the enum strings. Two source-of-truth values for the same
two strings — kept in sync manually. Documented inline.

**Schema design rationale (per data-model comment in the file):**
- `schoolYears/` and its `quarters/` subcollection are nested —
  a quarter only makes sense within a year.
- `courses/`, `enrollments/`, `grades/` are top-level per-user
  collections (NOT nested under schoolYears) so:
  - A course can be re-used across years without duplication.
  - A grade lookup doesn't need the year — `getGradesByEnrollment`
    is a single collection query.
  - Cross-references go by document id stored as fields
    (`enrollment.courseId`, `enrollment.yearId`, `grade.enrollmentId`,
    `grade.quarterId`).

### Commit 4 — `feat: add academic records Firestore read/write layer`

`packages/dashboard/src/tools/academic-records/firebase/academicRecords.js`
(183 lines — under the 300 hard limit, **no split needed**).

Modeled exactly on `tools/planner/firebase/planner.js`:
- Top-of-file comment block: pure I/O, no business logic, all
  paths from constants.
- Imports `db` from `@homeschool/shared`.
- Imports path builders from `../constants/academics.js`.
- Imports Firestore primitives from `firebase/firestore`.
- Each function preceded by a one-line JSDoc-style comment
  describing inputs, outputs, and any sort/filter behavior.

**Functions exported (16 total):**

School Years (3): `getSchoolYears`, `saveSchoolYear`, `deleteSchoolYear`
Quarters (3): `getQuarters`, `saveQuarter`, `deleteQuarter`
Courses (4): `getCourses`, `saveCourse`, `addCourse`, `deleteCourse`
Enrollments (4): `getEnrollments`, `saveEnrollment`, `addEnrollment`,
  `deleteEnrollment`
Grades (5): `getGrades`, `getGradesByEnrollment`, `saveGrade`,
  `addGrade`, `deleteGrade`

**Conventions baked in:**
- All `save*` functions use `setDoc` with `merge: true` and append
  `updatedAt: serverTimestamp()`. Caller can pass partial data
  without wiping other fields. Same pattern as planner's `updateCell`.
- All `add*` functions use `addDoc` and append
  `createdAt: serverTimestamp()`. They return the new document id.
- All `get*` functions return arrays of `{ id, ...data }` objects.
  Single-collection reads sort client-side (small data sets, all
  per-user, no scaling concerns).
- All `delete*` functions for parent-of-something documents
  (schoolYear / course / enrollment) include a comment noting the
  caller is responsible for cleaning up dependent records — no
  cascading deletes are performed automatically. The top-of-file
  comment block summarizes this rule.

**Sort orders (verbatim from spec):**
- `getSchoolYears`: by `startDate` ascending
- `getQuarters`: by `startDate` ascending
- `getCourses`: by `name` ascending
- `getEnrollments`: by `student` ascending, then `courseId` ascending
- `getGrades`: by `createdAt` ascending (Firestore Timestamp `.toMillis()`
  comparison; safe-defaulted to 0 for missing values)
- `getGradesByEnrollment`: no explicit sort (caller can sort by
  quarter if needed; small result set per enrollment)

### Commit 5 — `chore: bump version to v0.23.0`

- `packages/dashboard/package.json`:    0.22.12 → **0.23.0**
- `packages/shared/package.json`:       0.22.12 → **0.23.0**
- `packages/te-extractor/package.json`: 0.22.12 → **0.23.0**

Minor version bump per the spec — Phase 2 kickoff is a new feature
boundary, not a patch. Build verified clean at every commit
(`@homeschool/dashboard@0.23.0`, `@homeschool/te-extractor@0.23.0`).

---

## Spec deviation worth flagging

**`where` import added.** The spec's import list for
`academicRecords.js` did NOT include `where`, but
`getGradesByEnrollment(uid, enrollmentId)` requires a server-side
filter (`query(...) + where('enrollmentId', '==', enrollmentId)`)
to scale. Without it, the function would have to read every grade
in the collection and client-side filter — fine at session-1 size,
ugly at year-3 with hundreds of grades.

I added `where` to the imports and used `query/where` for that
single function. Every other read function uses a plain
`getDocs(collection(...))` per the spec.

If Rob prefers strict spec adherence, flip
`getGradesByEnrollment` to a client-side filter:
```js
const all = await getGrades(uid);
return all.filter(g => g.enrollmentId === enrollmentId);
```
And remove `where` from the import. One-line change.

---

## What was NOT built (intentionally)

Per spec: "Data layer only. No UI, no components, no tab changes."

- ❌ No hook files in `hooks/` (e.g., `useSchoolYears`,
  `useCourses`, `useEnrollments`, `useGrades`)
- ❌ No component files in `components/` (forms, lists, tables)
- ❌ `AcademicRecordsTab.jsx` still renders the Coming Soon
  placeholder — not wired to anything from this session
- ❌ No `cascadeDelete*` helpers — caller responsibility for now
- ❌ No grade computation utilities (percent → letter conversion)
- ❌ No CLAUDE.md updates documenting the new tool / data model

All deferred to next session(s).

---

## What is currently incomplete / pending

1. **Browser smoke test** — none required this session. The new
   files are not imported anywhere yet; runtime is unchanged.

2. **Suggested order for Phase 2 next session(s):**
   1. Hooks layer — `useSchoolYears`, `useCourses`,
      `useEnrollments`, `useGrades`. Live-subscription patterns
      can mirror planner's `useSubjects.js` (use `onSnapshot`
      instead of `getDocs` if real-time updates are needed).
      The current `academicRecords.js` only has one-time `getDocs`
      reads — `onSnapshot` versions can be added later or wrapped
      in hooks.
   2. CLAUDE.md update — add academic-records to the file-structure
      tree, document the data model under "Firestore data model",
      add a "Phase 2 — IN PROGRESS" entry under Tools status.
   3. Components layer — forms (school year, course, enrollment,
      grade entry), lists (year+quarter, courses, enrollments
      grouped by student/year, grade tables).
   4. Wire `AcademicRecordsTab.jsx` — replace the Coming Soon
      placeholder with the real layout.
   5. Cascading-delete UX — confirmation flows since the data
      layer doesn't cascade.

3. **Two-source-of-truth for grading-type strings.** `'letter'`
   and `'esnu'` appear in BOTH `scales.js` (as
   `GRADING_TYPES.LETTER` / `.ESNU`) AND `academics.js` (as
   `GRADING_TYPE_LETTER` / `GRADING_TYPE_ESNU`). Per spec, both
   are exported. Kept in sync manually for now. Could collapse to
   one in the future (re-export from one file).

4. **Carry-overs (untouched, still open):**
   - iPad portrait breakpoint decision
   - iPhone SE 300px grid overflow
   - Planner Phase 2 features (auto-roll, week history, copy last
     week, export PDF)
   - Import merge bug (inherited from v0.22.3)

---

## What the next session should start with

1. Read CLAUDE.md + HANDOFF.md (standard).
2. Confirm direction with Rob: hooks layer first (data shape locked),
   or jump to UI design discussion before building hooks.
3. Decide grade-string single-source-of-truth question (or accept
   the duplication for now).
4. CLAUDE.md sweep can happen before or after hooks — low-priority.

---

## Key file locations (created this session)

```
packages/dashboard/
├── package.json                                                    # v0.23.0
├── src/
│   └── tools/
│       └── academic-records/                                       # NEW tool folder
│           ├── components/
│           │   └── .gitkeep                                        # placeholder, removed when first component lands
│           ├── constants/
│           │   ├── scales.js                                       # NEW — 26 lines (LETTER_SCALE, ESNU_SCALE, GRADING_TYPES)
│           │   └── academics.js                                    # NEW — 47 lines (path builders + grading-type strings)
│           ├── firebase/
│           │   └── academicRecords.js                              # NEW — 183 lines (16 read/write functions)
│           └── hooks/
│               └── .gitkeep                                        # placeholder, removed when first hook lands
packages/shared/package.json                                        # v0.23.0
packages/te-extractor/package.json                                  # v0.23.0
```

Total: 3 source files created (256 lines combined), 1 new tool tree
scaffolded, 4 .gitkeep placeholders added (2 already removed),
3 package.json version bumps. No existing files modified beyond
package.json. No build regressions.
