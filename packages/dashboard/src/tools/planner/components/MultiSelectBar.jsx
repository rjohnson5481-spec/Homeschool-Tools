import { useState } from 'react';
import { DAY_SHORT } from '../constants/days.js';
import './MultiSelectBar.css';

// Mobile-only multi-select action bar. Renders fixed at the bottom of the
// viewport with the same footprint as BottomNav (68px / 56px) and a higher
// z-index so it covers the nav while select mode is active. All CSS is
// scoped to max-width: 809px — the bar never renders on desktop.
//
// Props: selectedCount, day, deleteConfirmPending,
//        onSelectAll, onMarkDone, onMoveToDay(targetDayIndex), onDelete, onCancel
export default function MultiSelectBar({
  selectedCount, day, deleteConfirmPending,
  onSelectAll, onMarkDone, onMoveToDay, onDelete, onCancel,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const otherDays = [0, 1, 2, 3, 4].filter(d => d !== day);

  function handleMovePress() {
    setPickerOpen(open => !open);
  }

  function handleDayPick(targetDayIndex) {
    setPickerOpen(false);
    onMoveToDay(targetDayIndex);
  }

  function handleCancel() {
    setPickerOpen(false);
    onCancel();
  }

  return (
    <div className="msb-wrap" role="toolbar" aria-label="Multi-select actions">
      {pickerOpen && (
        <div className="msb-day-picker" role="menu">
          {otherDays.map(d => (
            <button
              key={d}
              className="msb-day-option"
              onClick={() => handleDayPick(d)}
            >
              {DAY_SHORT[d]}
            </button>
          ))}
        </div>
      )}

      <div className="msb-count">{selectedCount} selected</div>

      <div className="msb">
        <button className="msb-btn" onClick={onSelectAll}>Select All</button>
        <button className="msb-btn" onClick={onMarkDone}>Mark Done</button>
        <button
          className={`msb-btn${pickerOpen ? ' msb-btn--active' : ''}`}
          onClick={handleMovePress}
        >
          Move to Day
        </button>
        <button
          className={`msb-btn msb-btn--delete${deleteConfirmPending ? ' msb-btn--confirm' : ''}`}
          onClick={onDelete}
        >
          {deleteConfirmPending ? 'Confirm?' : 'Delete'}
        </button>
        <button className="msb-btn" onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
}
