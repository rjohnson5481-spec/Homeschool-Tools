# HANDOFF — v0.25.5 Fix Card-Level Drop Targets for Reorder

## What was completed this session

2 code commits + this docs commit on `main`:

```
9bea662 chore: bump to v0.25.5
502adcf fix: cards are droppable targets for accurate up/down reorder (v0.25.5)
```

### Commit 1 — Cards as droppable targets (`502adcf`)

**CalendarWeekView.jsx (190→196 lines):**
- `DraggableCard` now uses both `useDraggable` AND `useDroppable` on the same node with the same ID. A merged ref callback sets both refs.
- Cards show a gold outline (`1px solid rgba(201,168,76,0.3)`) when hovered during a drag.
- Switched `collisionDetection` from `closestCenter` to `pointerWithin` — uses pointer position directly to find the element under the cursor, which works correctly with the combined draggable+droppable pattern.
- `over.id` now resolves to the card being hovered (not the column), so `parseDragId(over.id)` correctly identifies the target subject for within-day reordering in both directions.

### Commit 2 — Version bump (`9bea662`)
0.25.4 → **0.25.5** across all 3 packages.

Build green. Mobile completely untouched.

---

## File-size report

| File | Lines |
|---|---|
| `CalendarWeekView.jsx` | 196 |

---

## What is currently incomplete / pending

- **Browser smoke test** — not run. Walk:
  - Drag a card upward within a column → card inserts above the target card.
  - Drag a card downward within a column → card inserts at the target position.
  - Target card shows gold outline during hover.
  - Cross-day drag still works (optimistic move).
  - Mobile: completely unchanged.

## Key file locations

```
packages/dashboard/src/tools/planner/components/
└── CalendarWeekView.jsx                # 190 → 196
```
