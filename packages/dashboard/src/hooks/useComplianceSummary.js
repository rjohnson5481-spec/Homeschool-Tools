import { useState, useEffect, useMemo } from 'react';
import { collection, collectionGroup, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@homeschool/shared';
import { subscribeCompliance, subscribeSchoolDays } from '../firebase/compliance.js';
import { COMPLIANCE_DEFAULTS } from '../constants/compliance.js';

// Per-student school-year-wide compliance metrics for downstream UI.
//
// daysCompletedByStudent[name]  = startingDays  + count of distinct dates
//                                 within the active school year where any
//                                 non-allday cell for THAT student has
//                                 done=true.
// hoursCompletedByStudent[name] = startingHours + sum of hoursByStudent
//                                 [name] across schoolDays in range.
// requiredByStudent passes through from settings/compliance (Session 4.1
// migration). No fallback to deprecated top-level fields.
//
// Phase 4 Block 1 complete: R2 rule uid-scoped, uid field on all cell writes,
// and collectionGroup query filtered by uid. Safe for multi-family use.

function isoFromYMD(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function todayIso() {
  const t = new Date();
  return isoFromYMD(t.getFullYear(), t.getMonth() + 1, t.getDate());
}

// Cell path → { studentName, dateString }. Returns null for allday cells
// or any path that doesn't match the planner cell shape.
// Path: users/{uid}/weeks/{weekId}/students/{name}/days/{0-4}/subjects/{subject}
function parseCellPath(path) {
  const parts = path.split('/');
  if (parts.length !== 10
    || parts[0] !== 'users' || parts[2] !== 'weeks'
    || parts[4] !== 'students' || parts[6] !== 'days'
    || parts[8] !== 'subjects') return null;
  const weekId = parts[3];
  const studentName = parts[5];
  const dayIndex = Number(parts[7]);
  const subject = parts[9];
  if (!Number.isFinite(dayIndex) || subject === 'allday') return null;
  const [y, m, d] = weekId.split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d + dayIndex);
  return {
    studentName,
    dateString: isoFromYMD(date.getFullYear(), date.getMonth() + 1, date.getDate()),
  };
}

export function useComplianceSummary(uid) {
  const [settings, setSettings]                 = useState(COMPLIANCE_DEFAULTS);
  const [students, setStudents]                 = useState([]);
  const [studentDateSets, setStudentDateSets]   = useState({});
  const [hoursDocs, setHoursDocs]               = useState([]);
  const [activeSchoolYear, setActiveSchoolYear] = useState(null);
  const [yearsLoaded, setYearsLoaded]           = useState(false);
  const [error, setError]                       = useState(null);

  useEffect(() => {
    if (!uid) return;
    return subscribeCompliance(uid, setSettings);
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(doc(db, `users/${uid}/settings/students`), snap => {
      setStudents(snap.exists() ? (snap.data().names ?? []) : []);
    });
  }, [uid]);

  useEffect(() => {
    if (!uid) { setActiveSchoolYear(null); setYearsLoaded(true); return; }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collection(db, `users/${uid}/schoolYears`));
        if (cancelled) return;
        const years = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const today = todayIso();
        const inRange = years.find(y => y.startDate && y.endDate && y.startDate <= today && today <= y.endDate);
        const fallback = years.length
          ? [...years].sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? '')).pop()
          : null;
        setActiveSchoolYear(inRange ?? fallback ?? null);
      } catch (err) {
        if (!cancelled) setError(err?.message ?? 'Failed to load school years');
      } finally {
        if (!cancelled) setYearsLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [uid]);

  const start  = activeSchoolYear?.startDate ?? null;
  const endRaw = activeSchoolYear?.endDate   ?? null;
  const end    = endRaw && todayIso() > endRaw ? endRaw : todayIso();

  // Days: live collectionGroup subscription on done cells, bucketed by
  // student client-side via path-derived (studentName, dateString) pairs.
  useEffect(() => {
    if (!uid || !settings.daysEnabled || !start || !endRaw) {
      setStudentDateSets({});
      return;
    }
    // Requires composite index on subjects: uid ASC, done ASC — create via Firebase console link on first run
    const q = query(collectionGroup(db, 'subjects'), where('uid', '==', uid), where('done', '==', true));
    return onSnapshot(q, snap => {
      const sets = {};
      snap.docs.forEach(d => {
        const parsed = parseCellPath(d.ref.path);
        if (!parsed) return;
        if (parsed.dateString < start || parsed.dateString > end) return;
        if (!sets[parsed.studentName]) sets[parsed.studentName] = new Set();
        sets[parsed.studentName].add(parsed.dateString);
      });
      setStudentDateSets(sets);
    });
  }, [uid, settings.daysEnabled, start, endRaw, end]);

  // Hours: reuse Session 1's date-range subscription. Each schoolDay doc
  // has its own hoursByStudent map (Session 4.1 migration).
  useEffect(() => {
    if (!uid || !settings.hoursEnabled || !start || !endRaw) {
      setHoursDocs([]);
      return;
    }
    return subscribeSchoolDays(uid, start, end, setHoursDocs);
  }, [uid, settings.hoursEnabled, start, endRaw, end]);

  // Normalize requiredByStudent to include every current student.
  // Defensive zero-fill for any student missing from the settings doc.
  const requiredByStudent = useMemo(() => {
    const raw = settings.requiredByStudent ?? {};
    const out = {};
    for (const name of students) {
      out[name] = raw[name] ?? { requiredDays: 0, requiredHours: 0 };
    }
    return out;
  }, [students, settings.requiredByStudent]);

  // Empty maps when disabled (UI gates render). When enabled but no school
  // year, returns startingDays for every student (cells subscription bails).
  const daysCompletedByStudent = useMemo(() => {
    if (!settings.daysEnabled) return {};
    const out = {};
    for (const name of students) {
      out[name] = (settings.startingDays ?? 0) + (studentDateSets[name]?.size ?? 0);
    }
    return out;
  }, [settings.daysEnabled, students, settings.startingDays, studentDateSets]);

  const hoursCompletedByStudent = useMemo(() => {
    if (!settings.hoursEnabled) return {};
    const out = {};
    for (const name of students) {
      let sum = 0;
      for (const d of hoursDocs) sum += d.hoursByStudent?.[name] ?? 0;
      out[name] = (settings.startingHours ?? 0) + sum;
    }
    return out;
  }, [settings.hoursEnabled, students, settings.startingHours, hoursDocs]);

  return {
    enabled: !!(settings.daysEnabled || settings.hoursEnabled),
    daysEnabled: !!settings.daysEnabled,
    hoursEnabled: !!settings.hoursEnabled,
    startingDays:  settings.startingDays  ?? 0,
    startingHours: settings.startingHours ?? 0,
    requiredByStudent,
    daysCompletedByStudent,
    hoursCompletedByStudent,
    activeSchoolYear,
    students,
    loading: !yearsLoaded,
    error,
  };
}
