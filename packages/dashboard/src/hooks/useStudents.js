import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@homeschool/shared';

// Subscribes to /users/{uid}/students.
// Each document: { name, emoji, order }
// State is uid-tagged so stale pre-auth state cannot satisfy the load gate.
export function useStudents(uid) {
  const [state, setState] = useState({ uid: null, students: [], loading: false });

  useEffect(() => {
    if (!uid) {
      setState({ uid: null, students: [], loading: false });
      return;
    }
    setState(prev => ({
      uid,
      students: prev.uid === uid ? prev.students : [],
      loading: true,
    }));
    const q = query(collection(db, `users/${uid}/students`), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setState({
        uid,
        students: snap.docs.map(d => ({ studentId: d.id, ...d.data() })),
        loading: false,
      });
    });
    return unsub;
  }, [uid]);

  const students = state.uid === uid ? state.students : [];
  const loading  = Boolean(uid) && (state.uid !== uid || state.loading);

  const studentMap = Object.fromEntries(students.map(s => [s.studentId, s]));

  function getStudentName(studentId) {
    return studentMap[studentId]?.name ?? studentId;
  }

  return { students, studentMap, getStudentName, loading };
}
