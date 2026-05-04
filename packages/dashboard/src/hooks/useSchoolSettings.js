import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@homeschool/shared';

// State is uid-tagged so stale pre-auth state cannot satisfy the load gate.
export function useSchoolSettings(uid) {
  const [state, setState] = useState({
    uid: null, schoolName: 'My Homeschool', tagline: '', loading: false,
  });

  useEffect(() => {
    if (!uid) {
      setState({ uid: null, schoolName: 'My Homeschool', tagline: '', loading: false });
      return;
    }
    setState(prev => ({
      uid,
      schoolName: prev.uid === uid ? prev.schoolName : 'My Homeschool',
      tagline:    prev.uid === uid ? prev.tagline    : '',
      loading:    true,
    }));
    const unsub = onSnapshot(doc(db, `users/${uid}/settings/school`), snap => {
      const data = snap.data();
      setState({
        uid,
        schoolName: data?.name    ?? 'My Homeschool',
        tagline:    data?.tagline ?? '',
        loading:    false,
      });
    });
    return unsub;
  }, [uid]);

  const schoolName = state.uid === uid ? state.schoolName : 'My Homeschool';
  const tagline    = state.uid === uid ? state.tagline    : '';
  const loading    = Boolean(uid) && (state.uid !== uid || state.loading);

  return { schoolName, tagline, loading };
}
