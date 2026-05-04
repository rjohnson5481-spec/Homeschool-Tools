import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@homeschool/shared';

// Subscribes to /users/{uid}/students.
// Each document: { name, emoji, order }
// Returns stable references — studentMap and getStudentName are recreated only
// when the students array changes.
export function useStudents(uid) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const q = query(collection(db, `users/${uid}/students`), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setStudents(snap.docs.map(d => ({ studentId: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  const studentMap = Object.fromEntries(students.map(s => [s.studentId, s]));

  function getStudentName(studentId) {
    return studentMap[studentId]?.name ?? studentId;
  }

  return { students, studentMap, getStudentName, loading };
}
