import { useState, useEffect } from 'react';
import { readSettingsSubjects, writeSettingsSubjects } from '../firebase/settings.js';

// Manages settings state: per-student default subjects.
// Student list is owned by useStudents (see hooks/useStudents.js).
// plannerStudent: optional — pre-loads subjects for the current planner student.
export function useSettings(uid, plannerStudent) {
  const [activeStudent, setActiveStudent]         = useState(null);
  const [subjectsByStudent, setSubjectsByStudent] = useState({});

  // Load subjects for activeStudent when it changes (always fresh).
  useEffect(() => {
    if (!uid || !activeStudent) return;
    readSettingsSubjects(uid, activeStudent).then(subjects => {
      setSubjectsByStudent(prev => ({ ...prev, [activeStudent]: subjects }));
    });
  }, [uid, activeStudent]);

  // Pre-load subjects for the planner's current student (may differ from activeStudent tab).
  useEffect(() => {
    if (!uid || !plannerStudent) return;
    readSettingsSubjects(uid, plannerStudent).then(subjects => {
      setSubjectsByStudent(prev => ({ ...prev, [plannerStudent]: subjects }));
    });
  }, [uid, plannerStudent]);

  // Write subject list for activeStudent and update local state.
  async function saveSubjects(subjects) {
    setSubjectsByStudent(prev => ({ ...prev, [activeStudent]: subjects }));
    await writeSettingsSubjects(uid, activeStudent, subjects);
  }

  return {
    activeStudent, setActiveStudent,
    activeSubjects: subjectsByStudent[activeStudent] ?? [],
    subjectsByStudent,
    saveSubjects,
  };
}
