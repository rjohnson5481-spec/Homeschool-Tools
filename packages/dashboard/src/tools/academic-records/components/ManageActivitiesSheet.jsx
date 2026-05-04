import { useState } from 'react';
import './ManageActivitiesSheet.css';

export default function ManageActivitiesSheet({
  open, onClose, activities, loading, error, onEditActivity, onAddActivity, students,
}) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const effectiveStudent = selectedStudent ?? (students ?? [])[0]?.studentId ?? '';
  const effectiveName = (students ?? []).find(s => s.studentId === effectiveStudent)?.name ?? '';
  if (!open) return null;

  const studentActs = (activities ?? []).filter(a => a.studentId === effectiveStudent);

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
            {(students ?? []).map(s => (
              <button key={s.studentId} className={`ma-student-pill${s.studentId === selectedStudent ? ' ma-student-pill--active' : ''}`}
                onClick={() => setSelectedStudent(s.studentId)}>{s.emoji ? `${s.emoji} ` : ''}{s.name}</button>
            ))}
          </div>
          <p className="ma-section-label"><span>{effectiveName}'s Activities</span></p>
          {error && <p className="ma-empty" role="alert">⚠ {error}</p>}
          {loading && <p className="ma-empty">Loading activities…</p>}
          {!loading && studentActs.length === 0 && (
            <p className="ma-empty">No activities yet. Add {effectiveName}'s first activity.</p>
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
          <button className="ma-add-btn" onClick={() => onAddActivity(effectiveStudent)}>
            + Add Activity
          </button>
        </div>
      </div>
    </div>
  );
}
