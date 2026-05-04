import { collection, collectionGroup, doc, getDocs, getDoc, setDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db, auth } from '@homeschool/shared';

async function readCol(path) {
  const snap = await getDocs(collection(db, path));
  return snap.docs.map(d => ({ _id: d.id, ...d.data() }));
}
async function readDoc(path) {
  const snap = await getDoc(doc(db, path));
  return snap.exists() ? snap.data() : null;
}

export async function exportAllData(uid) {
  const base = `users/${uid}`;
  const studentsSnap = await getDocs(query(collection(db, `${base}/students`), orderBy('order', 'asc')));
  const students = studentsSnap.docs.map(d => ({ studentId: d.id, ...d.data() }));
  const subjectPresets = await readCol(`${base}/subjectPresets`);
  const sickDays = await readCol(`${base}/sickDays`);
  const courses = await readCol(`${base}/courses`);
  const enrollments = await readCol(`${base}/enrollments`);
  const grades = await readCol(`${base}/grades`);
  const reportNotes = await readCol(`${base}/reportNotes`);
  const activities = await readCol(`${base}/activities`);
  const savedReports = await readCol(`${base}/savedReports`);

  const schoolYearsRaw = await readCol(`${base}/schoolYears`);
  const schoolYears = await Promise.all(schoolYearsRaw.map(async y => ({
    ...y,
    quarters: await readCol(`${base}/schoolYears/${y._id}/quarters`),
    breaks: await readCol(`${base}/schoolYears/${y._id}/breaks`),
  })));

  const subjectsSnap = await getDocs(collectionGroup(db, 'subjects'));
  const weeks = [];
  for (const subDoc of subjectsSnap.docs) {
    const path = subDoc.ref.path;
    if (!path.startsWith(`users/${uid}/weeks/`)) continue;
    const parts = path.split('/');
    const weekId = parts[3];
    const studentId = parts[5];
    const dayIndex = Number(parts[7]);
    const subject = parts[9];
    weeks.push({ weekId, studentId, dayIndex, subject, ...subDoc.data() });
  }

  return {
    exportedAt: new Date().toISOString(), version: '1', uid,
    data: { students, subjectPresets, weeks, sickDays, schoolYears, courses, enrollments, grades, reportNotes, activities, savedReports },
  };
}

export async function downloadBackup(uid) {
  const data = await exportAllData(uid);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  const emailUser = auth.currentUser.email.split('@')[0];
  a.href = url; a.download = `${emailUser}-backup-${date}.json`; a.click();
  URL.revokeObjectURL(url);
}

async function writeIfMissing(path, data) {
  const snap = await getDoc(doc(db, path));
  if (snap.exists()) return false;
  await setDoc(doc(db, path), data);
  return true;
}

async function deleteCol(path) {
  const snap = await getDocs(collection(db, path));
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
}

function stripId(obj) {
  const { _id, _student, ...rest } = obj;
  return rest;
}

export async function importMerge(uid, backup) {
  const d = backup.data; const base = `users/${uid}`;
  let imported = 0, skipped = 0;

  if (d.students && !Array.isArray(d.students)) {
    console.warn('importMerge: old names[] backup format detected — skipping settings/students');
  } else {
    for (const s of (d.students ?? [])) {
      const { studentId, ...profile } = s;
      if (!studentId) continue;
      (await writeIfMissing(`${base}/students/${studentId}`, profile)) ? imported++ : skipped++;
    }
  }
  for (const sp of (d.subjectPresets ?? [])) { (await writeIfMissing(`${base}/subjectPresets/${sp._id}`, stripId(sp))) ? imported++ : skipped++; }
  for (const sd of (d.sickDays ?? [])) { (await writeIfMissing(`${base}/sickDays/${sd._id}`, stripId(sd))) ? imported++ : skipped++; }
  for (const c of (d.courses ?? [])) { (await writeIfMissing(`${base}/courses/${c._id}`, stripId(c))) ? imported++ : skipped++; }
  for (const e of (d.enrollments ?? [])) { (await writeIfMissing(`${base}/enrollments/${e._id}`, stripId(e))) ? imported++ : skipped++; }
  for (const g of (d.grades ?? [])) { (await writeIfMissing(`${base}/grades/${g._id}`, stripId(g))) ? imported++ : skipped++; }
  for (const n of (d.reportNotes ?? [])) { (await writeIfMissing(`${base}/reportNotes/${n._id}`, stripId(n))) ? imported++ : skipped++; }
  for (const a of (d.activities ?? [])) { (await writeIfMissing(`${base}/activities/${a._id}`, stripId(a))) ? imported++ : skipped++; }
  for (const r of (d.savedReports ?? [])) { (await writeIfMissing(`${base}/savedReports/${r._id}`, stripId(r))) ? imported++ : skipped++; }
  for (const y of (d.schoolYears ?? [])) {
    (await writeIfMissing(`${base}/schoolYears/${y._id}`, stripId(y))) ? imported++ : skipped++;
    for (const q of (y.quarters ?? [])) { (await writeIfMissing(`${base}/schoolYears/${y._id}/quarters/${q._id}`, stripId(q))) ? imported++ : skipped++; }
    for (const b of (y.breaks ?? [])) { (await writeIfMissing(`${base}/schoolYears/${y._id}/breaks/${b._id}`, stripId(b))) ? imported++ : skipped++; }
  }
  for (const w of (d.weeks ?? [])) {
    const { weekId, studentId, dayIndex, subject, ...cell } = w;
    if (!studentId) continue;
    cell.uid = uid;
    const path = `${base}/weeks/${weekId}/students/${studentId}/days/${dayIndex}/subjects/${subject}`;
    (await writeIfMissing(path, cell)) ? imported++ : skipped++;
  }
  return { imported, skipped };
}

