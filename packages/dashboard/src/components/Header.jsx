import logo from '@homeschool/shared/assets/logo.png';
import { signOut } from '@homeschool/shared';
import { useDarkMode } from '../hooks/useDarkMode';
import { version } from '../../package.json';
import './Header.css';

export default function Header() {
  const { mode, toggle } = useDarkMode();

  return (
    <header className="header">
      <div className="header-brand">
        <img src={logo} alt="ILA" className="header-logo" />
        <div className="header-school">
          <span className="header-school-line1">
            IRON &amp; <span className="header-school-accent">LIGHT</span>
          </span>
          <span className="header-school-line2">JOHNSON ACADEMY</span>
          <span className="header-school-tagline">Faith · Knowledge · Strength</span>
          <span className="header-school-version">v{version}</span>
        </div>
      </div>
      <div className="header-controls">
        <button
          className="header-btn"
          onClick={toggle}
          aria-label="Toggle color mode"
          title={mode === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {mode === 'dark' ? '☀' : '☽'}
        </button>
        <button className="header-btn" onClick={() => signOut()} aria-label="Sign out" title="Sign out">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 4.5l3 3-3 3M13 7.5H6M8 2.5H3v10h5"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
