import './BottomNav.css';

const TABS = [
  { id: 'home',     icon: '🏠', label: 'Home' },
  { id: 'planner',  icon: '📅', label: 'Planner' },
  { id: 'rewards',  icon: '🏅', label: 'Rewards' },
  { id: 'te',       icon: '📄', label: 'TE Extractor', external: '/te-extractor/' },
  { id: 'academic', icon: '🎓', label: 'Records' },
];

// Props: activeTab (string), onTabChange (fn)
export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(tab => {
        const isActive = tab.id === activeTab;
        function handleClick() {
          if (tab.external) {
            window.location.href = tab.external;
          } else {
            onTabChange(tab.id);
          }
        }
        return (
          <button
            key={tab.id}
            className={`bn-tab${isActive ? ' bn-tab--active' : ''}`}
            onClick={handleClick}
            aria-label={tab.label}
          >
            <span className="bn-icon">{tab.icon}</span>
            <span className="bn-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
