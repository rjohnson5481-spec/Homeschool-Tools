import { useState, useEffect, useRef } from 'react';
import { subscribeCompliance, saveCompliance } from '../../../firebase/compliance.js';
import { COMPLIANCE_DEFAULTS } from '../../../constants/compliance.js';
import { useComplianceSummary } from '../../../hooks/useComplianceSummary.js';
import ComplianceCard from '../../../components/ComplianceCard.jsx';
import './ComplianceSheet.css';

const SAVE_DEBOUNCE_MS = 500;

// Bottom sheet for configuring School Days Compliance — pattern matches
// CourseCatalogSheet exactly. Open/close state lives in AcademicRecordsTab.
//
// Props:
//   open    — boolean, parent unmounts on false
//   onClose — () => void, dismisses the sheet
//   uid     — Firebase auth uid for the compliance settings doc
export default function ComplianceSheet({ open, onClose, uid }) {
  const [settings, setSettings] = useState(COMPLIANCE_DEFAULTS);
  const [dirty, setDirty]       = useState(null);
  const saveTimer               = useRef(null);
  const summary                 = useComplianceSummary(uid);

  useEffect(() => {
    if (!uid) return;
    return subscribeCompliance(uid, setSettings);
  }, [uid]);

  // Debounced save: every patch resets the timer so rapid keystrokes
  // collapse into a single Firestore write 500ms after the last change.
  useEffect(() => {
    if (!uid || !dirty) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveCompliance(uid, dirty);
      setDirty(null);
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(saveTimer.current);
  }, [dirty, uid]);

  function update(patch) {
    const next = { ...settings, ...patch };
    setSettings(next);
    setDirty(next);
  }

  if (!open) return null;

  return (
    <div className="cs-sheet-overlay" onClick={onClose}>
      <div className="cs-sheet" onClick={e => e.stopPropagation()}>
        <div className="cs-sheet-handle" aria-hidden="true" />

        <header className="cs-sheet-header">
          <h2 className="cs-sheet-title">Track Compliance</h2>
          <button className="cs-sheet-close" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="cs-sheet-body">
          <ComplianceCard summary={summary} variant="sheet" />
          <p className="sc-helper">
            Track required school days and hours against your state's
            requirements. Both metrics are independent — enable either or both.
          </p>
          <div className="st-card">
            <div className="st-row">
              <span className="st-row-icon">📆</span>
              <div className="st-row-body">
                <span className="st-row-title">Track required school days</span>
                <span className="st-row-sub">Counts distinct dates with completed lessons.</span>
              </div>
              <button
                className={`st-toggle${settings.daysEnabled ? ' st-toggle--on' : ''}`}
                onClick={() => update({ daysEnabled: !settings.daysEnabled })}
                aria-label="Toggle days tracking"
                aria-pressed={settings.daysEnabled}
              />
            </div>
            {settings.daysEnabled && (
              <div className="sc-fields">
                <label className="sc-field">
                  <span className="sc-field-label">Required days per school year</span>
                  <input type="number" min="0" step="1" className="sc-input"
                    value={settings.requiredDays}
                    onChange={e => update({ requiredDays: parseInt(e.target.value, 10) || 0 })} />
                </label>
                <label className="sc-field">
                  <span className="sc-field-label">Starting days completed</span>
                  <input type="number" min="0" step="1" className="sc-input"
                    value={settings.startingDays}
                    onChange={e => update({ startingDays: parseInt(e.target.value, 10) || 0 })} />
                  <span className="sc-field-help">
                    Total school days you have already completed this school
                    year before enabling tracking. Leave at 0 if you have been
                    using this planner since the school year started.
                  </span>
                </label>
              </div>
            )}

            <div className="st-row">
              <span className="st-row-icon">⏱️</span>
              <div className="st-row-body">
                <span className="st-row-title">Track required school hours</span>
                <span className="st-row-sub">Sum of hours logged per school day.</span>
              </div>
              <button
                className={`st-toggle${settings.hoursEnabled ? ' st-toggle--on' : ''}`}
                onClick={() => update({ hoursEnabled: !settings.hoursEnabled })}
                aria-label="Toggle hours tracking"
                aria-pressed={settings.hoursEnabled}
              />
            </div>
            {settings.hoursEnabled && (
              <div className="sc-fields">
                <label className="sc-field">
                  <span className="sc-field-label">Required hours per school year</span>
                  <input type="number" min="0" step="0.5" className="sc-input"
                    value={settings.requiredHours}
                    onChange={e => update({ requiredHours: parseFloat(e.target.value) || 0 })} />
                </label>
                <label className="sc-field">
                  <span className="sc-field-label">Starting hours completed</span>
                  <input type="number" min="0" step="0.5" className="sc-input"
                    value={settings.startingHours}
                    onChange={e => update({ startingHours: parseFloat(e.target.value) || 0 })} />
                  <span className="sc-field-help">
                    Total school hours you have already completed this school
                    year before enabling tracking. Enter your aggregate total
                    to date, not an average.
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
