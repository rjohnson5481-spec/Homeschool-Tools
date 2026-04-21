import { readCell, updateCell as fbWriteCell, deleteCell } from '../firebase/planner.js';
import { compareWithExisting } from './usePdfImport.js';
import { mondayWeekId, DAY_SHORT } from '../constants/days.js';

// PDF import helpers + handleMoveCell, extracted from PlannerLayout so the
// layout component stays under the 250-line target. No behavior changes —
// the closures match the inline versions one-for-one.
export function usePlannerHelpers({
  user, weekId, student,
  pdfImport, importCell,
  jumpToWeek, setStudent,
}) {
  async function handleApplySchedule(parsedData, onDiffReady) {
    const safeData = { ...parsedData, weekId: mondayWeekId(parsedData.weekId) };
    const uid = user?.uid; if (!uid) return;
    pdfImport.addLog(`Comparing — student: ${safeData.student}, week: ${safeData.weekId}`);
    const cells = (safeData.days ?? []).flatMap(({ dayIndex, lessons }) =>
      (lessons ?? []).map(({ subject }) => ({ dayIndex, subject }))
    );
    const existing = {};
    await Promise.all(cells.map(async ({ dayIndex, subject }) => {
      const data = await readCell(uid, safeData.weekId, safeData.student, dayIndex, subject);
      if (data) { (existing[dayIndex] ??= {})[subject] = data; }
    }));
    const diff = compareWithExisting(safeData, existing);
    pdfImport.addLog(`Diff: ${diff.filter(d => d.status === 'new').length} new, ${diff.filter(d => d.status === 'changed').length} changed, ${diff.filter(d => d.status === 'unchanged').length} unchanged`);
    onDiffReady(diff);
  }

  async function handleConfirmImport(diff) {
    const result = pdfImport.result; if (!result) return;
    const safeWeekId = mondayWeekId(result.weekId);
    const toWrite = diff.filter(d => d.status === 'new' || d.status === 'changed');
    toWrite.forEach(({ dayIndex, subject, lesson }) =>
      pdfImport.addLog(`Writing: ${result.student} › ${DAY_SHORT[dayIndex]} › ${subject} › ${lesson}`)
    );
    await Promise.all(toWrite.map(({ dayIndex, subject, lesson }) =>
      importCell(safeWeekId, result.student, subject, dayIndex, { lesson, note: '', done: false, flag: false }, true)
    ));
    pdfImport.addLog(`Import complete: ${toWrite.length} cells written`);
    jumpToWeek(safeWeekId);
    setStudent(result.student);
  }

  async function handleMoveCell(fromDay, subject, toDay) {
    const uid = user?.uid;
    if (!uid) return;
    const data = await readCell(uid, weekId, student, fromDay, subject);
    if (!data) return;
    await fbWriteCell(uid, weekId, student, subject, toDay, data);
    await deleteCell(uid, weekId, student, fromDay, subject);
  }

  return { handleApplySchedule, handleConfirmImport, handleMoveCell };
}
