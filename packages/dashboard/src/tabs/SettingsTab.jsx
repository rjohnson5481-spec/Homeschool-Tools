import { useState } from 'react';
import { signOut } from '@homeschool/shared';
import { useSettings }  from '../tools/planner/hooks/useSettings.js';
import { addStudent, updateStudent, deleteStudent } from '../firebase/students.js';
import OnboardingFlow   from '../components/OnboardingFlow.jsx';
import { version }      from '../../package.json';
import './SettingsTab.css';
import './SettingsRow.css';
import './SettingsSubjects.css';
import DataBackupSection from './DataBackupSection.jsx';

// Props: user, students ([{ studentId, name, emoji, gradeLevel, order }]),
//        colorMode, onToggleDarkMode
export default function SettingsTab({ user, students, colorMode, onToggleDarkMode, schoolName }) {
  const uid = user?.uid;
  const { activeStudent, setActiveStudent, activeSubjects, saveSubjects } = useSettings(uid);
  const isDark = colorMode === 'dark';

  // Subjects state
  const [showSubjects, setShowSubjects]   = useState(false);
  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubject, setNewSubject]       = useState('');
  const [clearing, setClearing]           = useState(false);

  // Student form state — shared between add and edit
  const [addOpen, setAddOpen]         = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [confirmId, setConfirmId]     = useState(null);
  const [sName, setSName]             = useState('');
  const [sEmoji, setSEmoji]           = useState('');
  const [sGrade, setSGrade]           = useState('');

  // School setup overlay
  const [showOnboarding, setShowOnboarding] = useState(false);

  function openAdd()   { setSName(''); setSEmoji(''); setSGrade(''); setAddOpen(true); setEditStudent(null); }
  function openEdit(s) { setSName(s.name); setSEmoji(s.emoji ?? ''); setSGrade(s.gradeLevel ?? ''); setEditStudent(s); setAddOpen(false); }
  function closeForm() { setAddOpen(false); setEditStudent(null); setConfirmId(null); }

  async function handleAdd() {
    if (!sName.trim() || !uid) return;
    await addStudent(uid, { name: sName.trim(), emoji: sEmoji.trim(), gradeLevel: sGrade.trim() }, students.length);
    closeForm();
  }

  async function handleSave() {
    if (!sName.trim() || !editStudent || !uid) return;
    await updateStudent(uid, editStudent.studentId, { name: sName.trim(), emoji: sEmoji.trim(), gradeLevel: sGrade.trim() });
    closeForm();
  }

  async function handleRemove() {
    if (!confirmId || !uid) return;
    await deleteStudent(uid, confirmId);
    closeForm();
  }

  function removeSubject(s) { saveSubjects(activeSubjects.filter(x => x !== s)); }
  function commitSubject() {
    if (newSubject.trim()) saveSubjects([...activeSubjects, newSubject.trim()]);
    setNewSubject(''); setAddingSubject(false);
  }

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

  if (showOnboarding) return (
    <OnboardingFlow uid={uid} onComplete={() => setShowOnboarding(false)} />
  );

  return (
    <div className="st-tab">
      <div className="st-grid">

        <div className="st-col">
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
                    {students.map(s => (
                      <button
                        key={s.studentId}
                        className={`st-subjects-tab${activeStudent === s.name ? ' st-subjects-tab--active' : ''}`}
                        onClick={() => setActiveStudent(s.name)}
                      >{s.name}</button>
                    ))}
                  </div>
                  {activeSubjects.map(subj => (
                    <div key={subj} className="st-subject-chip">
                      <span>{subj}</span>
                      <button className="st-subject-remove" onClick={() => removeSubject(subj)} aria-label="Remove subject">✕</button>
                    </div>
                  ))}
                  {addingSubject ? (
                    <input className="st-input" value={newSubject} autoFocus placeholder="Subject name…"
                      onChange={e => setNewSubject(e.target.value)}
                      onBlur={commitSubject}
                      onKeyDown={e => e.key === 'Enter' && commitSubject()} />
                  ) : (
                    <button className="st-subjects-add" onClick={() => setAddingSubject(true)}>+ Add Subject</button>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="st-col">
          <section>
            <p className="st-section-label"><span>Students</span></p>
            <div className="st-card">
              {students.map(s => (
                editStudent?.studentId === s.studentId ? (
                  <div key={s.studentId} className="st-student-form">
                    <input className="st-input" value={sName} onChange={e => setSName(e.target.value)} placeholder="Name" autoFocus />
                    <input className="st-input" value={sEmoji} onChange={e => setSEmoji(e.target.value)} placeholder="😊" />
                    <input className="st-input" value={sGrade} onChange={e => setSGrade(e.target.value)} placeholder="Grade (e.g. 3rd)" />
                    {confirmId === s.studentId ? (
                      <div className="st-confirm-row">
                        <span className="st-confirm-msg">Remove {s.name}?</span>
                        <div className="st-confirm-actions">
                          <button className="st-confirm-yes" onClick={handleRemove}>Remove</button>
                          <button className="st-confirm-cancel" onClick={() => setConfirmId(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="st-form-actions">
                        <button className="st-save-btn" onClick={handleSave} disabled={!sName.trim()}>Save</button>
                        <button className="st-cancel-btn" onClick={closeForm}>Cancel</button>
                        <button className="st-remove-btn" onClick={() => setConfirmId(s.studentId)}>Remove</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div key={s.studentId} className="st-row">
                    <span className="st-row-icon st-row-icon--emoji">{s.emoji || '🎓'}</span>
                    <div className="st-row-body">
                      <span className="st-row-title">{s.name}</span>
                      {s.gradeLevel && <span className="st-row-sub">{s.gradeLevel}</span>}
                    </div>
                    <button className="st-row-edit" onClick={() => openEdit(s)}>Edit</button>
                  </div>
                )
              ))}
              {addOpen ? (
                <div className="st-student-form">
                  <input className="st-input" value={sName} onChange={e => setSName(e.target.value)} placeholder="Name" autoFocus />
                  <input className="st-input" value={sEmoji} onChange={e => setSEmoji(e.target.value)} placeholder="😊" />
                  <input className="st-input" value={sGrade} onChange={e => setSGrade(e.target.value)} placeholder="Grade (e.g. 3rd)" />
                  <div className="st-form-actions">
                    <button className="st-save-btn" onClick={handleAdd} disabled={!sName.trim()}>Add</button>
                    <button className="st-cancel-btn" onClick={closeForm}>Cancel</button>
                  </div>
                </div>
              ) : !editStudent && (
                <button className="st-row st-row--add" onClick={openAdd}>
                  <span className="st-row-icon st-row-icon--add">+</span>
                  <span className="st-row-title st-row-title--add">Add Student</span>
                </button>
              )}
            </div>
          </section>

          <section>
            <p className="st-section-label"><span>School Setup</span></p>
            <div className="st-card">
              <button className="st-row st-row--clickable" onClick={() => setShowOnboarding(true)}>
                <span className="st-row-icon">🏫</span>
                <div className="st-row-body">
                  <span className="st-row-title">Edit School Info</span>
                  <span className="st-row-sub">Change your school name and tagline</span>
                </div>
                <span className="st-chevron">›</span>
              </button>
            </div>
          </section>

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

          <DataBackupSection uid={uid} />
        </div>

      </div>

      <div className="st-version">
        <div className="st-version-name">{schoolName ?? 'My Homeschool'}</div>
        <div className="st-version-line">v{version} · homeschool.grasphislove.com</div>
      </div>
    </div>
  );
}