export async function importFullRestore(uid, backup) {
  const base = `users/${uid}`;
  await deleteCol(`${base}/sickDays`);
  await deleteCol(`${base}/courses`);
  await deleteCol(`${base}/enrollments`);
  await deleteCol(`${base}/grades`);
  await deleteCol(`${base}/reportNotes`);
  await deleteCol(`${base}/activities`);
  await deleteCol(`${base}/savedReports`);
  await deleteCol(`${base}/subjectPresets`);
  const sySnap = await getDocs(collection(db, `${base}/schoolYears`));
  for (const s of sySnap.docs) {
    await deleteCol(`${base}/schoolYears/${s.id}/quarters`);
    await deleteCol(`${base}/schoolYears/${s.id}/breaks`);
  }
  await deleteCol(`${base}/schoolYears`);
  // Enumerate every existing subject doc under this uid via collectionGroup.
  // weeks/{weekId}, students/{name}, and days/{di} are ghost path segments
  // (no real docs) so a plain collection() walk returns empty and misses leaf
  // subject docs — including any created by a sick day cascade that aren't in
  // the backup. collectionGroup picks up every subjects-collection doc anywhere
  // in Firestore; the prefix filter keeps it scoped to this uid.
  const subjectsSnap = await getDocs(collectionGroup(db, 'subjects'));
  const weeksPrefix = `${base}/weeks/`;
  await Promise.all(
    subjectsSnap.docs
      .filter(d => d.ref.path.startsWith(weeksPrefix))
      .map(d => deleteDoc(d.ref))
  );

  const d = backup.data; let restored = 0;
  if (d.students && !Array.isArray(d.students)) {
    console.warn('importFullRestore: old names[] backup format detected — skipping settings/students');
  } else {
    for (const s of (d.students ?? [])) {
      const { studentId, ...profile } = s;
      if (!studentId) continue;
      await setDoc(doc(db, `${base}/students/${studentId}`), profile); restored++;
    }
  }
  for (const sp of (d.subjectPresets ?? [])) { await setDoc(doc(db, `${base}/subjectPresets/${sp._id}`), stripId(sp)); restored++; }
  for (const sd of (d.sickDays ?? [])) { await setDoc(doc(db, `${base}/sickDays/${sd._id}`), stripId(sd)); restored++; }
  for (const c of (d.courses ?? [])) { await setDoc(doc(db, `${base}/courses/${c._id}`), stripId(c)); restored++; }
  for (const e of (d.enrollments ?? [])) { await setDoc(doc(db, `${base}/enrollments/${e._id}`), stripId(e)); restored++; }
  for (const g of (d.grades ?? [])) { await setDoc(doc(db, `${base}/grades/${g._id}`), stripId(g)); restored++; }
  for (const n of (d.reportNotes ?? [])) { await setDoc(doc(db, `${base}/reportNotes/${n._id}`), stripId(n)); restored++; }
  for (const a of (d.activities ?? [])) { await setDoc(doc(db, `${base}/activities/${a._id}`), stripId(a)); restored++; }
  for (const r of (d.savedReports ?? [])) { await setDoc(doc(db, `${base}/savedReports/${r._id}`), stripId(r)); restored++; }
  for (const y of (d.schoolYears ?? [])) {
    const { quarters, breaks, ...yData } = stripId(y);
    await setDoc(doc(db, `${base}/schoolYears/${y._id}`), yData); restored++;
    for (const q of (quarters ?? [])) { await setDoc(doc(db, `${base}/schoolYears/${y._id}/quarters/${q._id}`), stripId(q)); restored++; }
    for (const b of (breaks ?? [])) { await setDoc(doc(db, `${base}/schoolYears/${y._id}/breaks/${b._id}`), stripId(b)); restored++; }
  }
  for (const w of (d.weeks ?? [])) {
    const { weekId, studentId, dayIndex, subject, ...cell } = w;
    if (!studentId) continue;
    cell.uid = uid;
    await setDoc(doc(db, `${base}/weeks/${weekId}/students/${studentId}/days/${dayIndex}/subjects/${subject}`), cell); restored++;
  }
  return { restored };
}

