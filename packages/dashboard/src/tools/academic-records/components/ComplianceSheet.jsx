import { useState, useEffect, useRef } from 'react';
import { deleteField } from 'firebase/firestore';
import { subscribeCompliance, saveCompliance } from '../../../firebase/compliance.js';
import { COMPLIANCE_DEFAULTS } from '../../../constants/compliance.js';
import './ComplianceSheet.css';

const SAVE_DEBOUNCE_MS = 500;

// Per-student compliance configuration sheet. Open/close lives in
// AcademicRecordsTab. Each input handler queues a granular partial-update;
// the accumulated patch flushes to Firestore 500ms after the last change.
// Every save also includes deleteField() for the deprecated top-level
// requiredDays / requiredHours — the lazy contract half of the Session 4.1
// expand-then-contract migration. Idempotent once the fields are gone.
// students prop: [{ studentId, name, emoji }] — passed from AcademicRecordsTab via useStudents
export default function ComplianceSheet({ open, onClose, uid, students = [] }) {
  const [settings, setSettings]       = useState(COMPLIANCE_DEFAULTS);
  const [pendingPatch, setPendingPatch] = useState(null);
  const saveTimer                     = useRef(null);

  useEffect(() => {
    if (!uid) return;
    return subscribeCompliance(uid, setSettings);
  }, [uid]);

  // Debounced save. Each handler accumulates into pendingPatch; the timer
  // fires once 500ms after the last change with the merged partial.
  useEffect(() => {
    if (!uid || !pendingPatch) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveCompliance(uid, pendingPatch);
      setPendingPatch(null);
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(saveTimer.current);
  }, [pendingPatch, uid]);

  function queueSave(patch) {
    setPendingPatch(prev => ({
      ...(prev ?? {}),
      ...patch,
      // Lazy contract migration — idempotent once the fields are gone.
      requiredDays: deleteField(),
      requiredHours: deleteField(),
    }));
  }

  // Scalar setter for top-level fields (toggles + starting values).
  function setField(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }));
    queueSave({ [key]: value });
  }
  function handleRequiredDays(studentId, value) {
    const num = parseInt(value, 10) || 0;
    setSettings(prev => ({
      ...prev,
      requiredByStudent: {
        ...(prev.requiredByStudent ?? {}),
        [studentId]: { ...(prev.requiredByStudent?.[studentId] ?? {}), requiredDays: num },
      },
    }));
    queueSave({ [`requiredByStudent.${studentId}.requiredDays`]: num });
  }
  function handleRequiredHours(studentId, value) {
    const num = parseFloat(value) || 0;
    setSettings(prev => ({
      ...prev,
      requiredByStudent: {
        ...(prev.requiredByStudent ?? {}),
        [studentId]: { ...(prev.requiredByStudent?.[studentId] ?? {}), requiredHours: num },
      },
    }));
    queueSave({ [`requiredByStudent.${studentId}.requiredHours`]: num });
  }

  if (!open) return null;

  const noStudents = students.length === 0;

  return (
    <div className="cs-sheet-overlay" onClick={onClose}>
      <div className="cs-sheet" onClick={e => e.stopPropagation()}>
        <div className="cs-sheet-handle" aria-hidden="true" />

        <header className="cs-sheet-header">
          <h2 className="cs-sheet-title">Track Compliance</h2>
          <button className="cs-sheet-close" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="cs-sheet-body">
          <p className="sc-helper">
            Track required school days and hours against your state's
            requirements. Both metrics are independent — enable either or both.
          </p>

          {noStudents && (
            <div className="sc-empty">Add students in Settings to configure compliance.</div>
          )}

          <div className="st-card">
            <div className="st-row">
              <span className="st-row-icon">📆</span>
              <div className="st-row-body">
                <span className="st-row-title">Track required school days</span>
                <span className="st-row-sub">Counts distinct dates with completed lessons.</span>
              </div>
              <button
                className={`st-toggle${settings.daysEnabled ? ' st-toggle--on' : ''}`}
                onClick={() => setField('daysEnabled', !settings.daysEnabled)}
                aria-label="Toggle days tracking"
                aria-pressed={settings.daysEnabled}
              />
            </div>
            {settings.daysEnabled && !noStudents && (
              <div className="sc-fields">
                <div className="sc-group-label">Required days per school year</div>
                {students.map(s => (
                  <div key={s.studentId} className="sc-student-row">
                    <span className="sc-student-name">{s.name}</span>
                    <input type="number" min="0" step="1" className="sc-input"
                      value={settings.requiredByStudent?.[s.studentId]?.requiredDays ?? 0}
                      onChange={e => handleRequiredDays(s.studentId, e.target.value)} />
                  </div>
                ))}
                <label className="sc-field">
                  <span className="sc-field-label">Starting days completed</span>
                  <input type="number" min="0" step="1" className="sc-input"
                    value={settings.startingDays ?? 0}
                    onChange={e => setField('startingDays', parseInt(e.target.value, 10) || 0)} />
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
                onClick={() => setField('hoursEnabled', !settings.hoursEnabled)}
                aria-label="Toggle hours tracking"
                aria-pressed={settings.hoursEnabled}
              />
            </div>
            {settings.hoursEnabled && !noStudents && (
              <div className="sc-fields">
                <div className="sc-group-label">Required hours per school year</div>
                {students.map(s => (
                  <div key={s.studentId} className="sc-student-row">
                    <span className="sc-student-name">{s.name}</span>
                    <input type="number" min="0" step="0.5" className="sc-input"
                      value={settings.requiredByStudent?.[s.studentId]?.requiredHours ?? 0}
                      onChange={e => handleRequiredHours(s.studentId, e.target.value)} />
                  </div>
                ))}
                <label className="sc-field">
                  <span className="sc-field-label">Starting hours completed</span>
                  <input type="number" min="0" step="0.5" className="sc-input"
                    value={settings.startingHours ?? 0}
                    onChange={e => setField('startingHours', parseFloat(e.target.value) || 0)} />
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
