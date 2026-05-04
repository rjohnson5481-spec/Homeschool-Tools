import {
  collection, doc, getDocs, addDoc, setDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@homeschool/shared';
import { activitiesCol, activityDoc } from '../constants/academics.js';

// Reads all activities for this user.
// Returns: [{ id, studentId, name, startDate, endDate, ongoing, notes }, ...]
// sorted by startDate descending.
export async function getActivities(uid) {
  const snap = await getDocs(collection(db, activitiesCol(uid)));
  const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return rows.sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''));
}

// Adds a new activity. Returns the new document id.
export async function addActivity(uid, data) {
  const ref = await addDoc(collection(db, activitiesCol(uid)), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// Updates an existing activity.
export function saveActivity(uid, activityId, data) {
  const ref = doc(db, activityDoc(uid, activityId));
  return setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

// Deletes an activity.
export function deleteActivity(uid, activityId) {
  return deleteDoc(doc(db, activityDoc(uid, activityId)));
}
