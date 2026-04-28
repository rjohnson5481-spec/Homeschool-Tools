import { useState, useEffect, useRef } from 'react';
import './HoursInputRow.css';

// Mobile-only hours-logged row. Sits between DayStrip and the subject list
// when compliance.hoursEnabled is true. Hidden on desktop via CSS.
//
// Local state mirrors the input string so typing feels instant; the parent
// (useCompliance) handles debounced saves. External hours updates are
// only mirrored into local state when the input is NOT focused, so they
// never clobber an in-progress edit.
export default function HoursInputRow({ selectedDate, hours, onSave, onFlush }) {
  const [value, setValue]   = useState(formatHours(hours));
  const focusedRef          = useRef(false);
  const prevDateRef         = useRef(selectedDate);

  useEffect(() => {
    if (prevDateRef.current !== selectedDate) {
      onFlush();
      prevDateRef.current = selectedDate;
      setValue(formatHours(hours));
    }
  // hours is intentionally omitted — it's resynced via the focus-guarded effect below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  useEffect(() => {
    if (!focusedRef.current) setValue(formatHours(hours));
  }, [hours]);

  function handleChange(e) {
    const next = e.target.value;
    setValue(next);
    onSave(next === '' ? null : parseFloat(next));
  }

  return (
    <div className="hours-row">
      <span className="hours-row-label">Hours today:</span>
      <input
        className="hours-row-input"
        type="number" inputMode="decimal" step="0.5" min="0"
        placeholder="0.0"
        value={value}
        onChange={handleChange}
        onFocus={() => { focusedRef.current = true; }}
        onBlur={() => { focusedRef.current = false; onFlush(); }}
      />
    </div>
  );
}

function formatHours(h) {
  if (h === undefined || h === null || h === '') return '';
  return String(h);
}
