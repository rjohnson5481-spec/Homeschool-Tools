import { useState } from 'react';
import { doc, collection, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@homeschool/shared';
import logo from '@homeschool/shared/assets/logo.png';
import './OnboardingFlow.css';

export default function OnboardingFlow({ uid, onComplete, initialSchoolName = '', initialTagline = '' }) {
  const [step, setStep] = useState(1);

  // Step 1
  const [schoolName, setSchoolName] = useState(initialSchoolName);
  const [tagline, setTagline]       = useState(initialTagline);
  const [saving, setSaving]         = useState(false);

  // Step 2
  const [students, setStudents]   = useState([]);
  const [newName, setNewName]     = useState('');
  const [newEmoji, setNewEmoji]   = useState('');
  const [newGrade, setNewGrade]   = useState('');
  const [finishing, setFinishing] = useState(false);

  async function handleNext() {
    if (!schoolName.trim()) return;
    setSaving(true);
    try {
      await setDoc(
        doc(db, `users/${uid}/settings/school`),
        { name: schoolName.trim(), tagline: tagline.trim() },
        { merge: true }
      );
      setStep(2);
    } finally {
      setSaving(false);
    }
  }

  function handleAddStudent() {
    if (!newName.trim()) return;
    setStudents(prev => [...prev, {
      name:       newName.trim(),
      emoji:      newEmoji.trim() || '🎓',
      gradeLevel: newGrade.trim(),
    }]);
    setNewName(''); setNewEmoji(''); setNewGrade('');
  }

  function handleRemove(index) {
    setStudents(prev => prev.filter((_, i) => i !== index));
  }

  async function handleFinish() {
    if (!students.length) return;
    setFinishing(true);
    try {
      await Promise.all(students.map(async (s, order) => {
        const ref = doc(collection(db, `users/${uid}/students`));
        await setDoc(ref, {
          studentId:  ref.id,
          name:       s.name,
          emoji:      s.emoji,
          gradeLevel: s.gradeLevel,
          order,
          createdAt: serverTimestamp(),
        });
      }));
      onComplete();
    } finally {
      setFinishing(false);
    }
  }

  function handleNameKey(e) { if (e.key === 'Enter') handleAddStudent(); }

  return (
    <div className="onboarding">
      <div className="onboarding-card">

        <div className="onboarding-steps">
          {[1, 2].map(n => (
            <div key={n} className={`onboarding-dot${n === step ? ' onboarding-dot--active' : ''}`} />
          ))}
        </div>
        <p className="onboarding-step-label">
          {step === 1 ? 'School Setup' : 'Add Students'}
        </p>

        <img src={logo} alt="ILA" className="onboarding-logo" />

        {step === 1 && (
          <>
            <h2 className="onboarding-heading">School Setup</h2>
            <p className="onboarding-sub">Name your school before we get started.</p>

            <div className="onboarding-field">
              <label className="onboarding-label">School Name</label>
              <input
                className="onboarding-input"
                placeholder="e.g. River Valley Academy"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="onboarding-field">
              <label className="onboarding-label">Tagline <span className="onboarding-optional">(optional)</span></label>
              <input
                className="onboarding-input"
                placeholder="e.g. Faith · Knowledge · Strength"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
              />
            </div>

            <button
              className="onboarding-btn"
              onClick={handleNext}
              disabled={!schoolName.trim() || saving}
            >
              {saving ? 'Saving…' : 'Next'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="onboarding-heading">Add Your Students</h2>
            <p className="onboarding-sub">You can add more students later in Settings.</p>

            {students.length > 0 && (
              <div className="onboarding-student-list">
                {students.map((s, i) => (
                  <div key={i} className="onboarding-student-row">
                    <span className="onboarding-student-emoji">{s.emoji}</span>
                    <span className="onboarding-student-name">{s.name}</span>
                    {s.gradeLevel && (
                      <span className="onboarding-student-grade">{s.gradeLevel}</span>
                    )}
                    <button className="onboarding-remove-btn" onClick={() => handleRemove(i)} aria-label="Remove">✕</button>
                  </div>
                ))}
              </div>
            )}

            <div className="onboarding-add-form">
              <div className="onboarding-field">
                <label className="onboarding-add-label">Name <span className="onboarding-required">*</span></label>
                <input
                  className="onboarding-input"
                  placeholder="Student name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={handleNameKey}
                />
              </div>
              <div className="onboarding-field">
                <label className="onboarding-add-label">Emoji</label>
                <input
                  className="onboarding-input"
                  placeholder="😊"
                  value={newEmoji}
                  onChange={e => setNewEmoji(e.target.value)}
                />
                <span className="onboarding-sublabel">Leave blank for default 🎓</span>
              </div>
              <div className="onboarding-field">
                <label className="onboarding-add-label">Grade Level</label>
                <input
                  className="onboarding-input"
                  placeholder="e.g. 3rd"
                  value={newGrade}
                  onChange={e => setNewGrade(e.target.value)}
                />
                <span className="onboarding-sublabel">Optional — e.g. 3rd, 4th, K</span>
              </div>
              <button
                className="onboarding-add-btn"
                onClick={handleAddStudent}
                disabled={!newName.trim()}
              >
                Add
              </button>
            </div>

            <button
              className="onboarding-btn"
              onClick={handleFinish}
              disabled={!students.length || finishing}
            >
              {finishing ? 'Saving…' : 'Finish'}
            </button>
          </>
        )}

      </div>
    </div>
  );
}
