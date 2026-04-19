import { useState, useRef } from 'react';
import { downloadBackup, importFullRestore, generateRestoreDiff } from '../firebase/backup.js';
import RestoreDiffSheet from '../firebase/RestoreDiffSheet.jsx';
import './DataBackupSection.css';

export default function DataBackupSection({ uid }) {
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [diffData, setDiffData] = useState(null); // { filename, diff }
  const [restoreStep, setRestoreStep] = useState(0);
  const [restoreInput, setRestoreInput] = useState('');
  const [restoreResult, setRestoreResult] = useState(null);
  const restoreRef = useRef(null);
  const factoryRef = useRef(null);

  async function handleExport() {
    setExporting(true);
    try { await downloadBackup(uid); setExportDone(true); setTimeout(() => setExportDone(false), 2000); }
    catch (err) { console.warn('Export failed', err); }
    finally { setExporting(false); }
  }

  async function handleRestoreFromFile(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      const diff = await generateRestoreDiff(uid, backup);
      setDiffData({ filename: file.name, diff });
    } catch (err) { console.warn('Restore diff failed', err); }
    finally { setBusy(false); if (restoreRef.current) restoreRef.current.value = ''; }
  }

  function startFactoryReset() { setRestoreStep(1); setRestoreInput(''); setRestoreResult(null); }

  async function handleFactoryResetFile(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true); setRestoreStep(0);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      const result = await importFullRestore(uid, backup);
      setRestoreResult(`Restored ${result.restored} items. Reload the app to see your data.`);
    } catch (err) { setRestoreResult(`Error: ${err.message}`); }
    finally { setBusy(false); if (factoryRef.current) factoryRef.current.value = ''; }
  }

  return (
    <section>
      <p className="st-section-label"><span>Data &amp; Backup</span></p>
      <div className="st-card">
        <div className="st-row">
          <span className="st-row-icon">💾</span>
          <div className="st-row-body">
            <span className="st-row-title">Export Backup</span>
            <span className="st-row-sub">Download all your data as a JSON file</span>
          </div>
          <button className="db-btn db-btn--gold" onClick={handleExport} disabled={exporting || exportDone}>
            {exporting ? 'Exporting...' : exportDone ? 'Done ✓' : 'Export'}
          </button>
        </div>
        <div className="st-row">
          <span className="st-row-icon">🔄</span>
          <div className="st-row-body">
            <span className="st-row-title">Restore from Backup</span>
            <span className="st-row-sub">Review each change before writing anything to Firestore</span>
          </div>
          <label className="db-btn db-btn--ghost">
            {busy ? 'Loading...' : 'Choose File'}
            <input ref={restoreRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleRestoreFromFile} disabled={busy} />
          </label>
        </div>
        <div className="st-row st-row--danger" style={{ boxShadow: 'inset 3px 0 0 var(--red)' }}>
          <span className="st-row-icon">⚠️</span>
          <div className="st-row-body">
            <span className="st-row-title st-row-title--danger">Factory Reset Restore</span>
            <span className="st-row-sub db-danger-sub">Wipes all current data and replaces it with the backup file. This cannot be undone.</span>
            {restoreResult && <span className="db-result">{restoreResult}</span>}
            {restoreResult && <button className="db-btn db-btn--gold db-reload" onClick={() => window.location.reload()}>Reload</button>}
          </div>
          <button className="db-btn db-btn--red" style={{ border: '1.5px solid var(--red)' }} onClick={startFactoryReset} disabled={busy}>Factory Reset</button>
        </div>
      </div>

      {restoreStep === 1 && (
        <div className="db-modal-overlay" onClick={() => setRestoreStep(0)}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <h3 className="db-modal-title">⚠️ Factory Reset Restore</h3>
            <p className="db-modal-body">This will permanently delete ALL your current data and replace it with the selected backup file. Every lesson, grade, reward, and record will be erased. This cannot be undone.</p>
            <div className="db-modal-actions">
              <button className="db-btn db-btn--ghost" onClick={() => setRestoreStep(0)}>Cancel</button>
              <button className="db-btn db-btn--red" onClick={() => setRestoreStep(2)}>Continue</button>
            </div>
          </div>
        </div>
      )}
      {restoreStep === 2 && (
        <div className="db-modal-overlay" onClick={() => setRestoreStep(0)}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <h3 className="db-modal-title">Confirm Factory Reset</h3>
            <p className="db-modal-body">Type <strong>RESTORE</strong> to confirm.</p>
            <input className="db-confirm-input" value={restoreInput} onChange={e => setRestoreInput(e.target.value)}
              placeholder="Type RESTORE to confirm" autoFocus />
            <div className="db-modal-actions">
              <button className="db-btn db-btn--ghost" onClick={() => setRestoreStep(0)}>Cancel</button>
              <label className={`db-btn db-btn--red${restoreInput !== 'RESTORE' ? ' disabled' : ''}`}>
                {busy ? 'Restoring...' : 'Confirm Restore'}
                <input ref={factoryRef} type="file" accept=".json" style={{ display: 'none' }}
                  onChange={handleFactoryResetFile} disabled={restoreInput !== 'RESTORE' || busy} />
              </label>
            </div>
          </div>
        </div>
      )}

      {diffData && (
        <RestoreDiffSheet uid={uid} filename={diffData.filename} diff={diffData.diff}
          onClose={() => setDiffData(null)} />
      )}
    </section>
  );
}
