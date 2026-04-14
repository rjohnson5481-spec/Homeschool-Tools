import './PlaceholderTab.css';

// Placeholder — Planner will be migrated into this tab next session.
export default function PlannerTab() {
  return (
    <div className="placeholder-tab">
      <p className="placeholder-tab-icon">📅</p>
      <p className="placeholder-tab-text">Planner loading — migration in progress</p>
    </div>
  );
}
