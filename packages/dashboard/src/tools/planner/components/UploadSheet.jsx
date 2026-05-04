import { useState, useEffect, useRef } from 'react';
import DebugSheet from './DebugSheet.jsx';
import ImportDiffPreview from './ImportDiffPreview.jsx';
import { mondayWeekId } from '../constants/days.js';
import './UploadSheet.css';
import './UploadResult.css';

function formatWeekOf(weekId) {
  const [y, mo, d] = weekId.split('-').map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function UploadSheet({ pdfImport, onApply, onConfirmImport, onClose }) {
  const { file, importing, result, error, log, selectFile, importSchedule } = pdfImport;

  const [applied, setApplied]   = useState(false);
  const [diff, setDiff]         = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [showLog, setShowLog]   = useState(false);
  const triggered = useRef(false);

  useEffect(() => {
    if (result && !diff && !applied && !reviewing && !triggered.current) {
      triggered.current = true;
      setReviewing(true);
      onApply(result, (diffResult) => { setDiff(diffResult); setReviewing(false); });
    }
  }, [result, diff, applied, reviewing, onApply]);

  useEffect(() => { if (!result) triggered.current = false; }, [result]);

  function handlePublish() {
    if (!diff) return;
    setDiff(null); setApplied(true);
    onConfirmImport(diff);
  }

  return (
    <>
      <div className="upload-sheet-overlay" onClick={onClose}>
        <div className="upload-sheet" onClick={e => e.stopPropagation()}>

          <div className="upload-sheet-handle" aria-hidden="true" />

          <header className="upload-sheet-header">
            <h2 className="upload-sheet-title">Import Schedule</h2>
            <button className="upload-sheet-close" onClick={onClose} aria-label="Close">✕</button>
          </header>

          <div className="upload-sheet-body">

            {!result && !applied && (
              <label className={`upload-sheet-file-zone${importing ? ' upload-sheet-file-zone--disabled' : ''}`}>
                <input type="file" accept="application/pdf,image/*" className="upload-sheet-file-input"
                  onChange={e => { if (e.target.files?.[0]) { selectFile(e.target.files[0]); setApplied(false); setDiff(null); triggered.current = false; } }}
                  disabled={importing} />
                {file ? <span className="upload-sheet-filename">📄 {file.name}</span>
                  : <span className="upload-sheet-file-hint">Tap to choose a PDF or image</span>}
              </label>
            )}

            {(importing || reviewing) && (
              <div className="upload-sheet-spinner-row">
                <div className="upload-sheet-spinner" aria-hidden="true" />
                <span>{reviewing ? 'Comparing with existing…' : 'Parsing schedule…'}</span>
              </div>
            )}

            {error && !importing && <p className="upload-sheet-error">{error}</p>}

            {applied && result && (
              <div className="upload-sheet-success">
                ✓ Published — jumped to week of {formatWeekOf(mondayWeekId(result.weekId))}
              </div>
            )}

            {diff && !applied && (
              <ImportDiffPreview diff={diff} student={result?.studentName} weekId={result?.weekId} />
            )}

            {log.length > 0 && (
              <button className="upload-sheet-log-btn" onClick={() => setShowLog(true)}>
                View Log ({log.length})
              </button>
            )}

          </div>

          <div className="upload-sheet-footer">
            <button className="upload-sheet-cancel" onClick={onClose}>
              {applied ? 'Close' : 'Cancel'}
            </button>
            {!applied && diff && (
              <button className="upload-sheet-apply-btn" onClick={handlePublish}>Publish</button>
            )}
            {!applied && !diff && !result && (
              <button className="upload-sheet-import-btn" onClick={importSchedule} disabled={!file || importing}>
                {importing ? 'Parsing…' : 'Parse'}
              </button>
            )}
          </div>

        </div>
      </div>

      {showLog && <DebugSheet log={log} onClose={() => setShowLog(false)} />}
    </>
  );
}
