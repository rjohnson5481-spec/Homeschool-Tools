import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@homeschool/shared';

const REQUIRED_DAYS = 175;

function parseLocalDate(s) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function todayIsoDate() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

function countSchoolDays(startStr, endStr) {
  const start = parseLocalDate(startStr);
  const end   = parseLocalDate(endStr);
  if (!start || !end || start > end) return 0;
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day >= 1 && day <= 5) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export function useAcademicSummary(uid, studentId, schoolYears, enrollments, courses) {
  const [sickDates, setSickDates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const activeSchoolYear = useMemo(() => {
    const years = schoolYears ?? [];
    if (years.length === 0) return null;
    const today = todayIsoDate();
    const inRange = years.find(y => y.startDate && y.endDate && y.startDate <= today && today <= y.endDate);
    return inRange ?? years[years.length - 1];
  }, [schoolYears]);

  const activeQuarterId = useMemo(() => {
    const qs = activeSchoolYear?.quarters ?? [];
    if (qs.length === 0) return null;
    const today = todayIsoDate();
    const cur = qs.find(q => q.startDate && q.endDate && q.startDate <= today && today <= q.endDate);
    return (cur ?? qs[0]).id;
  }, [activeSchoolYear]);

  const studentEnrollments = useMemo(() => (enrollments ?? []).filter(e => e.studentId === studentId), [enrollments, studentId]);
  const courseCount = studentEnrollments.length;
  void courses;

  useEffect(() => {
    if (!uid) { setSickDates([]); setLoading(false); return; }
    setLoading(true); setError(null);
    getDocs(collection(db, `users/${uid}/sickDays`))
      .then(snap => setSickDates(snap.docs.map(d => d.id)))
      .catch(err => setError(err?.message ?? 'Failed to load summary'))
      .finally(() => setLoading(false));
  }, [uid]);

  const attendanceDays = useMemo(() => {
    const start = activeSchoolYear?.startDate;
    if (!start) return { attended: 0, sick: 0, breakDays: 0, schoolDays: 0, required: REQUIRED_DAYS };
    const today = todayIsoDate();
    const end = (activeSchoolYear?.endDate && today > activeSchoolYear.endDate) ? activeSchoolYear.endDate : today;
    const schoolDays = countSchoolDays(start, end);
    const sick = sickDates.filter(d => d >= start && d <= end).length;
    let breakDays = 0;
    for (const b of (activeSchoolYear?.breaks ?? [])) {
      if (!b.startDate || !b.endDate) continue;
      const bStart = b.startDate < start ? start : b.startDate;
      const bEnd = b.endDate > end ? end : b.endDate;
      if (bStart <= bEnd) breakDays += countSchoolDays(bStart, bEnd);
    }
    const attended = Math.max(0, schoolDays - breakDays - sick);
    return { attended, sick, breakDays, schoolDays, required: REQUIRED_DAYS };
  }, [activeSchoolYear, sickDates]);

  return { activeSchoolYear, activeQuarterId, studentEnrollments, courseCount, attendanceDays, loading, error };
}
