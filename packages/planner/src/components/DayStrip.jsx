import { DAY_SHORT } from '../constants/days.js';
import './DayStrip.css';

// Props: dates (array of 5 Date objects Mon-Fri), selected (0-4), onSelect
export default function DayStrip({ dates, selected, onSelect }) {
  return (
    <nav className="day-strip" role="tablist" aria-label="Day selector">
      {dates.map((date, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={selected === i}
          className={`day-strip-tab${selected === i ? ' day-strip-tab--active' : ''}`}
          onClick={() => onSelect(i)}
        >
          <span className="day-strip-name">{DAY_SHORT[i]}</span>
          <span className="day-strip-date">{date.getDate()}</span>
        </button>
      ))}
    </nav>
  );
}
