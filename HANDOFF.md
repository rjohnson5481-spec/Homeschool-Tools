# HANDOFF — v0.26.3 Fix Weeks Export via collectionGroup

## What was completed this session

2 code commits + this docs commit on `main`:

```
3ca4c2e chore: bump to v0.26.3
51dfce5 fix: use collectionGroup subjects query for weeks export (v0.26.3)
```

### Commit 1 — collectionGroup fix (`51dfce5`)

**firebase/backup.js (166→165 lines):**
- Root cause: `users/{uid}` doesn't exist as a Firestore document (only as a path), so `getDocs(collection(db, 'users/{uid}/weeks'))` returns zero results.
- Fix: replaced the weeks traversal with `collectionGroup(db, 'subjects')` — a collection group query that finds ALL `subjects` documents across the database. Results are filtered client-side by checking `path.startsWith('users/${uid}/weeks/')`. WeekId, student, dayIndex, and subject are parsed from the document path.
- Removed the v0.26.2 console.log diagnostic.
- Added `collectionGroup` to the firebase/firestore import.

**Note**: collectionGroup queries require a Firestore index. If the query fails with an index error, create a composite index on the `subjects` collection group in the Firebase console. Single-field collection group indexes are usually auto-created, but verify in production.

### Commit 2 — Version bump (`3ca4c2e`)
0.26.2 → **0.26.3** across all 3 packages.

Build green.

---

## What the next session should start with

1. Deploy to Netlify, run export, verify weeks array is populated in the JSON file.
2. If a Firestore index error appears, create the required index in Firebase console.

## Key file locations

```
packages/dashboard/src/firebase/
└── backup.js                              # 166 → 165
```
