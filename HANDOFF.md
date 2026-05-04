# HANDOFF — v0.43.0

## Completed this session
Session 9: Brand agnostic shell + compliance fixes.

### What was done
- **useSchoolSettings** hook created (`src/hooks/useSchoolSettings.js`) — subscribes to `/users/{uid}/settings/school`, returns `{ schoolName, tagline, loading }`, defaults `'My Homeschool'`/`''`.
- **App.jsx** wired: calls `useSchoolSettings(user?.uid)`, loading gate waits for both `studentsLoading || schoolSettingsLoading`, passes `schoolName` to `HomeTab` + `SettingsTab`, `schoolName`/`tagline` to `BottomNav`.
- **Header.jsx** — accepts `schoolName`/`tagline` props; splits schoolName on first space for two-line render; omits tagline span if empty.
- **PlannerLayout.jsx** — calls `useSchoolSettings(user?.uid)` internally and passes to Header (avoids 3-level prop drilling through PlannerTab).
- **HomeTab.jsx** — accepts `schoolName` prop; renders as single string; `required: 175` fallback changed to `0`.
- **BottomNav.jsx** — accepts `schoolName`/`tagline` props; renders as single string; omits tagline div if empty.
- **SignIn.jsx** — calls `useSchoolSettings(null)` internally (no uid at sign-in); splits schoolName; omits tagline if empty.
- **SettingsTab.jsx** — accepts `schoolName` prop; version footer renders `{schoolName}`.
- **ReportCardGeneratorSheet.jsx** — accepts `schoolName`/`tagline` props; preview card uses them; passes to PDF generator.
- **generateReportCardPDF.js** — accepts `schoolName`/`tagline`; removes hardcoded URL from footer; conditionally draws tagline.
- **AcademicRecordsTab.jsx** — calls `useSchoolSettings(uid)`, passes to `AcademicRecordsSheets`.
- **AcademicRecordsSheets.jsx** — passes `schoolName`/`tagline` through to `ReportCardGeneratorSheet`.
- **All 175 hardcodes removed**: `useHomeSummary.js`, `useAcademicSummary.js`, `RecordsMainView.jsx`, `StudentDetailSheet.jsx`, `HomeTab.jsx`.
- Verified: brand scan → 0 hits; 175 scan → 0 hits; build clean at v0.43.0.

## What is broken right now
Nothing known.

## Next session start steps
1. Read CLAUDE.md + HANDOFF.md
2. Confirm task with Rob

## Key files changed this session
- `src/hooks/useSchoolSettings.js` (NEW)
- `src/App.jsx`
- `src/tools/planner/components/Header.jsx`
- `src/tools/planner/components/PlannerLayout.jsx`
- `src/tabs/HomeTab.jsx`
- `src/components/BottomNav.jsx`
- `src/components/SignIn.jsx`
- `src/tabs/SettingsTab.jsx`
- `src/tabs/AcademicRecordsTab.jsx`
- `src/tools/academic-records/components/AcademicRecordsSheets.jsx`
- `src/tools/academic-records/components/ReportCardGeneratorSheet.jsx`
- `src/tools/academic-records/utils/generateReportCardPDF.js`
- `src/hooks/useHomeSummary.js`
- `src/tools/academic-records/hooks/useAcademicSummary.js`
- `src/tools/academic-records/components/RecordsMainView.jsx`
- `src/tabs/StudentDetailSheet.jsx`
