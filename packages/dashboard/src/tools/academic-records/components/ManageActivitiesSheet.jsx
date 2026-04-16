import { useState } from 'react';
import './ManageActivitiesSheet.css';

const STUDENTS = ['Orion', 'Malachi'];

export default function ManageActivitiesSheet({
  open, onClose, activities, loading, error, onEditActivity, onAddActivity,
}) {
  const [selectedStudent, setSelectedStudent] = useState(STUDENTS[0]);
  if (!open) return null;

  const studentActs = (activities ?? []).filter(a => a.student === selectedStudent);

  return (
    <div className="ma-sheet-overlay" onClick={onClose}>
      <div className="ma-sheet" onClick={e => e.stopPropagation()}>
        <div className="ma-sheet-handle" aria-hidden="true" />
        <header className="ma-sheet-header">
          <h2 className="ma-sheet-title">Activities</h2>
          <button className="ma-sheet-close" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="ma-sheet-body">
          <div className="ma-student-pills">
            {STUDENTS.map(s => (
              <button key={s} className={`ma-student-pill${s === selectedStudent ? ' ma-student-pill--active' : ''}`}
                onClick={() => setSelectedStudent(s)}>{s}</button>
            ))}
          </div>
          <p className="ma-section-label"><span>{selectedStudent}'s Activities</span></p>
          {error && <p className="ma-empty" role="alert">⚠ {error}</p>}
          {loading && <p className="ma-empty">Loading activities…</p>}
          {!loading && studentActs.length === 0 && (
            <p className="ma-empty">No activities yet. Add {selectedStudent}'s first activity.</p>
          )}
          {!loading && studentActs.length > 0 && (
            <div className="ma-activity-list">
              {studentActs.map(a => (
                <button key={a.id} className="ma-activity-row" onClick={() => onEditActivity(a)}>
                  <div className="ma-activity-body">
                    <span className="ma-activity-name">{a.name}</span>
                    <span className="ma-activity-dates">
                      {a.startDate ?? '—'} – {a.ongoing ? 'Ongoing' : (a.endDate ?? '—')}
                    </span>
                    {a.notes && <span className="ma-activity-notes">{a.notes.length > 50 ? a.notes.slice(0, 50) + '…' : a.notes}</span>}
                  </div>
                  <span className="ma-chevron">›</span>
                </button>
              ))}
            </div>
          )}
          <button className="ma-add-btn" onClick={() => onAddActivity(selectedStudent)}>
            + Add Activity
          </button>
        </div>
      </div>
    </div>
  );
}