// Compares every subject cell in `backup` against live Firestore under this uid
// and returns a nested diff structure: { [weekId]: { [dayIndex]: [items] } }.
// Each item = { subject, student, status, backup, current, checked }.
//   NEW     — in backup, not in Firestore          (checked: true)
//   CHANGED — in both, but lesson or note differs  (checked: true)
//   MATCH   — in both, lesson AND note identical   (checked: false — no-op)
//   DELETE  — in Firestore, not in backup          (checked: true)
// Uses collectionGroup('subjects') to enumerate live cells — the intermediate
// week/student/day path segments are ghost paths in this app.
export async function generateRestoreDiff(uid, backup) {
  const base = `users/${uid}`;
  const weeksPrefix = `${base}/weeks/`;

  const live = {};
  const snap = await getDocs(collectionGroup(db, 'subjects'));
  for (const s of snap.docs) {
    if (!s.ref.path.startsWith(weeksPrefix)) continue;
    live[s.ref.path] = s.data();
  }

  const diff = {};
  const backupPaths = new Set();
  for (const w of (backup?.data?.weeks ?? [])) {
    const { weekId, studentId, dayIndex, subject, ...cell } = w;
    if (!studentId) continue;
    const path = `${weeksPrefix}${weekId}/students/${studentId}/days/${dayIndex}/subjects/${subject}`;
    backupPaths.add(path);
    const current = live[path] ?? null;
    let status;
    if (!current) status = 'NEW';
    else if ((current.lesson ?? '') === (cell.lesson ?? '') && (current.note ?? '') === (cell.note ?? '')) status = 'MATCH';
    else status = 'CHANGED';
    (diff[weekId] ??= {})[dayIndex] ??= [];
    diff[weekId][dayIndex].push({
      subject, studentId, status,
      backup: cell, current,
      checked: status !== 'MATCH',
    });
  }

  for (const path of Object.keys(live)) {
    if (backupPaths.has(path)) continue;
    const parts = path.split('/');
    const weekId = parts[3];
    const studentId = parts[5];
    const dayIndex = Number(parts[7]);
    const subject = parts[9];
    (diff[weekId] ??= {})[dayIndex] ??= [];
    diff[weekId][dayIndex].push({
      subject, studentId, status: 'DELETE',
      backup: null, current: live[path],
      checked: true,
    });
  }

  return diff;
}

// Walks the diff structure returned by generateRestoreDiff and writes only
// the checked non-MATCH items to Firestore. NEW/CHANGED → setDoc with the
// backup cell; DELETE → deleteDoc; MATCH or unchecked → skipped.
export async function applyRestoreDiff(uid, diff) {
  const weeksPrefix = `users/${uid}/weeks/`;
  const ops = [];
  for (const [weekId, days] of Object.entries(diff)) {
    for (const [dayIndex, items] of Object.entries(days)) {
      for (const item of items) {
        if (!item.checked || item.status === 'MATCH') continue;
        const path = `${weeksPrefix}${weekId}/students/${item.studentId}/days/${dayIndex}/subjects/${item.subject}`;
        if (item.status === 'DELETE') ops.push(deleteDoc(doc(db, path)));
        else { item.backup.uid = uid; ops.push(setDoc(doc(db, path), item.backup)); }
      }
    }
  }
  await Promise.all(ops);
  return { applied: ops.length };
}
