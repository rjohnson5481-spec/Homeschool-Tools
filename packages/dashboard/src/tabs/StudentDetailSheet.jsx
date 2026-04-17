import { useState, useRef, useEffect } from 'react';
import './StudentDetailSheet.css';

export default function StudentDetailSheet({
  open, onClose, student, lessons, attendance, points,
  onLessonToggle, onAwardPoints,
}) {
  const [awardAmt, setAwardAmt] = useState(null);
  const [awarded, setAwarded]   = useState(false);
  const timer = useRef(null);

  useEffect(() => { if (!open) { setAwardAmt(null); setAwarded(false); } }, [open]);
  useEffect(() => () => clearTimeout(timer.current), []);

  if (!open) return null;

  const totalLessons = (lessons ?? []).length;
  const doneLessons  = (lessons ?? []).filter(l => l.done).length;
  const att = attendance ?? { attended: 0, required: 175, sick: 0, breakDays: 0 };
  const attPct = att.required > 0 ? Math.min(100, Math.round((att.attended / att.required) * 100)) : 0;
  const pts = points ?? { points: 0, cashValue: '0.00' };

  function handleAward() {
    if (!awardAmt) return;
    onAwardPoints(student, awardAmt);
    setAwarded(true); setAwardAmt(null);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAwarded(false), 1500);
  }

  return (
    <div className="sds-sheet-overlay" onClick={onClose}>
      <div className="sds-sheet" onClick={e => e.stopPropagation()}>
        <div className="sds-sheet-handle" aria-hidden="true" />
        <header className="sds-sheet-header">
          <div className="sds-header-left">
            <span className="sds-header-name">{student}</span>
          </div>
          <span className="sds-header-pts">{pts.points} pts</span>
          <button className="sds-sheet-close" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="sds-sheet-body">
          <p className="sds-section-label">Today's Lessons</p>
          {totalLessons === 0 ? (
            <p className="sds-empty">No lessons planned for today.</p>
          ) : (
            <div className="sds-lesson-list">
              {(lessons ?? []).map(l => (
                <div key={l.subject} className="sds-lesson-row">
                  <button className={`sds-checkbox${l.done ? ' checked' : ''}`}
                    onClick={() => onLessonToggle(student, l.dayIndex, l.subject, l.done)}>
                    {l.done ? '✓' : ''}
                  </button>
                  <div className="sds-lesson-info">
                    <span className={`sds-lesson-subject${l.done ? ' done' : ''}`}>{l.subject}</span>
                    {l.lesson && <span className="sds-lesson-text">{l.lesson}</span>}
                  </div>
                  {l.flag && <span className="sds-flag-dot" />}
                </div>
              ))}
            </div>
          )}
          <p className="sds-section-label">Attendance</p>
          <div className="sds-attendance">
            <div className="sds-att-bar-track"><div className="sds-att-bar-fill" style={{ width: `${attPct}%` }} /></div>
            <div className="sds-att-labels">
              <span>{att.attended} of {att.required} days · {attPct}%</span>
            </div>
            <div className="sds-att-detail">
              <span>Attended {att.attended}</span>
              <span>Sick {att.sick ?? 0}</span>
              <span>Breaks {att.breakDays ?? 0}</span>
            </div>
          </div>
          <p className="sds-section-label">Quick Award</p>
          <div className="sds-award-block">
            <div className="sds-award-btns">
              {[1, 5, 10].map(n => (
                <button key={n} className={`sds-award-btn${awardAmt === n ? ' selected' : ''}`}
                  onClick={() => setAwardAmt(awardAmt === n ? null : n)}>+{n}</button>
              ))}
            </div>
            {awarded ? (
              <div className="sds-award-success">Awarded!</div>
            ) : (
              <button className="sds-award-confirm" onClick={handleAward} disabled={!awardAmt}>
                Award {awardAmt ?? '—'} Points to {student}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
