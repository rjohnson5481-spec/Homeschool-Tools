# HANDOFF — v0.27.2 Scheduled Firestore Backup

## What was completed this session

4 code commits + this docs commit on `main`:

```
7df7f02 chore: bump to v0.27.2
2a2de46 chore: configure netlify functions bundler
d28f434 feat: add 6-hour scheduled Firestore backup to Netlify Blobs (v0.27.2)
f5cd64c chore: add @netlify/functions and firebase-admin dependencies
```

### Commit 1 — Dependencies (`f5cd64c`)
Added `@netlify/functions` 2.8.1 and `firebase-admin` 12.1.0 to root package.json (exact versions).

### Commit 2 — Scheduled backup (`d28f434`)
**netlify/functions/scheduled-backup.js** (113 lines, NEW):
- Netlify scheduled function running every 6 hours (`0 */6 * * *`).
- Discovers all user UIDs via collectionGroup queries across 10 collection types.
- For each user: reads all 13 Firestore collections (same structure as client-side `exportAllData`), including nested subcollections (quarters, breaks, reward log, week/day/subjects).
- Saves timestamped JSON to Netlify Blobs `backups` store.
- Uses Firebase Admin SDK with `FIREBASE_SERVICE_ACCOUNT` env var (already set in Netlify dashboard).
- Error handling: try/catch logs errors, returns 500 on failure.

### Commit 3 — Netlify config (`2a2de46`)
Added `[functions] node_bundler = "esbuild"` to netlify.toml.

### Commit 4 — Version bump (`7df7f02`)
0.27.1 → **0.27.2** across all 3 packages. Build green.

---

## Environment variables required

| Variable | Where | Purpose |
|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Netlify env vars | JSON string of Firebase service account key for Admin SDK |

---

## File-size report

| File | Lines |
|---|---|
| `netlify/functions/scheduled-backup.js` | 113 |

---

## What the next session should start with

1. Read CLAUDE.md + HANDOFF.md.
2. Deploy to Netlify and verify the scheduled function appears in the Functions tab.
3. Trigger a manual test run to confirm backup writes to Blobs.
4. Check Netlify Blobs storage for the backup file.

## Key file locations

```
/package.json                                  # +@netlify/functions, +firebase-admin
/netlify.toml                                  # +[functions] node_bundler
/netlify/functions/
├── parse-schedule.js                          # existing (untouched)
└── scheduled-backup.js                        # NEW — 113 lines
```
