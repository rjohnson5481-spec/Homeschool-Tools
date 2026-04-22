import { useRef } from 'react';
import './SubjectCard.css';

const LONG_PRESS_MS = 500;
const LONG_PRESS_MOVE_TOLERANCE_PX = 8;

// Props: subject (string), data ({ lesson, note, done, flag } | undefined),
//        onEdit, onToggleDone, onToggleFlag,
//        isSelectMode (bool), isSelected (bool), onLongPress, onSelect.
// When subject === 'allday', renders an All Day Event banner instead of a regular card
// and ignores long-press / selection — the allday slot is never multi-selectable.
export default function SubjectCard({
  subject, data, onEdit, onToggleDone, onToggleFlag,
  isSelectMode = false, isSelected = false, onLongPress, onSelect,
}) {
  if (subject === 'allday') {
    return (
      <div className="subject-card--allday" onClick={onEdit} role="button"
        tabIndex={0} onKeyDown={e => e.key === 'Enter' && onEdit()}>
        <span className="subject-card-allday-label">All Day Event</span>
        <p className="subject-card-allday-name">{data?.lesson || 'Untitled Event'}</p>
        {data?.note && <p className="subject-card-allday-note">{data.note}</p>}
      </div>
    );
  }

  const done    = data?.done ?? false;
  const flag    = data?.flag ?? false;
  const hasNote = Boolean(data?.note);

  // Long-press: fires onLongPress after 500ms of held pointer that hasn't moved
  // more than ~8px. The post-long-press tap is suppressed so opening select
  // mode doesn't also open the edit sheet on pointer release.
  const longPressTimer  = useRef(null);
  const longPressFired  = useRef(false);
  const pressStart      = useRef(null);

  function cancelLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handlePointerDown(e) {
    if (isSelectMode || !onLongPress) return;
    longPressFired.current = false;
    pressStart.current = { x: e.clientX, y: e.clientY };
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      longPressTimer.current = null;
      onLongPress();
    }, LONG_PRESS_MS);
  }

  function handlePointerMove(e) {
    if (!pressStart.current) return;
    const dx = e.clientX - pressStart.current.x;
    const dy = e.clientY - pressStart.current.y;
    if (Math.hypot(dx, dy) > LONG_PRESS_MOVE_TOLERANCE_PX) cancelLongPress();
  }

  function handlePointerEnd() {
    cancelLongPress();
    pressStart.current = null;
  }

  function handleClick() {
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    if (isSelectMode) onSelect?.();
    else onEdit();
  }

  function handleCheckboxClick(e) {
    e.stopPropagation();
    if (isSelectMode) onSelect?.();
    else onToggleDone();
  }

  function handleFlagClick(e) {
    e.stopPropagation();
    if (isSelectMode) onSelect?.();
    else onToggleFlag();
  }

  return (
    <div
      className={`subject-card${done ? ' subject-card--done' : ''}${flag ? ' subject-card--flag' : ''}${isSelected ? ' subject-card--selected' : ''}`}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && (isSelectMode ? onSelect?.() : onEdit())}
    >
      <button
        className={`subject-card-checkbox${done ? ' subject-card-checkbox--done' : ''}`}
        onClick={handleCheckboxClick}
        aria-label={done ? 'Mark not done' : 'Mark done'}
      >
        {done && (
          <svg viewBox="0 0 24 24" fill="none" stroke="white"
            strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            width="22" height="22" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      <div className="subject-card-content">
        <div className="subject-card-top">
          <span className="subject-card-name">{subject}</span>
          <span
            className={`subject-card-note-dot${hasNote ? ' subject-card-note-dot--active' : ''}`}
            aria-label={hasNote ? 'Has note' : 'No note'}
          />
        </div>

        <p className="subject-card-lesson">
          {data?.lesson || <span className="subject-card-empty">Tap to add lesson details</span>}
        </p>

        {!done && <span className="subject-card-hint">Tap to edit</span>}
      </div>

      <button
        className={`subject-card-flag-btn${flag ? ' subject-card-flag-btn--active' : ''}`}
        onClick={handleFlagClick}
        aria-label={flag ? 'Remove flag' : 'Add flag'}
      >
        ⚑
      </button>

      {isSelected && (
        <span className="subject-card-select-check" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
    </div>
  );
}
