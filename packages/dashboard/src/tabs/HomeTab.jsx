import { useState } from 'react';
import { useAuth } from '@homeschool/shared';
import logo from '@homeschool/shared/assets/logo.png';
import { useHomeSummary } from '../hooks/useHomeSummary.js';
import { useComplianceSummary } from '../hooks/useComplianceSummary.js';
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

export default function HomeTab({ schoolName }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const { students, lessonsByStudent, attendance, weekId, dayIndex, todayLabel } = useHomeSummary(uid);
  const compliance = useComplianceSummary(uid);
  const [openSheet, setOpenSheet] = useState(null);
  const greeting = greetingForHour(new Date().getHours());

  function handleLessonToggle(studentId, di, subject, currentDone) {
    if (!uid) return;
    updateCell(uid, weekId, studentId, subject, di, { done: !currentDone });
  }

  return (
    <div className="home-tab">
      <header className="home-header">
        <div className="home-header-brand">
          <img src={logo} alt="ILA" className="home-header-logo" />
          <div className="home-header-name">{schoolName ?? 'My Homeschool'}</div>
        </div>
      </header>
      <div className="home-content">
        <div className="home-header-bar">
          <span className="home-date">{todayLabel}</span>
          <span className="home-greeting">{greeting}</span>
        </div>

        <div className="home-students">
          {students.map(s => {
            const lessons = lessonsByStudent[s.studentId] ?? [];
            const att = attendance[s.studentId] ?? { attended: 0, required: 0, sick: 0, breakDays: 0, schoolDays: 0 };
            const total = lessons.length, done = lessons.filter(l => l.done).length;
            const allDone = total > 0 && done === total;
            const lessonPct = total > 0 ? Math.round((done / total) * 100) : 0;
            // When compliance.daysEnabled, source per-student days from
            // compliance counts; otherwise fall back to calendar-math attendance.
            const useCompliance = !!compliance?.daysEnabled;
            const daysAttended = useCompliance
              ? (compliance.daysCompletedByStudent?.[s.studentId] ?? 0)
              : att.attended;
            const daysRequired = useCompliance
              ? (compliance.requiredByStudent?.[s.studentId]?.requiredDays ?? 0)
              : att.required;
            const attPct = daysRequired > 0 ? Math.min(100, Math.round((daysAttended / daysRequired) * 100)) : 0;
            return (
              <div key={s.studentId} className="home-student-card" onClick={() => setOpenSheet(s.studentId)}>
                <div className="home-student-card-header">
                  <span className="home-student-name">{s.emoji ? `${s.emoji} ` : ''}{s.name}</span>
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
                    <div className="home-student-stat-value blue">{daysAttended}</div>
                    <div className="home-student-stat-label">Days</div>
                  </div>
                </div>
                <div className="home-student-progress">
                  <div className="home-progress-row">
                    <div className="home-progress-labels">
                      <span>{done} of {total} done</span>
                    </div>
                    <div className="home-progress-track">
                      <div className="home-progress-fill-lessons" style={{ width: `${lessonPct}%` }} />
                    </div>
                  </div>
                  <div className="home-progress-row">
                    <div className="home-progress-labels">
                      <span>{daysAttended} of {daysRequired} days · {attPct}%</span>
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
                        onClick={() => handleLessonToggle(s.studentId, l.dayIndex, l.subject, l.done)}>{l.done ? '✓' : ''}</button>
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

      {students.map(s => (
        <StudentDetailSheet key={s.studentId} open={openSheet === s.studentId} onClose={() => setOpenSheet(null)}
          student={s.studentId} studentName={s.name} lessons={lessonsByStudent[s.studentId] ?? []}
          attendance={attendance[s.studentId]}
          uid={uid} weekId={weekId}
          onLessonToggle={handleLessonToggle} />
      ))}
    </div>
  );
}
