import { useState, useEffect } from 'react';
import { db } from '@homeschool/shared';
import { collection, doc, getDocs, onSnapshot } from 'firebase/firestore';
import { getMondayOf, toWeekId, getTodayDayIndex } from '../tools/planner/constants/days.js';

const REQUIRED_DAYS = 175;
const DAY_NAMES = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
const MONTH_NAMES = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

function todayIso() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}
function parseLocal(s) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return (y && m && d) ? new Date(y, m - 1, d) : null;
}
function countWeekdays(startStr, endStr) {
  const s = parseLocal(startStr), e = parseLocal(endStr);
  if (!s || !e || s > e) return 0;
  let n = 0; const c = new Date(s);
  while (c <= e) { const d = c.getDay(); if (d >= 1 && d <= 5) n++; c.setDate(c.getDate() + 1); }
  return n;
}

export function useHomeSummary(uid) {
  const [students, setStudents]             = useState([]);
  const [lessonsByStudent, setLessonsByStudent] = useState({});
  const [attendance, setAttendance]         = useState({});

  const weekId   = toWeekId(getMondayOf(new Date()));
  const dayIndex = getTodayDayIndex();
  const today    = new Date();
  const todayLabel = `${DAY_NAMES[today.getDay()]}, ${MONTH_NAMES[today.getMonth()]} ${today.getDate()}`;

  // Subscribe to student names list
  useEffect(() => {
    if (!uid) return;
    return onSnapshot(doc(db, `users/${uid}/settings/students`), snap => {
      setStudents(snap.data()?.names ?? []);
    });
  }, [uid]);

  // Subscribe to today's subjects for ALL students
  useEffect(() => {
    if (!uid || !students.length) return;
    const unsubs = students.map(name => {
      const path = `users/${uid}/weeks/${weekId}/students/${name}/days/${dayIndex}/subjects`;
      return onSnapshot(collection(db, path), snap => {
        const lessons = [];
        snap.docs.forEach(d => {
          if (d.id === 'allday') return;
          const data = d.data();
          lessons.push({ subject: d.id, lesson: data.lesson ?? '', note: data.note ?? '', done: !!data.done, flag: !!data.flag, dayIndex });
        });
        setLessonsByStudent(prev => ({ ...prev, [name]: lessons }));
      });
    });
    return () => unsubs.forEach(u => u());
  }, [uid, students, weekId, dayIndex]);

  // One-shot: fetch attendance for all students
  useEffect(() => {
    if (!uid || !students.length) return;
    (async () => {
      try {
        const td = todayIso();
        const yearsSnap = await getDocs(collection(db, `users/${uid}/schoolYears`));
        const years = yearsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const active = years.find(y => y.startDate && y.endDate && y.startDate <= td && td <= y.endDate)
          ?? (years.length ? years.sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? '')).pop() : null);
        if (!active) { setAttendance({}); return; }
        const end = (active.endDate && td > active.endDate) ? active.endDate : td;
        const schoolDays = countWeekdays(active.startDate, end);
        const breaksSnap = await getDocs(collection(db, `users/${uid}/schoolYears/${active.id}/breaks`));
        let breakDays = 0;
        breaksSnap.docs.forEach(d => {
          const b = d.data();
          if (!b.startDate || !b.endDate) return;
          const bS = b.startDate < active.startDate ? active.startDate : b.startDate;
          const bE = b.endDate > end ? end : b.endDate;
          if (bS <= bE) breakDays += countWeekdays(bS, bE);
        });
        const sickSnap = await getDocs(collection(db, `users/${uid}/sickDays`));
        const sickDates = sickSnap.docs.map(d => d.id);
        const result = {};
        for (const name of students) {
          const sick = sickDates.filter(d => d >= active.startDate && d <= end).length;
          const attended = Math.max(0, schoolDays - breakDays - sick);
          result[name] = { attended, sick, breakDays, schoolDays, required: REQUIRED_DAYS };
        }
        setAttendance(result);
      } catch (err) { console.warn('useHomeSummary: attendance fetch failed', err); }
    })();
  }, [uid, students]);

  return { students, lessonsByStudent, attendance, weekId, dayIndex, todayLabel };
}
