import { useState, useRef } from 'react';
import './CalendarImportSheet.css';

// Bottom sheet that accepts an iCal, PDF, or image of a school calendar,
// sends it to the Anthropic API (browser-direct, same pattern as TE Extractor),
// and parses out school breaks. User reviews the results before confirming.
//
// Props:
//   open       — boolean
//   onClose    — () => void
//   onImport   — (breaks: Array<{ label, startDate, endDate }>) => Promise
//   yearLabel  — string, displayed in the header for context

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

const SYSTEM_PROMPT = `You are a school calendar parser. Extract all school breaks, holidays, and non-school days from the provided calendar.

Return ONLY a JSON array. Each element: { "label": "Break Name", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" }.
For single-day holidays, startDate and endDate should be the same date.
Combine consecutive days under the same break label into one range.
Do not include weekends unless they are explicitly part of a named break.
Do not include any explanation — only the JSON array.`;

export default function CalendarImportSheet({ open, onClose, onImport, yearLabel }) {
  const fileRef = useRef(null);
  const [file, setFile]           = useState(null);
  const [importing, setImporting] = useState(false);
  const [error, setError]         = useState(null);
  const [results, setResults]     = useState(null); // Array<{ label, startDate, endDate }>

  function reset() { setFile(null); setError(null); setResults(null); setImporting(false); }

  function handleClose() { reset(); onClose(); }

  async function handleParse() {
    if (!file) return;
    setImporting(true); setError(null); setResults(null);
    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error('Anthropic API key not configured');

      const base64 = await readFileAsBase64(file);
      const mediaType = mediaTypeFor(file);
      const isImage = mediaType.startsWith('image/');
      const isPdf = mediaType === 'application/pdf';

      const contentBlock = (isImage || isPdf)
        ? { type: isImage ? 'image' : 'document', source: { type: 'base64', media_type: mediaType, data: base64 } }
        : { type: 'text', text: atob(base64) };

      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: [
            contentBlock,
            { type: 'text', text: `Extract all school breaks and holidays from this calendar. File: ${file.name}` },
          ] }],
        }),
      });

      if (!resp.ok) {
        const body = await resp.text();
        throw new Error(`API error ${resp.status}: ${body.slice(0, 200)}`);
      }

      const data = await resp.json();
      let text = data.content?.[0]?.text ?? '';
      text = text.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed)) throw new Error('Expected an array of breaks');
      setResults(parsed);
    } catch (err) {
      setError(err?.message ?? 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  async function handleConfirm() {
    if (!results?.length) return;
    setImporting(true);
    try {
      await onImport(results);
      handleClose();
    } catch (err) {
      setError(err?.message ?? 'Failed to save breaks');
      setImporting(false);
    }
  }

  if (!open) return null;

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
              <div
                className={`ci-file-zone${file ? ' ci-file-zone--has-file' : ''}`}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPT}
                  style={{ display: 'none' }}
                  onChange={e => { setFile(e.target.files?.[0] ?? null); setError(null); }}
                />
                {file ? (
                  <span className="ci-file-name">{file.name}</span>
                ) : (
                  <span className="ci-file-prompt">Tap to select a file</span>
                )}
              </div>
            </>
          )}

          {importing && (
            <div className="ci-spinner-wrap">
              <div className="ci-spinner" />
              <p className="ci-spinner-label">Parsing calendar…</p>
            </div>
          )}

          {error && !importing && (
            <div className="ci-error">⚠ {error}</div>
          )}

          {results && !importing && (
            <div className="ci-results">
              <p className="ci-results-count">{results.length} break{results.length !== 1 ? 's' : ''} found</p>
              {results.map((b, i) => (
                <div key={i} className="ci-result-row">
                  <span className="ci-result-label">{b.label}</span>
                  <span className="ci-result-dates">{b.startDate} — {b.endDate}</span>
                </div>
              ))}
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
            <button className="ci-import-btn" onClick={handleConfirm} disabled={importing || !results.length}>
              {importing ? 'Saving…' : `Import ${results.length} Break${results.length !== 1 ? 's' : ''}`}
            </button>
          )}
        </footer>

      </div>
    </div>
  );
}
