import { useState, useEffect, useMemo } from 'react';
import { collection, collectionGroup, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@homeschool/shared';
import { subscribeCompliance, subscribeSchoolDays } from '../firebase/compliance.js';
import { COMPLIANCE_DEFAULTS } from '../constants/compliance.js';

// School-year-wide compliance metrics for the dashboard.
//
// daysCompleted = startingDays + count of distinct dates within the active
//                 school year where any non-allday subject cell has done=true.
// hoursCompleted = startingHours + sum of hoursLogged across schoolDays
//                  in the same range.
//
// Multi-family caveat: the days query uses a bare collectionGroup('subjects')
// listener, which is correct for single-family today but reads cross-family
// without a uid filter. Phase 4 prerequisite: tighten the R2 rule and add
// a uid field to cells before any external testing family signs in.

function isoFromYMD(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function todayIso() {
  const t = new Date();
  return isoFromYMD(t.getFullYear(), t.getMonth() + 1, t.getDate());
}

// Cell path → "YYYY-MM-DD" date string. Returns null for allday cells or
// any path that doesn't match the planner cell shape.
function cellPathToDateString(path) {
  const parts = path.split('/');
  if (parts.length !== 10 || parts[0] !== 'users' || parts[2] !== 'weeks' || parts[8] !== 'subjects') return null;
  const weekId = parts[3];
  const dayIndex = Number(parts[7]);
  const subject = parts[9];
  if (!Number.isFinite(dayIndex) || subject === 'allday') return null;
  const [y, m, d] = weekId.split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d + dayIndex);
  return isoFromYMD(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function useComplianceSummary(uid) {
  const [settings, setSettings]                 = useState(COMPLIANCE_DEFAULTS);
  const [doneDates, setDoneDates]               = useState(() => new Set());
  const [hoursDocs, setHoursDocs]               = useState([]);
  const [activeSchoolYear, setActiveSchoolYear] = useState(null);
  const [yearsLoaded, setYearsLoaded]           = useState(false);
  const [error, setError]                       = useState(null);

  useEffect(() => {
    if (!uid) return;
    return subscribeCompliance(uid, setSettings);
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

  // Days: live collectionGroup subscription on done cells, filtered to the
  // school-year window client-side via path-derived dateString.
  useEffect(() => {
    if (!uid || !settings.daysEnabled || !start || !endRaw) {
      setDoneDates(new Set());
      return;
    }
    const q = query(collectionGroup(db, 'subjects'), where('done', '==', true));
    return onSnapshot(q, snap => {
      const dates = new Set();
      snap.docs.forEach(d => {
        const ds = cellPathToDateString(d.ref.path);
        if (ds && ds >= start && ds <= end) dates.add(ds);
      });
      setDoneDates(dates);
    });
  }, [uid, settings.daysEnabled, start, endRaw, end]);

  // Hours: reuse Session 1's date-range subscription.
  useEffect(() => {
    if (!uid || !settings.hoursEnabled || !start || !endRaw) {
      setHoursDocs([]);
      return;
    }
    return subscribeSchoolDays(uid, start, end, setHoursDocs);
  }, [uid, settings.hoursEnabled, start, endRaw, end]);

  const daysCompleted = useMemo(
    () => (settings.startingDays ?? 0) + doneDates.size,
    [settings.startingDays, doneDates],
  );
  const hoursCompleted = useMemo(
    () => (settings.startingHours ?? 0) + hoursDocs.reduce((acc, d) => acc + (d.hoursLogged ?? 0), 0),
    [settings.startingHours, hoursDocs],
  );

  return {
    enabled: !!(settings.daysEnabled || settings.hoursEnabled),
    daysEnabled: !!settings.daysEnabled,
    hoursEnabled: !!settings.hoursEnabled,
    requiredDays: settings.requiredDays ?? 0,
    requiredHours: settings.requiredHours ?? 0,
    daysCompleted,
    hoursCompleted,
    activeSchoolYear,
    loading: !yearsLoaded,
    error,
  };
}
