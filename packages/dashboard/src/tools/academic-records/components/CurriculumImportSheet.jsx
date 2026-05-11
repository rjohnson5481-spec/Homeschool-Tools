import { useState, useRef } from 'react';
import { compressImage } from '../../../utils/compressImage.js';
import './CurriculumImportSheet.css';

// Props:
//   open     — boolean
//   onClose  — () => void
//   onImport — (courses: Array<{ name, curriculum, gradingType }>) => Promise
//   courses  — Array, existing courses for dedup
//   uid      — string, Firebase user ID (required for rate limiting)

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp';

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader(); r.onload = () => resolve(r.result.split(',')[1]); r.onerror = reject; r.readAsDataURL(file);
  });
}

function mediaTypeFor(file) {
  if (file.type === 'application/pdf') return 'application/pdf';
  if (file.type.startsWith('image/')) return file.type;
  return 'application/octet-stream';
}

function fileTypeLabel(file) {
  if (file.type === 'application/pdf') return 'PDF';
  if (file.type.startsWith('image/')) return 'Image';
  return 'File';
}

function isDuplicate(parsed, existing) {
  const pn = parsed.name?.toLowerCase() ?? parsed.title?.toLowerCase() ?? '';
  return (existing ?? []).some(c => {
    const en = c.name.toLowerCase();
    return en === pn || en.includes(pn) || pn.includes(en);
  });
}

function buildCurriculumLog({ file, startTime, endTime, rawText, parsed, courses }) {
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
  const dupes = (parsed ?? []).filter(c => isDuplicate(c, courses)).length;
  lines.push(`Parse result: ${parsed?.length ?? 0} courses found, ${dupes} duplicate${dupes !== 1 ? 's' : ''}`);
  lines.push('');
  (parsed ?? []).forEach(c => {
    const tag = isDuplicate(c, courses) ? ' [DUPLICATE]' : '';
    const name = c.name ?? c.title ?? '(unnamed)';
    const pub = c.curriculum ?? c.publisher ?? '(no publisher)';
    lines.push(`${name} — ${pub}${tag}`);
  });
  return lines.join('\n');
}

