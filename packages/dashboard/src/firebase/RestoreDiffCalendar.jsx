import { useMemo, useState } from 'react';
import { applyRestoreDiff } from './backup.js';
import { DAY_SHORT, getWeekDates, formatWeekLabel } from '../tools/planner/constants/days.js';
import './RestoreDiffCalendar.css';

function itemKey(weekId, dayIndex, it) {
  return `${weekId}|${dayIndex}|${it.studentId}|${it.subject}`;
}

function statusBadge(status) {
  if (status === 'MATCH')   return { label: '✓',       cls: 'rdc-badge--match' };
  if (status === 'NEW')     return { label: 'NEW',     cls: 'rdc-badge--new' };
  if (status === 'CHANGED') return { label: 'CHANGED', cls: 'rdc-badge--changed' };
  return { label: 'DELETE', cls: 'rdc-badge--delete' };
}

function displayLesson(status, backup, current) {
  if (status === 'NEW' || status === 'CHANGED') return backup?.lesson || '';
  return current?.lesson || '';
}

// Props:
//   uid      — string
//   filename — string, displayed in header
//   diff     — nested { [weekId]: { [dayIndex]: [items] } }
//   onClose  — close the overlay
export default function RestoreDiffCalendar({ uid, filename, diff, onClose }) {
  const [busy, setBusy] = useState(false);

  // Sorted list of affected weekIds — week navigation only jumps through these.
  const sortedWeekIds = useMemo(() => Object.keys(diff).sort(), [diff]);

  // Students pulled from the diff itself (don't hardcode) — sorted for a
  // stable pill order.
  const allStudents = useMemo(() => {
    const s = new Set();
    for (const weekId of Object.keys(diff)) {
      for (const diStr of Object.keys(diff[weekId])) {
        for (const it of diff[weekId][diStr]) s.add(it.studentId);
      }
    }
    return [...s].sort();
  }, [diff]);

  const [activeStudent, setActiveStudent] = useState(() => allStudents[0] ?? null);
  const [weekIdx, setWeekIdx] = useState(0);
  const currentWeekId = sortedWeekIds[weekIdx] ?? null;

  // One checked map across all weeks AND all students; seeded from each
  // item's initial `checked`. Keyed via itemKey which already includes
  // student, so switching students preserves prior checkbox edits.
  const [checked, setChecked] = useState(() => {
    const m = {};
    for (const weekId of sortedWeekIds) {
      const days = diff[weekId];
      for (const diStr of Object.keys(days)) {
        const dayIndex = Number(diStr);
        for (const it of days[diStr]) {
          m[itemKey(weekId, dayIndex, it)] = it.checked;
        }
      }
    }
    return m;
  });

  function toggleItem(key) {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  }

  // Footer "X changes selected" counts ALL students so the user can see the
  // full scope of what Restore Selected will write. Header conflict summary
  // is scoped to the current week AND active student so it matches the grid.
  const { totalSelected, currentWeekConflicts } = useMemo(() => {
    let sel = 0;
    let curConflicts = 0;
    for (const weekId of sortedWeekIds) {
      const days = diff[weekId];
      for (const diStr of Object.keys(days)) {
        const dayIndex = Number(diStr);
        for (const it of days[diStr]) {
          if (it.status === 'MATCH') continue;
          if (weekId === currentWeekId && it.studentId === activeStudent) curConflicts++;
          const k = itemKey(weekId, dayIndex, it);
          if (checked[k]) sel++;
        }
      }
    }
    return { totalSelected: sel, currentWeekConflicts: curConflicts };
  }, [diff, sortedWeekIds, currentWeekId, activeStudent, checked]);

  async function handleRestore() {
    const out = {};
    for (const [weekId, days] of Object.entries(diff)) {
      out[weekId] = {};
      for (const [diStr, items] of Object.entries(days)) {
        out[weekId][diStr] = items.map(it => ({
          ...it,
          checked: checked[itemKey(weekId, Number(diStr), it)] ?? false,
        }));
      }
    }
    setBusy(true);
    try { await applyRestoreDiff(uid, out); onClose(); }
    catch (err) { console.warn('Restore failed', err); setBusy(false); }
  }

  if (!currentWeekId) return null;

  const weekDates = getWeekDates(currentWeekId);
  const weekLabel = formatWeekLabel(weekDates);
  const daysForWeek = diff[currentWeekId] ?? {};

  const canPrev = weekIdx > 0;
  const canNext = weekIdx < sortedWeekIds.length - 1;
  const conflictLabel = currentWeekConflicts === 0
    ? 'No conflicts this week'
    : `${currentWeekConflicts} conflict${currentWeekConflicts === 1 ? '' : 's'} this week`;

  return (
    <div className="rdc-overlay">
      <div className="rdc-header">
        <div className="rdc-header-left">
          <span className="rdc-filename" title={filename}>{filename}</span>
          {allStudents.length > 1 && (
            <div className="rdc-students" role="tablist" aria-label="Student">
              {allStudents.map(s => (
                <button key={s} type="button" role="tab"
                  aria-selected={s === activeStudent}
                  className={`rdc-student-pill${s === activeStudent ? ' rdc-student-pill--active' : ''}`}
                  onClick={() => setActiveStudent(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="rdc-header-center">
          <button className="rdc-nav" disabled={!canPrev}
            onClick={() => setWeekIdx(i => Math.max(0, i - 1))}
            aria-label="Previous affected week">‹</button>
          <span className="rdc-week-label">{weekLabel}</span>
          <button className="rdc-nav" disabled={!canNext}
            onClick={() => setWeekIdx(i => Math.min(sortedWeekIds.length - 1, i + 1))}
            aria-label="Next affected week">›</button>
          {sortedWeekIds.length > 1 && (
            <span className="rdc-week-counter">{weekIdx + 1} of {sortedWeekIds.length}</span>
          )}
        </div>
        <div className="rdc-header-right">
          <span className="rdc-conflict-summary">{conflictLabel}</span>
          <button className="rdc-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
      </div>

      <div className="rdc-grid">
        {[0, 1, 2, 3, 4].map(di => {
          const items = (daysForWeek[di] ?? []).filter(it => it.studentId === activeStudent);
          const date = weekDates[di];
          return (
            <div key={di} className="rdc-col">
              <div className="rdc-col-header">
                <div className="rdc-day-name">{DAY_SHORT[di]}</div>
                <div className="rdc-day-num">{date?.getDate() ?? ''}</div>
              </div>
              <div className="rdc-col-body">
                {items.length === 0 && <div className="rdc-empty">No changes</div>}
                {items.map(it => {
                  const key = itemKey(currentWeekId, di, it);
                  const isChecked = !!checked[key];
                  const isMatch = it.status === 'MATCH';
                  const badge = statusBadge(it.status);
                  const cls = [
                    'rdc-card',
                    `rdc-card--${it.status.toLowerCase()}`,
                    isMatch ? 'rdc-card--static' : '',
                    !isMatch && !isChecked ? 'rdc-card--unchecked' : '',
                  ].filter(Boolean).join(' ');
                  return (
                    <div key={key} className={cls}
                      onClick={() => { if (!isMatch) toggleItem(key); }}>
                      <div className="rdc-card-head">
                        <span className="rdc-subject">{it.subject}</span>
                        <span className={`rdc-badge ${badge.cls}`}>{badge.label}</span>
                      </div>
                      <div className="rdc-student">{it.studentId}</div>
                      <div className="rdc-lesson">{displayLesson(it.status, it.backup, it.current) || <em>(blank)</em>}</div>
                      {it.status === 'CHANGED' && it.current?.lesson && (
                        <div className="rdc-lesson rdc-lesson--current">was: {it.current.lesson}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rdc-footer">
        <button className="rdc-btn rdc-btn--ghost" onClick={onClose} disabled={busy}>Cancel</button>
        <div className="rdc-selected-count">
          {totalSelected} change{totalSelected === 1 ? '' : 's'} selected
        </div>
        <button className="rdc-btn rdc-btn--gold" onClick={handleRestore}
          disabled={busy || totalSelected === 0}>
          {busy ? 'Restoring...' : 'Restore Selected'}
        </button>
      </div>
    </div>
  );
}
