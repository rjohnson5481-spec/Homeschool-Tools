import { useState, useEffect } from 'react';
import './AddEditActivitySheet.css';

// Stacked above ManageActivitiesSheet (z-index 310/311).
export default function AddEditActivitySheet({
  open, onClose, onSave, onDelete, student, studentName, activity,
}) {
  const isEdit = activity != null;
  const [name, setName]               = useState('');
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const [ongoing, setOngoing]         = useState(false);
  const [notes, setNotes]             = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(activity?.name ?? '');
    setStartDate(activity?.startDate ?? '');
    setEndDate(activity?.endDate ?? '');
    setOngoing(activity?.ongoing ?? false);
    setNotes(activity?.notes ?? '');
    setConfirmDelete(false);
  }, [open, activity]);

  if (!open) return null;

  const canSave = name.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    onSave({ studentId: student, name: name.trim(), startDate, endDate: ongoing ? null : endDate, ongoing, notes: notes.trim() });
  }

  return (
    <div className="aea-sheet-overlay" onClick={onClose}>
      <div className="aea-sheet" onClick={e => e.stopPropagation()}>
        <div className="aea-sheet-handle" aria-hidden="true" />
        <header className="aea-sheet-header">
          <h2 className="aea-sheet-title">{isEdit ? 'Edit Activity' : 'Add Activity'}</h2>
          <button className="aea-sheet-close" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="aea-sheet-body">
          <div className="aea-field">
            <span className="aea-label">Student</span>
            <div className="aea-readonly">{studentName}</div>
          </div>
          <label className="aea-field">
            <span className="aea-label">Activity</span>
            <input className="aea-input" type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Baseball, Piano Lessons, Scouts" autoFocus />
          </label>
          <label className="aea-field">
            <span className="aea-label">Start date</span>
            <input className="aea-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </label>
          <div className="aea-field">
            <div className="aea-toggle-row">
              <span className="aea-label">Ongoing</span>
              <button type="button" className={`aea-toggle${ongoing ? ' aea-toggle--on' : ''}`}
                onClick={() => setOngoing(v => !v)} aria-pressed={ongoing} />
            </div>
          </div>
          {!ongoing && (
            <label className="aea-field">
              <span className="aea-label">End date</span>
              <input className="aea-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </label>
          )}
          <label className="aea-field">
            <span className="aea-label">Notes</span>
            <textarea className="aea-notes" rows={3} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes about this activity" />
          </label>
          {isEdit && !confirmDelete && (
            <button className="aea-delete-btn" onClick={() => setConfirmDelete(true)}>Remove Activity</button>
          )}
          {isEdit && confirmDelete && (
            <div className="aea-confirm">
              <p className="aea-confirm-msg">Remove this activity? This cannot be undone.</p>
              <div className="aea-confirm-actions">
                <button className="aea-confirm-cancel" onClick={() => setConfirmDelete(false)}>Cancel</button>
                <button className="aea-confirm-yes" onClick={onDelete}>Confirm</button>
              </div>
            </div>
          )}
        </div>
        <footer className="aea-sheet-footer">
          <button className="aea-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="aea-save-btn" onClick={handleSave} disabled={!canSave}>Save</button>
        </footer>
      </div>
    </div>
  );
}
