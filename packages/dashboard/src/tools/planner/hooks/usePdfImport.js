import { useState } from 'react';
import { DAY_SHORT } from '../constants/days.js';

// Reads a File as a base64 data string (strips the data: prefix).
function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function timestamp() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `[${h}:${m}:${s}]`;
}

// Renames 2nd+ occurrences of the same (dayIndex, subject) pair within a day
// to "{subject} (2)", "{subject} (3)" etc. Prevents silent data loss when a
// parsed PDF contains duplicate subject names on the same day (Firestore uses
// subject as the doc ID, so duplicates would overwrite each other on write).
function dedupeSubjects(days) {
  const seen = {};
  const renames = [];
  const dedupedDays = (days ?? []).map(day => ({
    ...day,
    lessons: (day.lessons ?? []).map(lesson => {
      const key = `${day.dayIndex}:${lesson.subject}`;
      if (!seen[key]) { seen[key] = 1; return lesson; }
      seen[key]++;
      const renamed = `${lesson.subject} (${seen[key]})`;
      renames.push({ dayIndex: day.dayIndex, original: lesson.subject, renamed });
      return { ...lesson, subject: renamed };
    }),
  }));
  return { dedupedDays, renames };
}

// Manages PDF import state, the fetch call to /api/parse-schedule, and an
// import debug log. Never calls the Anthropic API directly.
export function usePdfImport() {
  const [file, setFile]           = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');
  const [log, setLog]             = useState([]);

  function addLog(message) {
    setLog(prev => [...prev, `${timestamp()} ${message}`]);
  }

  function selectFile(selectedFile) {
    setFile(selectedFile);
    setResult(null);
    setError('');
    setLog([]);
    const sizeKB = (selectedFile.size / 1024).toFixed(1);
    addLog(`File selected: ${selectedFile.name} (${selectedFile.type}, ${sizeKB} KB)`);
  }

  async function importSchedule() {
    if (!file) return;
    setImporting(true);
    setError('');
    try {
      const base64 = await readAsBase64(file);
      const b64KB = (base64.length / 1024).toFixed(1);
      addLog(`Request: POST /api/parse-schedule · ${b64KB} KB · ${file.type}`);

      const t0 = Date.now();
      const res = await fetch('/api/parse-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: base64, mediaType: file.type }),
      });
      const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
      addLog(`Response: ${res.status} ${res.statusText} (${elapsed}s)`);

      const text = await res.text();
      const preview = text.length > 200 ? text.slice(0, 200) + '…' : text;
      addLog(`Raw: ${preview}`);

      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);

      const { student: studentName, ...restData } = data;
      const { dedupedDays, renames } = dedupeSubjects(restData.days);
      const totalLessons = dedupedDays.reduce((n, d) => n + (d.lessons?.length ?? 0), 0);
      const dayNames = dedupedDays.map(d => DAY_SHORT[d.dayIndex]).join(', ');
      const allSubjects = [...new Set(
        dedupedDays.flatMap(d => (d.lessons ?? []).map(l => l.subject))
      )];
      addLog(`Parsed: ${studentName} · ${restData.weekId} · ${dedupedDays.length} days (${dayNames})`);
      addLog(`Subjects (${allSubjects.length}): ${allSubjects.join(', ')}`);
      if (renames.length > 0) {
        addLog(`Renamed ${renames.length} duplicate(s): ${renames.map(r => `${DAY_SHORT[r.dayIndex]} "${r.original}" → "${r.renamed}"`).join(', ')}`);
      }
      addLog(`Total: ${totalLessons} lessons`);
      setResult({ ...restData, days: dedupedDays, studentName });
    } catch (err) {
      const msg = err.stack ? `${err.message}\n${err.stack}` : err.message;
      addLog(`Error: ${msg}`);
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    setFile(null);
    setImporting(false);
    setResult(null);
    setError('');
    setLog([]);
  }

  return { file, importing, result, error, log, selectFile, importSchedule, addLog, reset };
}

export function compareWithExisting(parsedData, existingData) {
  const diff = [];
  for (const { dayIndex, lessons } of (parsedData.days ?? [])) {
    for (const { subject, lesson } of (lessons ?? [])) {
      const existing = existingData[dayIndex]?.[subject];
      let status;
      if (!existing) status = 'new';
      else if (existing.lesson !== lesson) status = 'changed';
      else status = 'unchanged';
      diff.push({ dayIndex, subject, lesson, status });
    }
  }
  return diff;
}
