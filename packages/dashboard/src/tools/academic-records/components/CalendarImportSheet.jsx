import { useState, useRef } from 'react';
import { compressImage } from '../../../utils/compressImage.js';
import './CalendarImportSheet.css';

// Bottom sheet that accepts an iCal, PDF, or image of a school calendar,
// sends it to the parse-calendar Netlify Function, and parses out school
// breaks. User reviews the results before confirming.
//
// Props:
//   open           — boolean
//   onClose        — () => void
//   onImport       — (breaks: Array<{ label, startDate, endDate }>) => Promise
//   yearLabel      — string, displayed in the header for context
//   existingBreaks — Array<{ startDate, endDate }>, used for dedup in preview
//   uid            — string, Firebase user ID (required for rate limiting)

const ACCEPT = '.ics,.ical,.pdf,.png,.jpg,.jpeg,.webp';

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function mediaTypeFor(file) {
  const t = file.type;
  if (t === 'application/pdf') return 'application/pdf';
  if (t === 'text/calendar') return 'text/plain';
  if (t.startsWith('image/')) return t;
  if (file.name.endsWith('.ics') || file.name.endsWith('.ical')) return 'text/plain';
  return 'application/octet-stream';
}

function fileTypeLabel(file) {
  if (file.name.endsWith('.ics') || file.name.endsWith('.ical')) return 'iCal (.ics)';
  if (file.type === 'application/pdf') return 'PDF';
  if (file.type.startsWith('image/')) return 'Image';
  return 'File';
}

function isDuplicate(b, existing) {
  return (existing ?? []).some(e => e.startDate === b.startDate && e.endDate === b.endDate);
}

function buildCalendarLog({ file, startTime, endTime, rawText, parsed, existingBreaks }) {
  const lines = [];
  lines.push(`File: ${file.name}`);
  lines.push(`Size: ${(file.size / 1024).toFixed(1)} KB`);
  lines.push(`Type: ${fileTypeLabel(file)}`);
  lines.push(`Request: ${new Date(startTime).toISOString()}`);
  lines.push(`Response: ${endTime - startTime}ms`);
  lines.push('');
  lines.push('── Raw response (first 500 chars) ──');
  lines.push(rawText.slice(0, 500));
  lines.push('');
  const dupes = (parsed ?? []).filter(b => isDuplicate(b, existingBreaks)).length;
  lines.push(`Parse result: ${parsed?.length ?? 0} breaks found, ${dupes} duplicate${dupes !== 1 ? 's' : ''}`);
  lines.push('');
  (parsed ?? []).forEach(b => {
    const tag = isDuplicate(b, existingBreaks) ? ' [DUPLICATE]' : '';
    lines.push(`${b.label} — ${b.startDate} → ${b.endDate}${tag}`);
  });
  return lines.join('\n');
}

