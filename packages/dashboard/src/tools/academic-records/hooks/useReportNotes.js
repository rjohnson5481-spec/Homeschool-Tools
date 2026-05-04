import { useState, useEffect, useCallback } from 'react';
import {
  getReportNotes as fbGetReportNotes,
  saveReportNote as fbSaveReportNote,
  addReportNote as fbAddReportNote,
} from '../firebase/academicRecordsReports.js';

// Manages report notes for one user.
// Loads all notes on mount; reloads after every save.
// Notes are per student × quarter — caller filters as needed.
//
// Returns:
//   reportNotes — Array<{ id, studentId, quarterId, notes, updatedAt }>
//   loading     — boolean
//   error       — string | null
//   saveNote    — async (studentId, quarterId, notes) => void
export function useReportNotes(uid) {
  const [reportNotes, setReportNotes] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const reload = useCallback(async () => {
    if (!uid) {
      setReportNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await fbGetReportNotes(uid);
      setReportNotes(rows);
    } catch (err) {
      setError(err?.message ?? 'Failed to load report notes');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { reload(); }, [reload]);

  const saveNote = useCallback(async (studentId, quarterId, notes) => {
    if (!uid) throw new Error('useReportNotes: uid is required');
    try {
      const existing = reportNotes.find(n => n.studentId === studentId && n.quarterId === quarterId);
      if (existing) {
        await fbSaveReportNote(uid, existing.id, { studentId, quarterId, notes });
      } else {
        await fbAddReportNote(uid, { studentId, quarterId, notes });
      }
      await reload();
    } catch (err) {
      setError(err?.message ?? 'Failed to save note');
      throw err;
    }
  }, [uid, reportNotes, reload]);

  return { reportNotes, loading, error, saveNote };
}
