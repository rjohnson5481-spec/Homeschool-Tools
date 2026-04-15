import { useState, useEffect, useCallback } from 'react';
import {
  getEnrollments as fbGetEnrollments,
  addEnrollment as fbAddEnrollment,
  saveEnrollment as fbSaveEnrollment,
  deleteEnrollment as fbDeleteEnrollment,
} from '../firebase/academicRecords.js';
import {
  readSettingsSubjects,
  writeSettingsSubjects,
} from '../../planner/firebase/settings.js';

// Manages enrollments + optional planner sync.
//
// Returns:
//   enrollments        — Array<{ id, courseId, student, yearId, notes, syncPlanner }>
//   loading            — boolean
//   error              — string | null
//   addEnrollment      — async (data) => newId
//   updateEnrollment   — async (enrollmentId, data) => void
//   removeEnrollment   — async (enrollmentId) => void
//
// Planner sync (writes to /users/{uid}/subjectPresets/{student}):
//   - addEnrollment    — when data.syncPlanner is true, append the course
//                        name to that student's subjectPresets if absent.
//   - updateEnrollment — only when syncPlanner transitions false → true.
//                        Already-on or off-on-save: no planner write.
//   - removeEnrollment — never touches subjectPresets, even if syncPlanner
//                        was true. Caller can clean the planner separately.
export function useEnrollments(uid, courses) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const reload = useCallback(async () => {
    if (!uid) {
      setEnrollments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await fbGetEnrollments(uid);
      setEnrollments(rows);
    } catch (err) {
      setError(err?.message ?? 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { reload(); }, [reload]);

  // Append the course's name to {student}'s planner subjectPresets if absent.
  // Reads + writes the existing planner settings doc — no-op if course missing
  // from the catalog or if the name is already in the preset list.
  async function syncCourseToPlanner(courseId, student) {
    if (!uid || !student) return;
    const course = (courses ?? []).find(c => c.id === courseId);
    const name = course?.name?.trim();
    if (!name) return;
    const current = await readSettingsSubjects(uid, student);
    if (current.includes(name)) return;
    await writeSettingsSubjects(uid, student, [...current, name]);
  }

  const addEnrollment = useCallback(async (data) => {
    if (!uid) throw new Error('useEnrollments: uid is required');
    try {
      const id = await fbAddEnrollment(uid, data);
      if (data.syncPlanner) {
        await syncCourseToPlanner(data.courseId, data.student);
      }
      await reload();
      return id;
    } catch (err) {
      setError(err?.message ?? 'Failed to add enrollment');
      throw err;
    }
  }, [uid, reload, courses]);

  const updateEnrollment = useCallback(async (enrollmentId, data) => {
    if (!uid) throw new Error('useEnrollments: uid is required');
    try {
      const prev = enrollments.find(e => e.id === enrollmentId);
      const wasSync = !!prev?.syncPlanner;
      await fbSaveEnrollment(uid, enrollmentId, data);
      // Only sync on the false → true transition; once-synced stays synced.
      if (data.syncPlanner && !wasSync) {
        await syncCourseToPlanner(data.courseId, data.student);
      }
      await reload();
    } catch (err) {
      setError(err?.message ?? 'Failed to update enrollment');
      throw err;
    }
  }, [uid, reload, courses, enrollments]);

  const removeEnrollment = useCallback(async (enrollmentId) => {
    if (!uid) throw new Error('useEnrollments: uid is required');
    try {
      await fbDeleteEnrollment(uid, enrollmentId);
      await reload();
    } catch (err) {
      setError(err?.message ?? 'Failed to delete enrollment');
      throw err;
    }
  }, [uid, reload]);

  return {
    enrollments, loading, error,
    addEnrollment, updateEnrollment, removeEnrollment,
  };
}