export default function CalendarImportSheet({ open, onClose, onImport, yearLabel, existingBreaks, uid }) {
  const fileRef = useRef(null);
  const [file, setFile]           = useState(null);
  const [importing, setImporting] = useState(false);
  const [error, setError]         = useState(null);
  const [results, setResults]     = useState(null);
  const [debugLog, setDebugLog]   = useState('');
  const [showLog, setShowLog]     = useState(false);

  function reset() { setFile(null); setError(null); setResults(null); setImporting(false); setDebugLog(''); setShowLog(false); }
  function handleClose() { reset(); onClose(); }

  async function handleParse() {
    if (!file) return;
    setImporting(true); setError(null); setResults(null); setDebugLog(''); setShowLog(false);
    const startTime = Date.now();
    let rawText = '';
    try {
      const processedFile = file.type.startsWith('image/') ? await compressImage(file) : file;
      const base64 = await readFileAsBase64(processedFile);
      const mediaType = mediaTypeFor(processedFile);

      const resp = await fetch('/.netlify/functions/parse-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: base64, mediaType, fileName: file.name, uid }),
      });

      if (resp.status === 429) {
        throw new Error('Daily import limit reached (5/day). Try again tomorrow.');
      }
      if (!resp.ok) {
        const body = await resp.text();
        throw new Error(`API error ${resp.status}: ${body.slice(0, 200)}`);
      }

      const data = await resp.json();
      const parsed = data.breaks;
      rawText = JSON.stringify(parsed);
      if (!Array.isArray(parsed)) throw new Error('Expected an array of breaks');
      const endTime = Date.now();
      setResults(parsed);
      setDebugLog(buildCalendarLog({ file, startTime, endTime, rawText, parsed, existingBreaks }));
    } catch (err) {
      const endTime = Date.now();
      setDebugLog(buildCalendarLog({ file, startTime, endTime, rawText, parsed: null, existingBreaks }));
      setError(err?.message ?? 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  async function handleConfirm() {
    const newBreaks = (results ?? []).filter(b => !isDuplicate(b, existingBreaks));
    if (!newBreaks.length) return;
    setImporting(true);
    try { await onImport(newBreaks); handleClose(); }
    catch (err) { setError(err?.message ?? 'Failed to save breaks'); setImporting(false); }
  }

  if (!open) return null;

  const newCount = (results ?? []).filter(b => !isDuplicate(b, existingBreaks)).length;
  const allDupes = results && newCount === 0;

  return (
    <div className="ci-sheet-overlay" onClick={handleClose}>
      <div className="ci-sheet" onClick={e => e.stopPropagation()}>
        <div className="ci-sheet-handle" aria-hidden="true" />
        <header className="ci-sheet-header">
          <h2 className="ci-sheet-title">Import Calendar — {yearLabel ?? 'School Year'}</h2>
          <button className="ci-sheet-close" onClick={handleClose} aria-label="Close">✕</button>
        </header>
        <div className="ci-sheet-body">
          {!results && !importing && (
            <>
              <p className="ci-help">Upload a school calendar (iCal, PDF, or photo) to automatically detect breaks and holidays.</p>
              <div className={`ci-file-zone${file ? ' ci-file-zone--has-file' : ''}`} onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept={ACCEPT} style={{ display: 'none' }}
                  onChange={e => { setFile(e.target.files?.[0] ?? null); setError(null); }} />
                {file ? <span className="ci-file-name">{file.name}</span> : <span className="ci-file-prompt">Tap to select a file</span>}
              </div>
            </>
          )}
          {importing && <div className="ci-spinner-wrap"><div className="ci-spinner" /><p className="ci-spinner-label">Parsing calendar…</p></div>}
          {error && !importing && <div className="ci-error">⚠ {error}</div>}
          {results && !importing && (
            <div className="ci-results">
              <p className="ci-results-count">{results.length} break{results.length !== 1 ? 's' : ''} found{newCount < results.length ? ` · ${newCount} new` : ''}</p>
              {results.map((b, i) => {
                const dupe = isDuplicate(b, existingBreaks);
                return (
                  <div key={i} className={`ci-result-row${dupe ? ' ci-result-row--duplicate' : ''}`}>
                    <div className="ci-result-info">
                      <span className="ci-result-label">{b.label}</span>
                      <span className="ci-result-dates">{b.startDate} — {b.endDate}</span>
                    </div>
                    {dupe && <span className="ci-duplicate-badge">Already imported</span>}
                  </div>
                );
              })}
              {debugLog && (() => {
                const logCount = debugLog.split('\n').filter(l => l.trim()).length;
                return <button className="ci-log-btn" onClick={() => setShowLog(v => !v)}>{showLog ? `Hide Log (${logCount})` : `View Log (${logCount})`}</button>;
              })()}
              {showLog && <div className="ci-log-panel">{debugLog}</div>}
            </div>
          )}
        </div>
        <footer className="ci-sheet-footer">
          <button className="ci-cancel-btn" onClick={handleClose}>Cancel</button>
          {!results ? (
            <button className="ci-parse-btn" onClick={handleParse} disabled={!file || importing}>
              {importing ? 'Parsing…' : 'Parse Calendar'}
            </button>
          ) : (
            <button className="ci-import-btn" onClick={handleConfirm} disabled={importing || allDupes}>
              {allDupes ? 'All breaks already imported' : importing ? 'Saving…' : `Import ${newCount} Break${newCount !== 1 ? 's' : ''}`}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
