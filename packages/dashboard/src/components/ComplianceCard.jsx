import './ComplianceCard.css';

// Dashboard summary for the School Days Compliance feature.
// One component, two mount contexts:
//   variant="home"  — Home tab summary glance, optionally clickable to
//                     jump to Records and auto-open the compliance sheet.
//   variant="sheet" — inside the ComplianceSheet body in Records, above
//                     the helper text. Never clickable.
//
// Reuses the .ar-stat-card / .ar-stat-label / .ar-stat-value /
// .ar-stat-sub classes from AcademicRecordsTab.css (loaded globally via
// App.jsx's eager AcademicRecordsTab import).
//
// Props:
//   summary       — useComplianceSummary return value
//   variant       — "home" | "sheet"
//   onCardClick   — optional () => void; only honored on home variant
export default function ComplianceCard({ summary, variant, onCardClick }) {
  if (!summary?.enabled) return null;

  const {
    daysEnabled, hoursEnabled,
    requiredDays, requiredHours,
    daysCompleted, hoursCompleted,
    activeSchoolYear,
  } = summary;

  // Sheet variant: don't render until the user has actually toggled at
  // least one metric on. Avoids showing zeros before any setting exists.
  if (variant === 'sheet' && !daysEnabled && !hoursEnabled) return null;

  // Empty-state branch: compliance is enabled but no school year defined.
  if (!activeSchoolYear) {
    return (
      <div className={`cc cc--${variant}`}>
        <div className="ar-stat-card cc-empty">
          <div className="ar-stat-sub">
            Set up a school year in Academic Records to track compliance progress.
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    { key: 'days',  enabled: daysEnabled,  label: 'Days Completed',
      value: daysCompleted,  required: requiredDays,  noun: 'days' },
    { key: 'hours', enabled: hoursEnabled, label: 'Hours Completed',
      value: hoursCompleted, required: requiredHours, noun: 'hours' },
  ].filter(m => m.enabled);

  if (metrics.length === 0) return null;

  const isClickable = variant === 'home' && typeof onCardClick === 'function';
  const Wrapper = isClickable ? 'button' : 'div';
  const wrapperProps = isClickable
    ? { className: 'cc cc--home cc-clickable', onClick: onCardClick, type: 'button' }
    : { className: `cc cc--${variant}` };

  return (
    <Wrapper {...wrapperProps}>
      <div className="cc-row">
        {metrics.map(m => {
          const pct = m.required > 0 ? Math.min(100, Math.round((m.value / m.required) * 100)) : 0;
          return (
            <div key={m.key} className="ar-stat-card cc-card">
              <div className="ar-stat-label">{m.label}</div>
              <div className="ar-stat-value">{m.value}</div>
              <div className="ar-stat-sub">
                {m.required > 0 ? `of ${m.required} ${m.noun} required` : `${m.noun} completed`}
              </div>
              {m.required > 0 && (
                <div className="cc-progress-track">
                  <div className="cc-progress-fill" style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {isClickable && <div className="cc-detail-hint">View details ›</div>}
    </Wrapper>
  );
}
