import { useState, useEffect, useRef, useCallback } from 'react';
import {
  subscribeCompliance, subscribeSchoolDays, saveSchoolDayHours,
} from '../../../firebase/compliance.js';
import { COMPLIANCE_DEFAULTS } from '../../../constants/compliance.js';
import { toWeekId } from '../constants/days.js';

const SAVE_DEBOUNCE_MS = 500;

// Owns the planner's view of compliance state: live settings + the current
// week's school-day records, plus a debounced per-date saver.
// hoursByDate is keyed by "YYYY-MM-DD"; saveHours writes 500ms after the
// last call for a given date; flushPendingSave drains pending writes
// immediately (used on day-change and unmount).
export function useCompliance({ uid, weekDates }) {
  const [settings, setSettings]       = useState(COMPLIANCE_DEFAULTS);
  const [hoursByDate, setHoursByDate] = useState({});
  const pendingSaves = useRef({}); // { [dateString]: { value, timeoutId } }

  useEffect(() => {
    if (!uid) return;
    return subscribeCompliance(uid, setSettings);
  }, [uid]);

  const startDate = weekDates?.[0] ? toWeekId(weekDates[0]) : null;
  const endDate   = weekDates?.[4] ? toWeekId(weekDates[4]) : null;
  useEffect(() => {
    if (!uid || !startDate || !endDate) return;
    return subscribeSchoolDays(uid, startDate, endDate, docs => {
      setHoursByDate(Object.fromEntries(docs.map(d => [d._id, d.hoursLogged])));
    });
  }, [uid, startDate, endDate]);

  const flushPendingSave = useCallback(() => {
    for (const [d, e] of Object.entries(pendingSaves.current)) {
      clearTimeout(e.timeoutId);
      saveSchoolDayHours(uid, d, e.value);
    }
    pendingSaves.current = {};
  }, [uid]);

  const saveHours = useCallback((dateString, hours) => {
    if (hours === '' || hours === null || hours === undefined) return;
    const existing = pendingSaves.current[dateString];
    if (existing) clearTimeout(existing.timeoutId);
    const timeoutId = setTimeout(() => {
      saveSchoolDayHours(uid, dateString, hours);
      delete pendingSaves.current[dateString];
    }, SAVE_DEBOUNCE_MS);
    pendingSaves.current[dateString] = { value: hours, timeoutId };
  }, [uid]);

  useEffect(() => () => flushPendingSave(), [flushPendingSave]);

  return {
    daysEnabled: settings.daysEnabled,
    hoursEnabled: settings.hoursEnabled,
    hoursByDate, saveHours, flushPendingSave,
  };
}
