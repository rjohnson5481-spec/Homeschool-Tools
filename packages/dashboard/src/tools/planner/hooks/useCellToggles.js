import { readCell, updateCell as fbWriteCell } from '../firebase/planner.js';

// Cell toggle logic for the planner. Owns the Firebase-direct path so the
// component layer never imports from firebase/. Two modes:
//   - handleToggleDone / handleToggleFlag operate on the currently selected
//     day via the hook-provided updateCell (scoped to `day`).
//   - toggleCellDone(dayIndex, subject) reaches any day of the current week
//     by reading + writing through firebase/planner.js directly — needed
//     for CalendarWeekView where the user can check off a cell on a day
//     other than the selected one.
export function useCellToggles({ user, weekId, student, day, dayData, updateCell }) {
  function handleToggleDone(subject) {
    const cell = dayData[subject] ?? {};
    updateCell(subject, day, { ...cell, done: !cell.done });
  }

  function handleToggleFlag(subject) {
    const cell = dayData[subject] ?? {};
    updateCell(subject, day, { ...cell, flag: !cell.flag });
  }

  async function toggleCellDone(dayIndex, subject) {
    const uid = user?.uid;
    if (!uid) return;
    const cell = await readCell(uid, weekId, student, dayIndex, subject);
    await fbWriteCell(uid, weekId, student, subject, dayIndex, { done: !cell?.done });
  }

  return { handleToggleDone, handleToggleFlag, toggleCellDone };
}
