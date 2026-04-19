# HANDOFF — v0.27.5 Backup Filename Fix

## What was completed this session

2 code commits + this docs commit on `main`:

```
a34c0ae chore: bump version to v0.27.5
d8dd37a fix: export backup filename uses email username (v0.27.5)
```

### Commit 1 — Backup filename uses email username (`d8dd37a`)
`packages/dashboard/src/firebase/backup.js`

- Added `auth` to the import from `@homeschool/shared`.
- `downloadBackup` now builds the filename from the signed-in user's email username (part before `@`) plus the date.
- Filename pattern: `{emailUser}-backup-{YYYY-MM-DD}.json`
  - e.g. `rjohnson5481@gmail.com` → `rjohnson5481-backup-2026-04-19.json`
- Previous pattern `ironlight-backup-{date}.json` replaced.
- No other changes to the file — export payload, merge import, and full restore logic untouched.

### Commit 2 — Version bump (`a34c0ae`)
0.27.4 → **0.27.5** across all 3 packages (dashboard, shared, te-extractor).

---

## What the next session should start with

1. Read CLAUDE.md + HANDOFF.md.
2. Smoke test — export a backup and confirm the downloaded filename uses the signed-in email username.

## Key file locations

```
packages/dashboard/src/firebase/backup.js     # downloadBackup filename updated
packages/dashboard/package.json               # 0.27.5
packages/shared/package.json                  # 0.27.5
packages/te-extractor/package.json            # 0.27.5
```
