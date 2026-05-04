import { readCell, updateCell as fbWriteCell, deleteCell } from '../firebase/planner.js';
import { compareWithExisting } from './usePdfImport.js';
import { mondayWeekId, DAY_SHORT } from '../constants/days.js';

// PDF import helpers + handleMoveCell, extracted from PlannerLayout so the
// layout component stays under the 250-line target. No behavior changes —
// the closures match the inline versions one-for-one.
export function usePlannerHelpers({
  user, weekId, studentId, students,
  pdfImport, importCell,
  jumpToWeek, setStudent,
}) {
  function resolveStudentId(name) {
    const match = (students ?? []).find(s => s.name === name);
    if (!match) pdfImport.addLog(`Warning: no student found with name "${name}" — import skipped`);
    return match?.studentId ?? null;
  }

  async function handleApplySchedule(parsedData, onDiffReady) {
    const safeData = { ...parsedData, weekId: mondayWeekId(parsedData.weekId) };
    const uid = user?.uid; if (!uid) return;
    const targetStudentId = resolveStudentId(safeData.studentName);
    if (!targetStudentId) { onDiffReady([]); return; }
    pdfImport.addLog(`Comparing — student: ${safeData.studentName}, week: ${safeData.weekId}`);
    const cells = (safeData.days ?? []).flatMap(({ dayIndex, lessons }) =>
      (lessons ?? []).map(({ subject }) => ({ dayIndex, subject }))
    );
    const existing = {};
    await Promise.all(cells.map(async ({ dayIndex, subject }) => {
      const data = await readCell(uid, safeData.weekId, targetStudentId, dayIndex, subject);
      if (data) { (existing[dayIndex] ??= {})[subject] = data; }
    }));
    const diff = compareWithExisting(safeData, existing);
    pdfImport.addLog(`Diff: ${diff.filter(d => d.status === 'new').length} new, ${diff.filter(d => d.status === 'changed').length} changed, ${diff.filter(d => d.status === 'unchanged').length} unchanged`);
    onDiffReady(diff);
  }

  async function handleConfirmImport(diff) {
    const result = pdfImport.result; if (!result) return;
    const targetStudentId = resolveStudentId(result.studentName);
    if (!targetStudentId) return;
    const safeWeekId = mondayWeekId(result.weekId);
    const toWrite = diff.filter(d => d.status === 'new' || d.status === 'changed');
    toWrite.forEach(({ dayIndex, subject, lesson }) =>
      pdfImport.addLog(`Writing: ${result.studentName} › ${DAY_SHORT[dayIndex]} › ${subject} › ${lesson}`)
    );
    await Promise.all(toWrite.map(({ dayIndex, subject, lesson }) =>
      importCell(safeWeekId, targetStudentId, subject, dayIndex, { lesson, note: '', done: false, flag: false }, true)
    ));
    pdfImport.addLog(`Import complete: ${toWrite.length} cells written`);
    jumpToWeek(safeWeekId);
    setStudent(targetStudentId);
  }

  async function handleMoveCell(fromDay, subject, toDay) {
    const uid = user?.uid;
    if (!uid) return;
    const data = await readCell(uid, weekId, studentId, fromDay, subject);
    if (!data) return;
    await fbWriteCell(uid, weekId, studentId, subject, toDay, data);
    await deleteCell(uid, weekId, studentId, fromDay, subject);
  }

  return { handleApplySchedule, handleConfirmImport, handleMoveCell };
}
