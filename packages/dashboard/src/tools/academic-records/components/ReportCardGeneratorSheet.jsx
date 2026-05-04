import { useState, useEffect, useMemo, useRef } from 'react';
import { GRADING_TYPE_LETTER } from '../constants/academics.js';
import { generateReportCardPDF } from '../utils/generateReportCardPDF.js';
import './ReportCardGeneratorSheet.css';

function todayFormatted() {
  const t = new Date();
  return t.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ReportCardGeneratorSheet({
  open, onClose, onSaveReport, student, students, activeSchoolYear, selectedQuarterId,
  enrollments, courses, grades, attendanceDays, reportNotes, saveNote, activities,
  schoolName, tagline,
}) {
  const [localStudentId, setLocalStudentId] = useState(student ?? (students ?? [])[0]?.studentId ?? '');
  const [localQuarter, setLocalQuarter]     = useState(selectedQuarterId);
  const [includeGrades, setIncludeGrades]   = useState(true);
  const [includeAttend, setIncludeAttend]   = useState(true);
  const [includeNotes, setIncludeNotes]     = useState(true);
  const [includeSig, setIncludeSig]         = useState(true);
  const [includeActs, setIncludeActs]       = useState(false);
  const [notes, setNotes]                   = useState('');
  const [saved, setSaved]                   = useState(false);
  const [generating, setGenerating]         = useState(false);
  const savedTimer = useRef(null);

  const localStudentName = (students ?? []).find(s => s.studentId === localStudentId)?.name ?? localStudentId;

  useEffect(() => {
    if (!open) return;
    const initId = student ?? (students ?? [])[0]?.studentId ?? '';
    setLocalStudentId(initId);
    setLocalQuarter(selectedQuarterId);
    const existing = (reportNotes ?? []).find(n => n.studentId === initId && n.quarterId === selectedQuarterId);
    setNotes(existing?.notes ?? '');
    setSaved(false); setGenerating(false);
  }, [open, student, selectedQuarterId, reportNotes]);

  useEffect(() => {
    if (localQuarter === 'annual') return;
    const existing = (reportNotes ?? []).find(n => n.studentId === localStudentId && n.quarterId === localQuarter);
    setNotes(existing?.notes ?? '');
  }, [localStudentId, localQuarter, reportNotes]);

  // Re-fill notes when reportNotes loads after the sheet is already open
  useEffect(() => {
    if (!open || localQuarter === 'annual') return;
    if (notes.trim() !== '') return;
    const existing = (reportNotes ?? []).find(n => n.studentId === localStudentId && n.quarterId === localQuarter);
    if (existing?.notes) setNotes(existing.notes);
  }, [reportNotes]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimeout(savedTimer.current), []);

  const courseById = useMemo(() => new Map((courses ?? []).map(c => [c.id, c])), [courses]);
  const studentEnr = useMemo(() => (enrollments ?? []).filter(e => e.studentId === localStudentId), [enrollments, localStudentId]);
  const studentActs = useMemo(() => (activities ?? []).filter(a => a.studentId === localStudentId), [activities, localStudentId]);
  const quarters = activeSchoolYear?.quarters ?? [];
  const isAnnual = localQuarter === 'annual';
  const quarterLabel = isAnnual ? 'Annual' : (quarters.find(q => q.id === localQuarter)?.label ?? 'Quarter');
  const periodLabel = isAnnual ? `Annual — ${activeSchoolYear?.label ?? ''}` : quarterLabel;
  const studentGradeLevel = studentEnr[0]?.gradeLevel ?? null;
  const attendPct = attendanceDays.required > 0 ? Math.min(100, Math.round((attendanceDays.attended / attendanceDays.required) * 100)) : 0;

  async function handleNotesBlur() {
    if (!saveNote || isAnnual) return;
    try {
      await saveNote(localStudentId, localQuarter, notes);
      setSaved(true); clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 2000);
    } catch { /* error surfaces via hook */ }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const pdfBytes = await generateReportCardPDF({
        student: localStudentName, gradeLevel: studentGradeLevel, periodLabel,
        yearLabel: activeSchoolYear?.label ?? '—', isAnnual,
        selectedQuarterId: localQuarter, studentEnrollments: studentEnr,
        courseById, grades, quarters, attendanceDays,
        includeGrades, includeAttendance: includeAttend, includeNotes, includeSignature: includeSig,
        includeActivities: includeActs, activitiesForStudent: studentActs, notes,
        schoolName: schoolName ?? 'My Homeschool', tagline: tagline ?? '',
      });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ReportTranscript_${localStudentName}_${periodLabel.replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      if (onSaveReport) {
        await onSaveReport({ studentId: localStudentId, periodLabel, yearLabel: activeSchoolYear?.label ?? '—', notes,
          includeToggles: { includeGrades, includeAttendance: includeAttend, includeNotes, includeSignature: includeSig, includeActivities: includeActs } }, pdfBytes);
      }
    } catch (err) { console.warn('PDF generation failed', err); }
    finally { setGenerating(false); }
  }

  if (!open) return null;

  return (
    <div className="rcg-sheet-overlay" onClick={onClose}>
      <div className="rcg-sheet" onClick={e => e.stopPropagation()}>
        <div className="rcg-sheet-handle" aria-hidden="true" />
        <header className="rcg-sheet-header">
          <h2 className="rcg-sheet-title">Report / Transcript Generator</h2>
          <button className="rcg-sheet-close" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="rcg-sheet-body">
          <div className="rcg-field">
            <span className="rcg-label">Student</span>
            <div className="rcg-pills">{(students ?? []).map(s => (
              <button key={s.studentId} className={`rcg-pill${s.studentId === localStudentId ? ' active' : ''}`} onClick={() => setLocalStudentId(s.studentId)}>{s.name}</button>
            ))}</div>
          </div>
          <div className="rcg-field">
            <span className="rcg-label">Report period</span>
            <div className="rcg-pills">
              {quarters.map(q => (
                <button key={q.id} className={`rcg-pill${q.id === localQuarter ? ' active' : ''}`} onClick={() => setLocalQuarter(q.id)}>{q.label}</button>
              ))}
              <button className={`rcg-pill rcg-annual-pill${isAnnual ? ' active' : ''}`} onClick={() => setLocalQuarter('annual')}>Annual</button>
            </div>
          </div>
          <div className="rcg-field">
            <span className="rcg-label">Include</span>
            {[['Grades', includeGrades, setIncludeGrades], ['Attendance', includeAttend, setIncludeAttend],
              ['Teacher Notes', includeNotes, setIncludeNotes], ['Signature Line', includeSig, setIncludeSig],
              ['Activities', includeActs, setIncludeActs]].map(([lbl, val, set]) => (
              <div key={lbl} className="rcg-toggle-row">
                <span className="rcg-toggle-label">{lbl}</span>
                <button type="button" className={`rcg-toggle${val ? ' rcg-toggle--on' : ''}`} onClick={() => set(v => !v)} />
              </div>
            ))}
          </div>
          <div className="rcg-field">
            <span className="rcg-label">Teacher notes {saved && <span className="rcg-saved">Saved</span>}</span>
            <textarea className="rcg-notes" rows={3} value={notes} onChange={e => setNotes(e.target.value)}
              onBlur={handleNotesBlur} placeholder="Add notes about this student's performance..." />
          </div>
          <p className="rcg-section-label">Preview</p>
          <div className="rcg-preview-card">
            <div className="rcg-preview-header">
              <div className="rcg-preview-school">{schoolName ?? 'My Homeschool'}</div>
              {(tagline ?? '') && <div className="rcg-preview-tagline">{tagline}</div>}
              <div className="rcg-preview-type">Report / Transcript — {periodLabel}</div>
            </div>
            <div className="rcg-preview-student">
              <span><strong>{localStudentName}</strong>{studentGradeLevel ? ` · Grade ${studentGradeLevel}` : ''}</span>
              <span>{activeSchoolYear?.label ?? '—'} · {todayFormatted()}</span>
            </div>
            {includeGrades && !isAnnual && (
              <table className="rcg-preview-grades">
                <thead><tr><th>Course</th><th>Curriculum</th><th>Scale</th><th>Grade</th></tr></thead>
                <tbody>{studentEnr.map(enr => {
                  const c = courseById.get(enr.courseId);
                  const g = (grades ?? []).find(gr => gr.enrollmentId === enr.id && gr.quarterId === localQuarter);
                  const isLetter = (c?.gradingType ?? GRADING_TYPE_LETTER) === GRADING_TYPE_LETTER;
                  return (<tr key={enr.id}><td>{c?.name ?? '—'}</td><td>{c?.curriculum ?? '—'}</td>
                    <td>{isLetter ? 'Letter' : 'E/S/N/U'}</td>
                    <td className="rcg-grade-cell">{g ? `${g.grade}${g.percent != null ? ` (${g.percent}%)` : ''}` : '—'}</td></tr>);
                })}</tbody>
              </table>
            )}
            {includeGrades && isAnnual && (
              <table className="rcg-preview-grades">
                <thead><tr><th>Course</th><th>Curriculum</th>{quarters.map(q => <th key={q.id}>{q.label}</th>)}</tr></thead>
                <tbody>{studentEnr.map(enr => {
                  const c = courseById.get(enr.courseId);
                  return (<tr key={enr.id}><td>{c?.name ?? '—'}</td><td>{c?.curriculum ?? '—'}</td>
                    {quarters.map(q => { const g = (grades ?? []).find(gr => gr.enrollmentId === enr.id && gr.quarterId === q.id); return <td key={q.id} className="rcg-grade-cell">{g?.grade ?? '—'}</td>; })}
                  </tr>);
                })}</tbody>
              </table>
            )}
            {includeAttend && (
              <div className="rcg-preview-attendance">
                <div className="rcg-att-box"><div className="rcg-att-num">{attendanceDays.schoolDays}</div><div className="rcg-att-lbl">Scheduled</div></div>
                <div className="rcg-att-box"><div className="rcg-att-num">{attendanceDays.sick}</div><div className="rcg-att-lbl">Absent</div></div>
                <div className="rcg-att-box"><div className="rcg-att-num">{attendanceDays.attended}</div><div className="rcg-att-lbl">Present</div></div>
                <div className="rcg-att-box"><div className="rcg-att-num">{attendPct}%</div><div className="rcg-att-lbl">Rate</div></div>
              </div>
            )}
            {includeNotes && notes.trim() && <div className="rcg-preview-notes">{notes}</div>}
            {includeActs && studentActs.length > 0 && (
              <div className="rcg-preview-activities">
                <div className="rcg-preview-act-label">Activities</div>
                {studentActs.map(a => (
                  <div key={a.id} className="rcg-preview-act-row">
                    <span className="rcg-preview-act-name">{a.name}</span>
                    <span className="rcg-preview-act-dates">{a.startDate ?? '—'} – {a.ongoing ? 'Ongoing' : (a.endDate ?? '—')}</span>
                    {a.notes && <span className="rcg-preview-act-notes">{a.notes}</span>}
                  </div>
                ))}
              </div>
            )}
            <div className="rcg-preview-footer">
              <span>{schoolName ?? 'My Homeschool'}</span>
              {includeSig && <span className="rcg-sig-line">Signature _______________</span>}
            </div>
          </div>
          <button className="rcg-generate-btn" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
