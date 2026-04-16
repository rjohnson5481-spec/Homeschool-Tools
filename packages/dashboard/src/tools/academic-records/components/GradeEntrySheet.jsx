import { useState, useEffect, useMemo } from 'react';
import { GRADING_TYPE_LETTER } from '../constants/academics.js';
import { LETTER_SCALE, ESNU_SCALE } from '../constants/scales.js';
import './GradeEntrySheet.css';

// Bottom sheet for entering grades for one student × one quarter.
// Stacks ABOVE the Records main view (overlay z-index 310).
//
// Letter-scale courses: percentage input with auto-assigned letter grade.
// ESNU courses: tap-to-select pill buttons (unchanged).
//
// Props:
//   open              — boolean
//   onClose           — () => void
//   onSave            — (edits: Array<{ enrollmentId, quarterId, grade, percent, existingId? }>) => Promise
//   enrollments       — Array<{ id, courseId, student }>  (already filtered to selected student)
//   courses           — Array<{ id, name, gradingType }>
//   grades            — Array<{ id, enrollmentId, quarterId, grade, percent }>  (all grades)
//   selectedQuarterId — string
//   quarterLabel      — string, displayed in header

const DOT_COLORS = [
  '#1565c0', '#c0392b', '#2e7d32', '#7b1fa2',
  '#e65100', '#00838f', '#558b2f', '#ad1457',
];

function letterFromPercent(pct) {
  const n = Number(pct);
  if (isNaN(n) || pct === '') return null;
  const clamped = Math.max(0, Math.min(100, Math.round(n)));
  const entry = LETTER_SCALE.find(s => clamped >= s.minPercent && clamped <= s.maxPercent);
  return entry?.grade ?? null;
}

export default function GradeEntrySheet({
  open, onClose, onSave,
  enrollments, courses, grades,
  selectedQuarterId, quarterLabel,
}) {
  const courseById = useMemo(
    () => new Map((courses ?? []).map(c => [c.id, c])),
    [courses],
  );

  // Build initial local state split by grading type:
  //   percents: { [enrollmentId]: string } — for letter courses (percentage input value)
  //   esnuValues: { [enrollmentId]: string } — for ESNU courses (selected grade letter)
  const { initPercents, initEsnu } = useMemo(() => {
    const pct = {}, esnu = {};
    (enrollments ?? []).forEach(enr => {
      const course = courseById.get(enr.courseId);
      const isLetter = (course?.gradingType ?? GRADING_TYPE_LETTER) === GRADING_TYPE_LETTER;
      const existing = (grades ?? []).find(
        g => g.enrollmentId === enr.id && g.quarterId === selectedQuarterId,
      );
      if (isLetter) {
        pct[enr.id] = existing?.percent != null ? String(existing.percent) : '';
      } else {
        esnu[enr.id] = existing?.grade ?? '';
      }
    });
    return { initPercents: pct, initEsnu: esnu };
  }, [enrollments, grades, selectedQuarterId, courseById]);

  const [percents, setPercents] = useState({});
  const [esnuValues, setEsnuValues] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPercents(initPercents);
    setEsnuValues(initEsnu);
    setSaving(false);
  }, [open, initPercents, initEsnu]);

  if (!open) return null;

  const hasChanges =
    Object.keys(percents).some(eid => percents[eid] !== (initPercents[eid] ?? '')) ||
    Object.keys(esnuValues).some(eid => esnuValues[eid] !== (initEsnu[eid] ?? ''));

  function setEsnuGrade(enrollmentId, grade) {
    setEsnuValues(prev => ({ ...prev, [enrollmentId]: prev[enrollmentId] === grade ? '' : grade }));
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    const edits = [];
    (enrollments ?? []).forEach(enr => {
      const course = courseById.get(enr.courseId);
      const isLetter = (course?.gradingType ?? GRADING_TYPE_LETTER) === GRADING_TYPE_LETTER;
      const existing = (grades ?? []).find(
        g => g.enrollmentId === enr.id && g.quarterId === selectedQuarterId,
      );
      if (isLetter) {
        const pctStr = percents[enr.id];
        const letter = letterFromPercent(pctStr);
        if (!letter) return;
        edits.push({
          enrollmentId: enr.id, quarterId: selectedQuarterId,
          grade: letter, percent: Math.max(0, Math.min(100, Math.round(Number(pctStr)))),
          existingId: existing?.id ?? null,
        });
      } else {
        const grade = esnuValues[enr.id];
        if (!grade) return;
        edits.push({
          enrollmentId: enr.id, quarterId: selectedQuarterId,
          grade, percent: null,
          existingId: existing?.id ?? null,
        });
      }
    });
    try { await onSave(edits); } finally { setSaving(false); }
  }

  return (
    <div className="ge-sheet-overlay" onClick={onClose}>
      <div className="ge-sheet" onClick={e => e.stopPropagation()}>

        <div className="ge-sheet-handle" aria-hidden="true" />

        <header className="ge-sheet-header">
          <h2 className="ge-sheet-title">Enter Grades — {quarterLabel ?? 'Quarter'}</h2>
          <button className="ge-sheet-close" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="ge-sheet-body">
          {(enrollments ?? []).length === 0 ? (
            <p className="ge-empty">No courses enrolled for this student.</p>
          ) : (
            (enrollments ?? []).map((enr, i) => {
              const course = courseById.get(enr.courseId);
              const isLetter = (course?.gradingType ?? GRADING_TYPE_LETTER) === GRADING_TYPE_LETTER;

              return (
                <div key={enr.id} className="ge-row">
                  <div className="ge-row-header">
                    <span className="ge-dot" style={{ background: DOT_COLORS[i % DOT_COLORS.length] }} />
                    <span className="ge-course-name">{course?.name ?? '(deleted course)'}</span>
                    <span className="ge-scale-badge">{isLetter ? 'Letter' : 'E/S/N/U'}</span>
                  </div>

                  {isLetter ? (
                    <div className="ge-grade-input-wrap">
                      <input
                        className="ge-percent-input"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0–100"
                        value={percents[enr.id] ?? ''}
                        onChange={e => setPercents(prev => ({ ...prev, [enr.id]: e.target.value }))}
                      />
                      <span className="ge-computed-grade">
                        {letterFromPercent(percents[enr.id]) ?? '—'}
                      </span>
                    </div>
                  ) : (
                    <div className="ge-pills">
                      {ESNU_SCALE.map(s => (
                        <button
                          key={s.grade}
                          className={`ge-pill${(esnuValues[enr.id] ?? '') === s.grade ? ' active' : ''}`}
                          onClick={() => setEsnuGrade(enr.id, s.grade)}
                          title={s.descriptor}
                          type="button"
                        >{s.grade}</button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <footer className="ge-sheet-footer">
          <button className="ge-cancel-btn" onClick={onClose}>Cancel</button>
          <button
            className="ge-save-btn"
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Saving…' : 'Save Grades'}
          </button>
        </footer>

      </div>
    </div>
  );
}