export default function CurriculumImportSheet({ open, onClose, onImport, courses, uid }) {
  const fileRef = useRef(null);
  const [file, setFile]         = useState(null);
  const [parsing, setParsing]   = useState(false);
  const [error, setError]       = useState(null);
  const [results, setResults]   = useState(null);
  const [removed, setRemoved]   = useState(new Set());
  const [debugLog, setDebugLog] = useState('');
  const [showLog, setShowLog]   = useState(false);

  function reset() { setFile(null); setParsing(false); setError(null); setResults(null); setRemoved(new Set()); setDebugLog(''); setShowLog(false); }
  function handleClose() { reset(); onClose(); }

  async function handleParse() {
    if (!file) return;
    setParsing(true); setError(null); setResults(null); setRemoved(new Set()); setDebugLog(''); setShowLog(false);
    const startTime = Date.now(); let rawText = '';
    try {
      const processedFile = file.type.startsWith('image/') ? await compressImage(file) : file;
      const base64 = await readFileAsBase64(processedFile);
      const mediaType = mediaTypeFor(processedFile);

      const resp = await fetch('/.netlify/functions/parse-curriculum', {
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
      rawText = JSON.stringify(data.courses);
      // Function returns { title, publisher }; normalize to { name, curriculum }
      const parsed = (data.courses ?? []).map(c => ({
        name: c.title ?? c.name ?? '',
        curriculum: c.publisher ?? c.curriculum ?? '',
        gradingType: c.gradingType ?? 'letter',
        gradeLevel: c.gradeLevel ?? '',
      }));
      if (!Array.isArray(parsed)) throw new Error('Expected an array of courses');
      const endTime = Date.now();
      setResults(parsed);
      setDebugLog(buildCurriculumLog({ file, startTime, endTime, rawText, parsed, courses }));
    } catch (err) {
      const endTime = Date.now();
      setDebugLog(buildCurriculumLog({ file, startTime, endTime, rawText, parsed: null, courses }));
      setError(err?.message ?? 'Import failed');
    } finally { setParsing(false); }
  }

  function handleRemove(idx) { setRemoved(prev => { const s = new Set(prev); s.add(idx); return s; }); }

  async function handleConfirm() {
    const newCourses = (results ?? []).filter((c, i) => !removed.has(i) && !isDuplicate(c, courses))
      .map(c => ({ name: c.name, curriculum: c.curriculum || '', gradingType: c.gradingType || 'letter' }));
    if (!newCourses.length) return;
    await onImport(newCourses);
    handleClose();
  }

  if (!open) return null;

  const newCount = results ? (results ?? []).filter((c, i) => !removed.has(i) && !isDuplicate(c, courses)).length : 0;
  const dupeCount = results ? (results ?? []).filter(c => isDuplicate(c, courses)).length : 0;
  const allDupes = results && newCount === 0;
  const logCount = debugLog ? debugLog.split('\n').filter(l => l.trim()).length : 0;

  return (
    <div className="cui-sheet-overlay" onClick={handleClose}>
      <div className="cui-sheet" onClick={e => e.stopPropagation()}>
        <div className="cui-sheet-handle" aria-hidden="true" />
        <header className="cui-sheet-header">
          <h2 className="cui-sheet-title">Import Curriculum</h2>
          <button className="cui-sheet-close" onClick={handleClose} aria-label="Close">✕</button>
        </header>
        <div className="cui-sheet-body">
          {!results && !parsing && (
            <>
              <p className="cui-help">Import a curriculum receipt or photo to automatically add courses to your catalog. Supports PDF and images.</p>
              <div className={`cui-file-zone${file ? ' cui-file-zone--has-file' : ''}`} onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept={ACCEPT} style={{ display: 'none' }}
                  onChange={e => { setFile(e.target.files?.[0] ?? null); setError(null); }} />
                {file ? <span className="cui-file-name">{file.name}</span> : <span className="cui-file-prompt">Tap to select a file</span>}
              </div>
            </>
          )}
          {parsing && <div className="cui-spinner-wrap"><div className="cui-spinner" /><p className="cui-spinner-label">Analyzing curriculum...</p></div>}
          {error && !parsing && <div className="cui-error">⚠ {error}</div>}
          {results && !parsing && (
            <div className="cui-results">
              <p className="cui-results-count">{results.length} course{results.length !== 1 ? 's' : ''} found · {newCount} new · {dupeCount} already in catalog</p>
              {results.map((c, i) => {
                const dupe = isDuplicate(c, courses);
                if (removed.has(i)) return null;
                return (
                  <div key={i} className={`cui-course-row${dupe ? ' cui-course-row--duplicate' : ''}`}>
                    <div className="cui-course-info">
                      <span className="cui-course-name">{c.name}</span>
                      <span className="cui-course-meta">{c.curriculum || '—'}{c.gradeLevel ? ` · Grade ${c.gradeLevel}` : ''}</span>
                    </div>
                    <span className="cui-course-badge">{c.gradingType === 'esnu' ? 'E/S/N/U' : 'Letter'}</span>
                    {dupe ? <span className="cui-duplicate-badge">Already in catalog</span> : <button className="cui-remove-btn" onClick={() => handleRemove(i)}>✕</button>}
                  </div>
                );
              })}
              {debugLog && <button className="cui-log-btn" onClick={() => setShowLog(v => !v)}>{showLog ? `Hide Log (${logCount})` : `View Log (${logCount})`}</button>}
              {showLog && <div className="cui-log-panel">{debugLog}</div>}
            </div>
          )}
        </div>
        <footer className="cui-sheet-footer">
          <button className="cui-cancel-btn" onClick={handleClose}>Cancel</button>
          {!results ? (
            <button className="cui-parse-btn" onClick={handleParse} disabled={!file || parsing}>{parsing ? 'Analyzing...' : 'Analyze Receipt'}</button>
          ) : (
            <button className="cui-import-btn" onClick={handleConfirm} disabled={allDupes}>
              {allDupes ? 'All courses already in catalog' : `Import ${newCount} Course${newCount !== 1 ? 's' : ''}`}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
