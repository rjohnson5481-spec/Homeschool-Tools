import { useState, useEffect } from 'react';
import { formatWeekLabel } from '../constants/days.js';
import './CalendarWeekView.css';

const DAY_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const PALETTE = ['#5b8dd9','#4caf7d','#7c6fcd','#e09c3a','#c9584c','#3ab8c4','#d4607a','#7da84a'];

function subjectColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function todayDateStr() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

function dateStr(d) {
  if (!d) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CalendarWeekView({
  weekDates, prevWeek, nextWeek, jumpToToday,
  loadWeekDataFrom, student, weekId,
  onEditCell, onAddSubject,
}) {
  const [weekData, setWeekData] = useState({});
  const today = todayDateStr();

  useEffect(() => {
    let cancelled = false;
    loadWeekDataFrom(0).then(data => { if (!cancelled) setWeekData(data); });
    return () => { cancelled = true; };
  }, [weekId, student, loadWeekDataFrom]);

  return (
    <div className="cwv-wrap">
      <div className="cwv-topbar">
        <div className="cwv-nav">
          <button className="cwv-today-btn" onClick={jumpToToday}>Today</button>
          <button className="cwv-chevron" onClick={prevWeek} aria-label="Previous week">‹</button>
          <button className="cwv-chevron" onClick={nextWeek} aria-label="Next week">›</button>
          <span className="cwv-week-label">{formatWeekLabel(weekDates)}</span>
        </div>
        <button className="cwv-add-btn" onClick={() => onAddSubject(0)}>+ Add Lesson</button>
      </div>
      <div className="cwv-grid">
        {[0, 1, 2, 3, 4].map(di => {
          const date = weekDates[di];
          const daySubjects = weekData[di] ?? {};
          const subjectNames = Object.keys(daySubjects).filter(s => s !== 'allday');
          const allday = daySubjects['allday'] ?? null;
          const isToday = date && dateStr(date) === today;
          return (
            <div key={di} className="cwv-col">
              <div className="cwv-col-header">
                <div className="cwv-day-name">{DAY_SHORT[di]}</div>
                <div className={`cwv-day-num${isToday ? ' today' : ''}`}>{date?.getDate() ?? ''}</div>
              </div>
              <div className="cwv-col-body">
                {allday && (
                  <div className="cwv-allday" onClick={() => onEditCell('allday', di)}>
                    <div className="cwv-allday-tag">All Day</div>
                    <div className="cwv-allday-name">{allday.lesson || 'All Day Event'}</div>
                  </div>
                )}
                {subjectNames.map(subject => {
                  const cell = daySubjects[subject] ?? {};
                  const isDone = !!cell.done;
                  return (
                    <div key={subject} className={`cwv-card${isDone ? ' done' : ''}`} onClick={() => onEditCell(subject, di)}>
                      <div className="cwv-card-top">
                        <span className="cwv-dot" style={{ background: subjectColor(subject) }} />
                        <span className="cwv-subject">{subject}</span>
                        <span className={`cwv-status${isDone ? ' done' : ' undone'}`}>{isDone ? '✓' : ''}</span>
                      </div>
                      {cell.lesson && <div className="cwv-lesson">{cell.lesson}</div>}
                      {cell.note && <div className="cwv-note">{cell.note}</div>}
                    </div>
                  );
                })}
                <button className="cwv-col-add" onClick={() => onAddSubject(di)}>+ add</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
