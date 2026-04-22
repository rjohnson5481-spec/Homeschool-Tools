import { useState } from 'react';
import { useAuth } from '@homeschool/shared';
import logo from '@homeschool/shared/assets/logo.png';
import { useHomeSummary } from '../hooks/useHomeSummary.js';
import { updateCell } from '../tools/planner/firebase/planner.js';
import StudentDetailSheet from './StudentDetailSheet.jsx';
import './HomeTab.css';
import './HomeHeader.css';

function greetingForHour(hour) {
  if (hour >= 5  && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
}

export default function HomeTab({ onTabChange }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const { students, lessonsByStudent, pointsByStudent, attendance, weekId, dayIndex, todayLabel } = useHomeSummary(uid);
  const [openSheet, setOpenSheet] = useState(null);
  const greeting = greetingForHour(new Date().getHours());

  function handleLessonToggle(student, di, subject, currentDone) {
    if (!uid) return;
    updateCell(uid, weekId, student, subject, di, { done: !currentDone });
  }

  // Reward tracker removed in v0.30.0 — the StudentDetailSheet Quick Award
  // button is now an orphaned no-op until that UI is removed.
  function handleAwardPoints() {}

  return (
    <div className="home-tab">
      <header className="home-header">
        <div className="home-header-brand">
          <img src={logo} alt="ILA" className="home-header-logo" />
          <div className="home-header-name">
            IRON & <span className="home-header-accent">LIGHT</span>
            <br />JOHNSON ACADEMY
          </div>
        </div>
      </header>
      <div className="home-content">
        <div className="home-header-bar">
          <span className="home-date">{todayLabel}</span>
          <span className="home-greeting">{greeting}</span>
        </div>

        <div className="home-students">
          {students.map(name => {
            const lessons = lessonsByStudent[name] ?? [];
            const pts = pointsByStudent[name] ?? { points: 0, cashValue: '0.00' };
            const att = attendance[name] ?? { attended: 0, required: 175, sick: 0, breakDays: 0, schoolDays: 0 };
            const total = lessons.length, done = lessons.filter(l => l.done).length;
            const allDone = total > 0 && done === total;
            const lessonPct = total > 0 ? Math.round((done / total) * 100) : 0;
            const attPct = att.required > 0 ? Math.min(100, Math.round((att.attended / att.required) * 100)) : 0;
            return (
              <div key={name} className="home-student-card" onClick={() => setOpenSheet(name)}>
                <div className="home-student-card-header">
                  <span className="home-student-name">{name}</span>
                  <span className={`home-student-tap-hint${allDone ? ' done' : ''}`}>{allDone ? 'All done ✓' : 'Tap for details'}</span>
                </div>
                <div className="home-student-stats">
                  <div className="home-student-stat">
                    <div className="home-student-stat-value">{total}</div>
                    <div className="home-student-stat-label">Lessons</div>
                  </div>
                  <div className="home-student-stat">
                    <div className="home-student-stat-value green">{done}</div>
                    <div className="home-student-stat-label">Done</div>
                  </div>
                  <div className="home-student-stat">
                    <div className="home-student-stat-value gold">{pts.points}</div>
                    <div className="home-student-stat-label">Points</div>
                  </div>
                  <div className="home-student-stat">
                    <div className="home-student-stat-value blue">{att.attended}</div>
                    <div className="home-student-stat-label">Days</div>
                  </div>
                </div>
                <div className="home-student-progress">
                  <div className="home-progress-row">
                    <div className="home-progress-labels">
                      <span>{done} of {total} done</span>
                      <span>${pts.cashValue}</span>
                    </div>
                    <div className="home-progress-track">
                      <div className="home-progress-fill-lessons" style={{ width: `${lessonPct}%` }} />
                    </div>
                  </div>
                  <div className="home-progress-row">
                    <div className="home-progress-labels">
                      <span>{att.attended} of {att.required} days · {attPct}%</span>
                    </div>
                    <div className="home-progress-track">
                      <div className="home-progress-fill-attendance" style={{ width: `${attPct}%` }} />
                    </div>
                  </div>
                </div>
                <div className="home-lesson-list">
                  {lessons.map(l => (
                    <div key={l.subject} className="home-lesson-row" onClick={e => e.stopPropagation()}>
                      <button className={`home-lesson-checkbox${l.done ? ' checked' : ''}`}
                        onClick={() => handleLessonToggle(name, l.dayIndex, l.subject, l.done)}>{l.done ? '✓' : ''}</button>
                      <span className="home-lesson-subject">{l.subject}</span>
                      {l.lesson && <span className="home-lesson-text">{l.lesson}</span>}
                      {l.flag && <span className="home-lesson-flag" />}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {students.map(name => (
        <StudentDetailSheet key={name} open={openSheet === name} onClose={() => setOpenSheet(null)}
          student={name} lessons={lessonsByStudent[name] ?? []}
          attendance={attendance[name]} points={pointsByStudent[name]}
          uid={uid} weekId={weekId}
          onLessonToggle={handleLessonToggle} onAwardPoints={handleAwardPoints} />
      ))}
    </div>
  );
}
