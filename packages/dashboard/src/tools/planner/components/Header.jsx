import logo from '@homeschool/shared/assets/logo.png';
import { signOut } from '@homeschool/shared';
import { formatWeekLabel } from '../constants/days.js';
import { version } from '../../../../package.json';
import './Header.css';

// Props: students ({ studentId, name, emoji }[]), student (studentId string),
//        onStudentChange, weekDates, prevWeek, nextWeek, onUpload, onCalendar
export default function Header({
  students,
  student, onStudentChange,
  weekDates, prevWeek, nextWeek,
  onUpload, onCalendar,
  schoolName, tagline,
}) {
  const parts = (schoolName ?? 'My Homeschool').split(' ');
  const line1 = parts[0];
  const line2 = parts.slice(1).join(' ');

  return (
    <header className="header">

      {/* Row 1 — brand left, four action buttons right */}
      <div className="header-top">
        <div className="header-brand">
          <img src={logo} alt="ILA" className="header-logo" />
          <div className="header-school">
            <span className="header-school-line1">{line1}</span>
            {line2 && <span className="header-school-line2">{line2}</span>}
            {tagline && <span className="header-school-tagline">{tagline}</span>}
            <span className="header-school-version">v{version}</span>
          </div>
        </div>

        <div className="header-actions">
          <button className="header-btn" onClick={onCalendar} aria-label="Open calendar" title="Calendar">
            📅
          </button>
          <button className="header-btn" onClick={onUpload} aria-label="Import schedule" title="Import schedule">
            ⬆️
          </button>
          <button className="header-btn" onClick={() => signOut()} aria-label="Sign out" title="Sign out">
            🚪
          </button>
        </div>
      </div>

      {/* Row 2 — week navigation, centered */}
      <nav className="header-week" aria-label="Week navigation">
        <button className="header-nav-btn" onClick={prevWeek} aria-label="Previous week">‹</button>
        <span className="header-week-label">{formatWeekLabel(weekDates)}</span>
        <button className="header-nav-btn" onClick={nextWeek} aria-label="Next week">›</button>
      </nav>

      {/* Row 3 — student selector */}
      <div className="header-students">
        {(students ?? []).map(s => (
          <button
            key={s.studentId}
            className={`header-student-btn${student === s.studentId ? ' header-student-btn--active' : ''}`}
            onClick={() => onStudentChange(s.studentId)}
          >
            {s.name}
          </button>
        ))}
      </div>

    </header>
  );
}
