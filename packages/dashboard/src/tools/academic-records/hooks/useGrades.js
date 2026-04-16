import { useState, useEffect, useCallback } from 'react';
import {
  getGrades as fbGetGrades,
  addGrade as fbAddGrade,
  saveGrade as fbSaveGrade,
  deleteGrade as fbDeleteGrade,
} from '../firebase/academicRecords.js';

// Manages grade state for one user.
// Loads all grades on mount; reloads after every mutation so the list stays
// in sync with Firestore. All I/O delegated to firebase/academicRecords.js.
//
// Returns:
//   grades       — Array<{ id, enrollmentId, quarterId, grade, createdAt }>
//   loading      — true during the initial load and any reload after a write
//   error        — string of the last failure, or null
//   saveGrade    — async (gradeId, data) => void
//   addGrade     — async (data) => newId
//   removeGrade  — async (gradeId) => void
export function useGrades(uid) {
  const [grades, setGrades]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const reload = useCallback(async () => {
    if (!uid) {
      setGrades([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await fbGetGrades(uid);
      setGrades(rows);
    } catch (err) {
      setError(err?.message ?? 'Failed to load grades');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { reload(); }, [reload]);

  const addGrade = useCallback(async (data) => {
    if (!uid) throw new Error('useGrades: uid is required');
    try {
      const id = await fbAddGrade(uid, data);
      await reload();
      return id;
    } catch (err) {
      setError(err?.message ?? 'Failed to add grade');
      throw err;
    }
  }, [uid, reload]);

  const saveGrade = useCallback(async (gradeId, data) => {
    if (!uid) throw new Error('useGrades: uid is required');
    try {
      await fbSaveGrade(uid, gradeId, data);
      await reload();
    } catch (err) {
      setError(err?.message ?? 'Failed to save grade');
      throw err;
    }
  }, [uid, reload]);

  const removeGrade = useCallback(async (gradeId) => {
    if (!uid) throw new Error('useGrades: uid is required');
    try {
      await fbDeleteGrade(uid, gradeId);
      await reload();
    } catch (err) {
      setError(err?.message ?? 'Failed to delete grade');
      throw err;
    }
  }, [uid, reload]);

  return { grades, loading, error, saveGrade, addGrade, removeGrade };
}
