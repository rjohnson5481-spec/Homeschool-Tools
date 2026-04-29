import { useState, useEffect } from 'react';
import {
  subscribeDaySubjects,
  updateCell as dbUpdateCell,
  deleteCell as dbDeleteCell,
  deleteWeek as dbDeleteWeek,
  readCell as dbReadCell,
  readDaySubjectsOnce as dbReadDaySubjectsOnce,
  writeSickDay as dbWriteSickDay,
  readSickDay as dbReadSickDay,
  deleteSickDay as dbDeleteSickDay,
} from '../firebase/planner.js';
import { getWeekDates, toWeekId } from '../constants/days.js';

// Manages subjects and cell data for one specific day.
// Subjects are implicit: a subject exists on a day only when its cell doc exists.
// dayData shape: { [subject]: { lesson, note, done, flag } }
// Sick-day indicators live in useSickDay — this hook does not subscribe to them.
export function useSubjects(uid, weekId, student, day) {
  const [dayData, setDayData] = useState({});
  const [loading, setLoading] = useState(true);

  // Subscribe to all subject cells for the current day.
  // Rebuilds whenever uid, weekId, student, or day changes.
  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const unsub = subscribeDaySubjects(uid, weekId, student, day, data => {
      setDayData(data);
      setLoading(false);
    });
    return () => { unsub(); setLoading(true); };
  }, [uid, weekId, student, day]);

  // Creating a cell IS adding that subject to the current day.
  function addSubject(subject) {
    return dbUpdateCell(uid, weekId, student, subject, day,
      { lesson: '', note: '', done: false, flag: false });
  }

  // Deleting a cell removes the subject from the current day only.
  function removeSubject(subject) {
    return dbDeleteCell(uid, weekId, student, day, subject);
  }

  // dayIndex param kept so PDF import can write to any day, not just current.
  // Trims text fields to prevent phantom cells from whitespace values.
  function updateCell(subject, dayIndex, data) {
    const cleaned = {
      ...data,
      lesson: (data.lesson ?? '').trim(),
      note:   (data.note   ?? '').trim(),
    };
    return dbUpdateCell(uid, weekId, student, subject, dayIndex, cleaned);
  }

  // Deletes all cells for the current week/student — clears the whole week.
  function deleteWeek() {
    return dbDeleteWeek(uid, weekId, student);
  }

  // Writes to an explicit weekId+student — used by PDF import.
  // overwrite=true: always write (wipe mode — used after deleteWeek).
  // overwrite=false: skip cells that already exist (merge mode — default).
  async function importCell(importWeekId, importStudent, subject, dayIndex, data, overwrite) {
    if (!overwrite) {
      const existing = await dbReadCell(uid, importWeekId, importStudent, dayIndex, subject);
      if (existing) return;
    }
    const cleaned = {
      ...data,
      lesson: (data.lesson ?? '').trim(),
      note:   (data.note   ?? '').trim(),
    };
    return dbUpdateCell(uid, importWeekId, importStudent, subject, dayIndex, cleaned);
  }

  // Cascades selected subjects forward within the current week only.
  // Days with an all-day event (Co-Op, etc.) are treated as transparent:
  // the chain skips over them rather than landing on top of them.
  // If the chain exhausts the week, displaced lessons are dropped — same
  // behavior as the existing past-Friday drop.
  // sickDayIndex defaults to the parent's `day` (mobile path); desktop
  // SickDaySheet pills pass an explicit value when the picked day differs.
  async function performSickDay(selectedSubjects, sickDayIndex = day) {
    // Read all-day event presence for each weekday upfront (5 reads, constant
    // regardless of subject count). Sick day is the source, not a destination,
    // so it is never treated as blocked.
    const allDayReads = await Promise.all(
      [0, 1, 2, 3, 4].map(d => dbReadCell(uid, weekId, student, d, 'allday'))
    );
    const blockedDays = {};
    allDayReads.forEach((cell, d) => { blockedDays[d] = !!cell; });
    blockedDays[sickDayIndex] = false;

    function findNextOpenDay(from) {
      let d = from + 1;
      while (d <= 4) {
        if (!blockedDays[d]) return d;
        d++;
      }
      return null;
    }

    await Promise.all(selectedSubjects.map(async subject => {
      const startData = sickDayIndex === day
        ? dayData[subject]
        : await dbReadCell(uid, weekId, student, sickDayIndex, subject);
      if (!startData) return;

      // Build chain from sick day through scheduled days, skipping blocked
      // days (all-day events) transparently. Stop at first empty non-blocked day.
      const chain = [{ dayIndex: sickDayIndex, data: startData }];
      for (let d = sickDayIndex + 1; d <= 4; d++) {
        if (blockedDays[d]) continue;
        const data = await dbReadCell(uid, weekId, student, d, subject);
        if (!data) break;
        chain.push({ dayIndex: d, data });
      }

      // Write in reverse (safe — no read-after-write collisions).
      // findNextOpenDay skips blocked days; null means past end of week — drop.
      for (let i = chain.length - 1; i >= 0; i--) {
        const target = findNextOpenDay(chain[i].dayIndex);
        if (target !== null) {
          await dbUpdateCell(uid, weekId, student, subject, target, chain[i].data);
        }
      }

      // Delete the original sick-day cell.
      await dbDeleteCell(uid, weekId, student, sickDayIndex, subject);
    }));

    // Write sick day marker for the picked day's date.
    const dateString = toWeekId(getWeekDates(weekId)[sickDayIndex]);
    await dbWriteSickDay(uid, dateString, student, selectedSubjects);
  }

  // Reverses a sick day cascade for the current week.
  // The cascade source is the day that actually has a sick day marker in
  // Firestore for this student — NOT the parent's currently-selected UI
  // day. The user may have navigated to a different day before hitting
  // Undo; we still need to shift the correct day's column back.
  // Reads subjectsShifted from the marker, builds each subject's chain
  // from D+1 forward, writes each cell one day back, deletes last source
  // cell, then deletes the sick day marker so the red dot is removed.
  async function performUndoSickDay() {
    const dates = getWeekDates(weekId);
    let sickDayIndex = -1;
    let sickDayData = null;
    let dateString = null;
    for (let d = 0; d < 5; d++) {
      const ds = toWeekId(dates[d]);
      const data = await dbReadSickDay(uid, ds);
      if (data?.student === student) {
        sickDayIndex = d;
        sickDayData = data;
        dateString = ds;
        break;
      }
    }
    if (!sickDayData) return;

    await Promise.all((sickDayData.subjectsShifted ?? []).map(async subject => {
      const chain = [];
      for (let d = sickDayIndex + 1; d <= 4; d++) {
        const data = await dbReadCell(uid, weekId, student, d, subject);
        if (!data) break;
        chain.push({ dayIndex: d, data });
      }
      if (chain.length === 0) return;
      for (const { dayIndex, data } of chain) {
        await dbUpdateCell(uid, weekId, student, subject, dayIndex - 1, data);
      }
      await dbDeleteCell(uid, weekId, student, chain[chain.length - 1].dayIndex, subject);
    }));

    await dbDeleteSickDay(uid, dateString);
  }

  // Reads all subject cells for days fromDay through 4 in parallel.
  // Returns: { [dayIndex]: { [subject]: { lesson, note, done, flag } } }
  async function loadWeekDataFrom(fromDay) {
    const days = Array.from({ length: 5 - fromDay }, (_, i) => fromDay + i);
    const results = await Promise.all(days.map(d => dbReadDaySubjectsOnce(uid, weekId, student, d)));
    return Object.fromEntries(days.map((d, i) => [d, results[i]]));
  }

  const subjects = Object.keys(dayData);
  return {
    subjects, dayData, loading,
    updateCell, addSubject, removeSubject,
    importCell, deleteWeek,
    performSickDay, performUndoSickDay,
    loadWeekDataFrom,
  };
}
