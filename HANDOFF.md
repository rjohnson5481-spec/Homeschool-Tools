# HANDOFF — Version Label Session (2026-04-12)

## What was completed this session

### Version number added to both headers

Both package.json files bumped to `"version": "0.17.0"`.

Both Header.jsx files import version from their local package.json:
```js
import { version } from '../../package.json';
```

A `<span className="header-school-version">v{version}</span>` is rendered
directly below the tagline ("Faith · Knowledge · Strength") in the brand block.

CSS class added to both Header.css files:
```css
.header-school-version {
  font-size: 9px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.35);
  line-height: 1;
}
```

Files changed (one commit):
- `packages/planner/package.json`
- `packages/dashboard/package.json`
- `packages/planner/src/components/Header.jsx`
- `packages/planner/src/components/Header.css`
- `packages/dashboard/src/components/Header.jsx`
- `packages/dashboard/src/components/Header.css`

---

## What is currently incomplete

- **Smoke-test still needed** for fixes from earlier sessions:
  - Header 3 rows on mobile; all 4 icon buttons visible
  - Undo sick day button visible when no subjects on sick day (fixed 2026-04-12)
  - Undo sick day — correct message for Mon–Thu vs Friday
  - Sick day sheet shows full week grouped by day with gold headers
  - Edit sheet "Remove from this day" with two-tap confirm

- **CLAUDE.md header layout note is outdated:** says "2 rows, total 80px" — code
  uses 132px (3 rows: 48px brand+buttons, 52px week nav, 32px students).

- **reward-tracker** — still needs migrating into monorepo structure

---

## What the next session should start with

1. Read CLAUDE.md + HANDOFF.md
2. Smoke-test all pending fixes in browser
3. Update CLAUDE.md header note (80px → 132px, 2 rows → 3 rows)
4. Confirm with Rob: Phase 2 features or reward-tracker migration?
