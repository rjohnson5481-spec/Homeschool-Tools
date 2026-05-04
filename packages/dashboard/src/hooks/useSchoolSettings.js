import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@homeschool/shared';

export function useSchoolSettings(uid) {
  const [schoolName, setSchoolName] = useState('My Homeschool');
  const [tagline, setTagline]       = useState('');
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    const ref = doc(db, `users/${uid}/settings/school`);
    const unsub = onSnapshot(ref, snap => {
      const data = snap.data();
      setSchoolName(data?.schoolName ?? 'My Homeschool');
      setTagline(data?.tagline ?? '');
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return { schoolName, tagline, loading };
}
