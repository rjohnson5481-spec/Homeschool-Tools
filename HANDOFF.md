# HANDOFF — Session ending 2026-04-14 (reward tracker build, v0.21.2)

## What was completed this session

### reward-tracker package — full build ✅ COMPLETE

New tool at `/reward-tracker/`. All files built from scratch, no existing packages modified.

**Scaffold (commit fd1182d)**
- `packages/reward-tracker/package.json` — `@homeschool/reward-tracker` v0.21.2, exact dep versions
- `packages/reward-tracker/vite.config.js` — base `/reward-tracker/`, outDir `../../dist/reward-tracker`
- `packages/reward-tracker/index.html`
- `packages/reward-tracker/src/main.jsx` — imports tokens.css, fonts.css, reward-tracker.css
- `packages/reward-tracker/src/App.jsx` — auth check, seed on first run, renders RewardLayout
- `packages/reward-tracker/src/reward-tracker.css` — global resets

**netlify.toml redirect (commit 5baf57a)**
Added `/reward-tracker/*` redirect above the `/*` catch-all.
Root `package.json` uses `"workspaces": ["packages/*"]` — reward-tracker auto-included, no changes needed.

**Firestore module (commit e05844f)**
`src/firebase/rewardTracker.js` — seedIfNeeded, subscribePoints, awardPoints, deductPoints, spendPoints, subscribeLog.

**RewardHeader (commit 5f5597b)**
`RewardHeader.jsx + RewardHeader.css` — 56px fixed header, same branding as planner. Accepts `onBack` prop; shows ← button when on log page, blank spacer when on main.

**Action sheets (commit 990ea7a)**
`ActionSheet.css` (shared styles) + `AwardSheet.jsx`, `DeductSheet.jsx`, `SpendSheet.jsx`.
- Stepper (min 1) + quick picks 1/5/10/25/50
- Deduct and Spend disabled when value > balance
- Deduct confirm button amber `#c97c2a`, Spend confirm button red

**LogPage (commit f474a15)**
`LogPage.jsx + LogPage.css` — live Firestore subscription, newest-first, type icons 🏆 ➖ 🎁, green/amber/red point deltas, formatted timestamps. Empty state.

**RewardLayout + StudentCard (commit b2b5b04)**
`StudentCard.jsx + StudentCard.css` — gold accent bar, avatar emoji (Orion 😎, Malachi 🐼), cash value in green, big points number, 2×2 action grid.
`RewardLayout.jsx + RewardLayout.css` — two student cards, sheet state management, view routing (main ↔ log) via React state.

---

## File structure summary
```
packages/reward-tracker/src/
├── App.jsx                            (27 lines)
├── main.jsx                           (15 lines)
├── reward-tracker.css                 (18 lines)
├── firebase/
│   └── rewardTracker.js               (91 lines)
└── components/
    ├── RewardHeader.jsx               (31 lines)
    ├── RewardHeader.css               (98 lines)
    ├── ActionSheet.css                (199 lines — shared by 3 sheets)
    ├── AwardSheet.jsx                 (55 lines)
    ├── DeductSheet.jsx                (59 lines)
    ├── SpendSheet.jsx                 (59 lines)
    ├── StudentCard.jsx                (44 lines)
    ├── StudentCard.css                (115 lines)
    ├── LogPage.jsx                    (68 lines)
    ├── LogPage.css                    (120 lines)
    ├── RewardLayout.jsx               (103 lines)
    └── RewardLayout.css               (15 lines)
```

---

## What to do first next session

### 1. Verify in production
After Netlify deploy:
1. Open `/reward-tracker/` — confirm Google auth redirect works
2. Orion shows 50 pts, Malachi shows 60 pts on first load
3. Award, Deduct, Spend sheets open and write to Firestore
4. Log button opens log page with entries
5. Back button returns to main screen

### 2. Add reward-tracker tile to dashboard
CLAUDE.md rule: "When adding a new tool, add it to the dashboard first." This was skipped to build the tool first (Rob's instruction). Dashboard tile should be added next session.

### 3. Firestore security rules
Ensure rules allow reads/writes to `/users/{uid}/rewardTracker/**`.

### 4. Planner — import sheet preview weekId label (cosmetic, from last session)
"Week of Apr 14" displays pre-normalized weekId. Fix in UploadSheet.jsx or PlannerLayout.jsx — run weekId through `mondayWeekId()` before displaying in preview.

### 5. Verify Firestore security rules for te-extractor (session 9 item — still unchecked)
Confirm rules allow reads/writes to `/users/{uid}/teExtractor/extractions/items/{docId}`.

---

## Known incomplete / not started

- reward-tracker dashboard tile not yet added
- Subject count badges in desktop sidebar DayStrip NOT implemented
- Academic Records: coming-soon placeholder only
- app.js in te-extractor ~970+ lines — violates 300-line limit
