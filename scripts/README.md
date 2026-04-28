# Migration: Per-Student Compliance (Session 4.1)

Migrates Firestore data from family-wide compliance shape to per-student
shape. One-time script, deleted after successful run.

## Prerequisites

- Node.js ≥ 18 installed
- Firebase service account JSON saved at
  `C:\Users\rjohn\Downloads\firebase-service-account.json`
- Repo cloned locally at `C:\Users\rjohn\Code\Home-School-Planner`

## Running the script

Open PowerShell and navigate to the scripts directory:

    cd C:\Users\rjohn\Code\Home-School-Planner\scripts

Install dependencies (one time):

    npm install

Set the credential env var (this PowerShell session only):

    $env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\rjohn\Downloads\firebase-service-account.json"

Run the dry run first:

    $env:DRY_RUN="true"
    node migrate-compliance-per-student.js

Review the output. If it looks correct, run the real migration:

    $env:DRY_RUN="false"
    node migrate-compliance-per-student.js

## Verification after running

Check the Firebase console:
https://console.firebase.google.com/project/homeschool-tools-ff73c/firestore

`settings/compliance` doc should now have BOTH:
  - top-level `requiredDays` / `requiredHours` (preserved)
  - `requiredByStudent` map with per-student values

Each `schoolDays/{date}` doc should now have ONLY:
  - `hoursByStudent: {}`

No `hoursLogged` field should remain.

## After successful migration

Tell Claude this assistant; it will issue a follow-up prompt to delete this
script.
