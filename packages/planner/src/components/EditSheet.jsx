import { useState } from 'react';
import './EditSheet.css';

// Props: subject (string), data ({ lesson, note, done, flag } | undefined),
//        onSave (fn receives updated data), onClose (fn)
export default function EditSheet({ subject, data, onSave, onClose }) {
  const [lesson, setLesson] = useState(data?.lesson ?? '');
  const [note,   setNote]   = useState(data?.note   ?? '');
  const [done,   setDone]   = useState(data?.done   ?? false);
  const [flag,   setFlag]   = useState(data?.flag   ?? false);

  function handleSave() {
    onSave({ lesson: lesson.trim(), note: note.trim(), done, flag });
  }

  return (
    <div className="edit-sheet-overlay" onClick={onClose}>
      <div className="edit-sheet" onClick={e => e.stopPropagation()}>

        <div className="edit-sheet-handle" aria-hidden="true" />

        <header className="edit-sheet-header">
          <h2 className="edit-sheet-title">{subject}</h2>
          <button className="edit-sheet-close" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="edit-sheet-body">
          <label className="edit-sheet-label">Lesson</label>
          <textarea
            className="edit-sheet-textarea"
            value={lesson}
            onChange={e => setLesson(e.target.value)}
            placeholder="Enter lesson description…"
            rows={3}
            autoFocus
          />

          <label className="edit-sheet-label">Note</label>
          <textarea
            className="edit-sheet-textarea"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Optional note…"
            rows={2}
          />

          <div className="edit-sheet-toggles">
            <button
              className={`edit-sheet-toggle${done ? ' edit-sheet-toggle--done' : ''}`}
              onClick={() => setDone(d => !d)}
            >
              {done ? '✓' : '○'} Done
            </button>
            <button
              className={`edit-sheet-toggle${flag ? ' edit-sheet-toggle--flag' : ''}`}
              onClick={() => setFlag(f => !f)}
            >
              ⚑ {flag ? 'Flagged' : 'Flag'}
            </button>
          </div>
        </div>

        <div className="edit-sheet-footer">
          <button className="edit-sheet-cancel" onClick={onClose}>Cancel</button>
          <button className="edit-sheet-save"   onClick={handleSave}>Save</button>
        </div>

      </div>
    </div>
  );
}
