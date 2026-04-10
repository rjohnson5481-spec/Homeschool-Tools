// All Firestore reads and writes for the planner.
// No business logic — pure I/O only.
// All paths from constants/firestore.js — nothing hardcoded here.

import { doc, collection, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@homeschool/shared';
import {
  subjectListPath,
  subjectPath,
  dayPath,
} from '../constants/firestore.js';

// Subscribes to the subject list for one student.
// cb receives: string[]  (empty array if the doc doesn't exist yet)
// Returns the Firestore unsubscribe function.
export function subscribeSubjectList(uid, student, cb) {
  const ref = doc(db, subjectListPath(uid, student));
  return onSnapshot(ref, snap => {
    cb(snap.exists() ? (snap.data().subjects ?? []) : []);
  });
}

// Overwrites the subject list for one student.
export function saveSubjectList(uid, student, subjects) {
  return setDoc(doc(db, subjectListPath(uid, student)), { subjects });
}

// Subscribes to all 5 day docs for one subject in one week.
// cb receives: { [dayIndex: number]: { lesson, note, done, flag } }
// Returns the Firestore unsubscribe function.
export function subscribeDayData(uid, weekId, student, subject, cb) {
  const colRef = collection(
    db,
    `${subjectPath(uid, weekId, student, subject)}/days`
  );
  return onSnapshot(colRef, snap => {
    const days = {};
    snap.forEach(d => { days[Number(d.id)] = d.data(); });
    cb(days);
  });
}

// Writes one day cell. merge:true so partial updates don't wipe other fields.
// data shape: { lesson: string, note: string, done: boolean, flag: boolean }
export function updateCell(uid, weekId, student, subject, dayIndex, data) {
  const ref = doc(db, dayPath(uid, weekId, student, subject, dayIndex));
  return setDoc(ref, data, { merge: true });
}
