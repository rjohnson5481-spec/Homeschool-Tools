// Firestore writes for the /users/{uid}/students/ subcollection.
// No business logic — pure I/O only.

import { doc, collection, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@homeschool/shared';

export async function addStudent(uid, { name, emoji, gradeLevel }, order) {
  const ref = doc(collection(db, `users/${uid}/students`));
  await setDoc(ref, {
    studentId:  ref.id,
    name,
    emoji:      emoji || '🎓',
    gradeLevel: gradeLevel || '',
    order,
    createdAt:  serverTimestamp(),
  });
}

export function updateStudent(uid, studentId, { name, emoji, gradeLevel }) {
  return updateDoc(doc(db, `users/${uid}/students/${studentId}`), {
    name,
    emoji:      emoji || '🎓',
    gradeLevel: gradeLevel || '',
  });
}

export function deleteStudent(uid, studentId) {
  console.warn('Student removed — planner data, enrollments, and compliance data for this studentId are not deleted');
  return deleteDoc(doc(db, `users/${uid}/students/${studentId}`));
}
