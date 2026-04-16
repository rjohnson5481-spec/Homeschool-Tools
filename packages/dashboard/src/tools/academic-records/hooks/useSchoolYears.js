import { useState, useEffect, useCallback } from 'react';
import {
  getSchoolYears as fbGetSchoolYears,
  saveSchoolYear as fbSaveSchoolYear,
  deleteSchoolYear as fbDeleteSchoolYear,
  getQuarters as fbGetQuarters,
  saveQuarter as fbSaveQuarter,
  deleteQuarter as fbDeleteQuarter,
  getBreaks as fbGetBreaks,
  saveBreak as fbSaveBreak,
  deleteBreak as fbDeleteBreak,
} from '../firebase/academicRecords.js';

// Manages school years and their nested quarters.
//
// Each reload fetches every school year, then fetches that year's quarters
// and breaks in parallel, attaching as `quarters: []` and `breaks: []`.
// Consumers see a single shaped tree:
//   [{ id, label, startDate, endDate, quarters: [...], breaks: [...] }]
//
// All mutators throw on missing uid (no silent returns).
//
// Returns:
//   schoolYears        — Array<{ ..., quarters }>, sorted by startDate
//   loading            — boolean
//   error              — string | null
//   addSchoolYear      — async (data) => newId
//   updateSchoolYear   — async (yearId, data) => void
//   removeSchoolYear   — async (yearId) => void
//   addQuarter         — async (yearId, data) => newId
//   updateQuarter      — async (yearId, quarterId, data) => void
//   removeQuarter      — async (yearId, quarterId) => void

// Generates a stable id for client-created docs. Falls back to Date.now()
// when crypto.randomUUID isn't available (very old browsers).
function genId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useSchoolYears(uid) {
  const [schoolYears, setSchoolYears] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const reload = useCallback(async () => {
    if (!uid) {
      setSchoolYears([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const years = await fbGetSchoolYears(uid);
      const yearsWithChildren = await Promise.all(
        years.map(async (y) => {
          const [quarters, breaks] = await Promise.all([fbGetQuarters(uid, y.id), fbGetBreaks(uid, y.id)]);
          return { ...y, quarters, breaks };
        }),
      );
      setSchoolYears(yearsWithChildren);
    } catch (err) {
      setError(err?.message ?? 'Failed to load school years');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { reload(); }, [reload]);

  // ─── School years ───
  const addSchoolYear = useCallback(async (data) => {
    if (!uid) throw new Error('useSchoolYears: uid is required');
    try {
      const id = genId();
      await fbSaveSchoolYear(uid, id, data);
      await reload();
      return id;
    } catch (err) {
      setError(err?.message ?? 'Failed to add school year');
      throw err;
    }
  }, [uid, reload]);

  const updateSchoolYear = useCallback(async (yearId, data) => {
    if (!uid) throw new Error('useSchoolYears: uid is required');
    try {
      await fbSaveSchoolYear(uid, yearId, data);
      await reload();
    } catch (err) {
      setError(err?.message ?? 'Failed to update school year');
      throw err;
    }
  }, [uid, reload]);

  const removeSchoolYear = useCallback(async (yearId) => {
    if (!uid) throw new Error('useSchoolYears: uid is required');
    try {
      await fbDeleteSchoolYear(uid, yearId);
      await reload();
    } catch (err) {
      setError(err?.message ?? 'Failed to delete school year');
      throw err;
    }
  }, [uid, reload]);

  // ─── Quarters ───
  const addQuarter = useCallback(async (yearId, data) => {
    if (!uid) throw new Error('useSchoolYears: uid is required');
    try {
      const id = genId();
      await fbSaveQuarter(uid, yearId, id, data);
      await reload();
      return id;
    } catch (err) {
      setError(err?.message ?? 'Failed to add quarter');
      throw err;
    }
  }, [uid, reload]);

  const updateQuarter = useCallback(async (yearId, quarterId, data) => {
    if (!uid) throw new Error('useSchoolYears: uid is required');
    try {
      await fbSaveQuarter(uid, yearId, quarterId, data);
      await reload();
    } catch (err) {
      setError(err?.message ?? 'Failed to update quarter');
      throw err;
    }
  }, [uid, reload]);

  const removeQuarter = useCallback(async (yearId, quarterId) => {
    if (!uid) throw new Error('useSchoolYears: uid is required');
    try {
      await fbDeleteQuarter(uid, yearId, quarterId);
      await reload();
    } catch (err) {
      setError(err?.message ?? 'Failed to delete quarter');
      throw err;
    }
  }, [uid, reload]);

  // ─── Breaks ───
  const addBreak = useCallback(async (yearId, data) => {
    if (!uid) throw new Error('useSchoolYears: uid is required');
    try {
      const id = genId();
      await fbSaveBreak(uid, yearId, id, data);
      await reload();
      return id;
    } catch (err) {
      setError(err?.message ?? 'Failed to add break');
      throw err;
    }
  }, [uid, reload]);

  const updateBreak = useCallback(async (yearId, breakId, data) => {
    if (!uid) throw new Error('useSchoolYears: uid is required');
    try {
      await fbSaveBreak(uid, yearId, breakId, data);
      await reload();
    } catch (err) {
      setError(err?.message ?? 'Failed to update break');
      throw err;
    }
  }, [uid, reload]);

  const removeBreak = useCallback(async (yearId, breakId) => {
    if (!uid) throw new Error('useSchoolYears: uid is required');
    try {
      await fbDeleteBreak(uid, yearId, breakId);
      await reload();
    } catch (err) {
      setError(err?.message ?? 'Failed to delete break');
      throw err;
    }
  }, [uid, reload]);

  return {
    schoolYears, loading, error,
    addSchoolYear, updateSchoolYear, removeSchoolYear,
    addQuarter, updateQuarter, removeQuarter,
    addBreak, updateBreak, removeBreak,
  };
}
