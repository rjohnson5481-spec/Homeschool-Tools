import { useState } from 'react';
import { signOut } from '@homeschool/shared';
import { useSettings } from '../tools/planner/hooks/useSettings.js';
import { version } from '../../package.json';
import './SettingsTab.css';
import './SettingsRow.css';
import './SettingsSubjects.css';

const STUDENT_EMOJI = { Orion: '😎', Malachi: '🐼' };

// Props: user (auth user), colorMode ('light'|'dark'), onToggleDarkMode (fn)
export default function SettingsTab({ user, colorMode, onToggleDarkMode }) {
  const uid = user?.uid;
  const {
    students, activeStudent, setActiveStudent,
    activeSubjects, saveStudents, saveSubjects,
  } = useSettings(uid);

  const [editingIdx, setEditingIdx]             = useState(null);
  const [editingValue, setEditingValue]         = useState('');
  const [confirmRemoveIdx, setConfirmRemoveIdx] = useState(null);
  const [showSubjects, setShowSubjects]         = useState(false);
  const [addingSubject, setAddingSubject]       = useState(false);
  const [newSubject, setNewSubject]             = useState('');
  const [clearing, setClearing]                 = useState(false);

  const namedStudents = students.filter(Boolean);
  const canRemove     = namedStudents.length > 1; // guard: never drop below 1
  const isDark        = colorMode === 'dark';

  function startEdit(i, name) { setEditingIdx(i); setEditingValue(name); }

  function commitEdit(i) {
    const trimmed = editingValue.trim();
    const next = trimmed
      ? students.map((n, j) => j === i ? trimmed : n)
      : students.filter((_, j) => j !== i);
    // Never drop below a single named student.
    if (next.filter(Boolean).length === 0) { setEditingIdx(null); return; }
    saveStudents(next);
    setEditingIdx(null);
  }

  function addStudent() {
    saveStudents([...students, '']);
    setEditingIdx(students.length);
    setEditingValue('');
  }

  function handleRemoveConfirm(i) {
    if (!canRemove) { setConfirmRemoveIdx(null); return; }
    saveStudents(students.filter((_, j) => j !== i));
    setConfirmRemoveIdx(null);
  }

  function removeSubject(s)  { saveSubjects(activeSubjects.filter(x => x !== s)); }
  function commitNewSubject() {
    if (newSubject.trim()) saveSubjects([...activeSubjects, newSubject.trim()]);
    setNewSubject(''); setAddingSubject(false);
  }

  // Same behavior as the retired planner SettingsSheet: clear all caches
  // (SW + HTTP) and hard-reload.
  function clearCache() {
    setClearing(true);
    if ('caches' in window) {
      caches.keys()
        .then(keys => Promise.all(keys.map(k => caches.delete(k))))
        .then(() => window.location.reload());
    } else {
      window.location.reload();
    }
  }

  return (
    <div className="st-tab">
      <div className="st-grid">

        <div className="st-col">
          {/* ── Appearance ── */}
          <section>
            <p className="st-section-label"><span>Appearance</span></p>
            <div className="st-card">
              <div className="st-row">
                <span className="st-row-icon">🌙</span>
                <div className="st-row-body">
                  <span className="st-row-title">Dark Mode</span>
                  <span className="st-row-sub">Currently {isDark ? 'on' : 'off'}</span>
                </div>
                <button
                  className={`st-toggle${isDark ? ' st-toggle--on' : ''}`}
                  onClick={onToggleDarkMode}
                  aria-label="Toggle dark mode"
                  aria-pressed={isDark}
                />
              </div>
            </div>
          </section>

          {/* ── Planner ── */}
          <section>
            <p className="st-section-label"><span>Planner</span></p>
            <div className="st-card">
              <button className="st-row st-row--clickable" onClick={() => setShowSubjects(v => !v)}>
                <span className="st-row-icon">📚</span>
                <div className="st-row-body">
                  <span className="st-row-title">Default Subjects</span>
                  <span className="st-row-sub">Per-student presets for Add Subject</span>
                </div>
                <span className="st-chevron">{showSubjects ? '▾' : '›'}</span>
              </button>
              {showSubjects && (
                <div className="st-subjects">
                  <div className="st-subjects-tabs">
                    {namedStudents.map(name => (
                      <button
                        key={name}
                        className={`st-subjects-tab${activeStudent === name ? ' st-subjects-tab--active' : ''}`}
                        onClick={() => setActiveStudent(name)}
                      >{name}</button>
                    ))}
                  </div>
                  {activeSubjects.map(subj => (
                    <div key={subj} className="st-subject-chip">
                      <span>{subj}</span>
                      <button className="st-subject-remove" onClick={() => removeSubject(subj)} aria-label="Remove subject">✕</button>
                    </div>
                  ))}
                  {addingSubject ? (
                    <input
                      className="st-input"
                      value={newSubject}
                      autoFocus
                      placeholder="Subject name…"
                      onChange={e => setNewSubject(e.target.value)}
                      onBlur={commitNewSubject}
                      onKeyDown={e => e.key === 'Enter' && commitNewSubject()}
                    />
                  ) : (
                    <button className="st-subjects-add" onClick={() => setAddingSubject(true)}>+ Add Subject</button>
                  )}
                </div>
              )}
              <div className="st-row">
                <span className="st-row-icon">📅</span>
                <div className="st-row-body">
                  <span className="st-row-title">School Year</span>
                  <span className="st-row-sub">Track academic year + ND compliance</span>
                </div>
                <span className="st-badge">Coming Soon</span>
              </div>
            </div>
          </section>
        </div>

        <div className="st-col">
          {/* ── Students ── */}
          <section>
            <p className="st-section-label"><span>Students</span></p>
            <div className="st-card">
              {students.map((name, i) => (
                <div key={i} className="st-row">
                  <span className="st-row-icon st-row-icon--emoji">{STUDENT_EMOJI[name] ?? '🧒'}</span>
                  {editingIdx === i ? (
                    <input
                      className="st-input st-input--inline"
                      value={editingValue}
                      autoFocus
                      onChange={e => setEditingValue(e.target.value)}
                      onBlur={() => commitEdit(i)}
                      onKeyDown={e => e.key === 'Enter' && commitEdit(i)}
                    />
                  ) : confirmRemoveIdx === i ? (
                    <>
                      <span className="st-confirm-msg">Remove {name}?</span>
                      <div className="st-confirm-actions">
                        <button className="st-confirm-yes" onClick={() => handleRemoveConfirm(i)}>Remove</button>
                        <button className="st-confirm-cancel" onClick={() => setConfirmRemoveIdx(null)}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="st-row-title st-row-name">{name || <em>(unnamed)</em>}</span>
                      <div className="st-row-actions">
                        <button className="st-row-edit" onClick={() => startEdit(i, name)}>Edit</button>
                        {canRemove && (
                          <button className="st-row-remove" onClick={() => setConfirmRemoveIdx(i)} aria-label="Remove student">✕</button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
              <button className="st-row st-row--add" onClick={addStudent}>
                <span className="st-row-icon st-row-icon--add">+</span>
                <span className="st-row-title st-row-title--add">Add Student</span>
              </button>
            </div>
          </section>

          {/* ── App ── */}
          <section>
            <p className="st-section-label"><span>App</span></p>
            <div className="st-card">
              <button className="st-row st-row--clickable" onClick={clearCache} disabled={clearing}>
                <span className="st-row-icon">🧹</span>
                <div className="st-row-body">
                  <span className="st-row-title">{clearing ? 'Clearing…' : 'Clear Cache'}</span>
                  <span className="st-row-sub">Reload with fresh assets</span>
                </div>
              </button>
              <button className="st-row st-row--clickable st-row--danger" onClick={() => signOut()}>
                <span className="st-row-icon">🚪</span>
                <div className="st-row-body">
                  <span className="st-row-title st-row-title--danger">Sign Out</span>
                  {user?.email && <span className="st-row-sub">{user.email}</span>}
                </div>
              </button>
            </div>
          </section>
        </div>

      </div>

      <div className="st-version">
        <div className="st-version-name">Iron &amp; Light Johnson Academy</div>
        <div className="st-version-line">v{version} · homeschool.grasphislove.com</div>
      </div>
    </div>
  );
}
