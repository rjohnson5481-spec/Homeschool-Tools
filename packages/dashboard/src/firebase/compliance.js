// Firestore reads, writes, and subscriptions for the School Days Compliance
// feature. No business logic — pure I/O only. All paths from
// constants/compliance.js.

import {
  collection, doc, onSnapshot, setDoc, updateDoc, query, where, documentId,
} from 'firebase/firestore';
import { db } from '@homeschool/shared';
import {
  compliancePath, schoolDayDocPath, schoolDaysPath, COMPLIANCE_DEFAULTS,
} from '../constants/compliance.js';

// Subscribes to the user's compliance settings doc.
// cb receives a populated settings object — falls back to COMPLIANCE_DEFAULTS
// when the doc does not exist yet so consumers always get every field.
// Returns the onSnapshot unsubscribe function.
export function subscribeCompliance(uid, cb) {
  return onSnapshot(doc(db, compliancePath(uid)), snap => {
    cb(snap.exists() ? { ...COMPLIANCE_DEFAULTS, ...snap.data() } : { ...COMPLIANCE_DEFAULTS });
  });
}

// Partial-update writer for the compliance settings doc. Caller passes a
// flat object whose keys may be nested field paths (e.g.
// 'requiredByStudent.Orion.requiredDays') and whose values may include
// FieldValue.deleteField() to remove deprecated fields. Thin wrapper —
// no merging logic of its own; updateDoc handles nested-field syntax
// natively. Used by ComplianceSheet's per-input granular saves and the
// lazy contract migration of the deprecated top-level requiredDays /
// requiredHours fields.
export function saveCompliance(uid, partial) {
  return updateDoc(doc(db, compliancePath(uid)), partial);
}

// Writes hours for a single student on a single date. setDoc + merge:true
// creates the doc if missing and merges the nested hoursByStudent map so
// other students' hours on the same day are preserved.
export function saveSchoolDayHours(uid, dateString, student, hours) {
  return setDoc(
    doc(db, schoolDayDocPath(uid, dateString)),
    { hoursByStudent: { [student]: hours } },
    { merge: true },
  );
}

// Subscribes to the schoolDays collection filtered to docs whose ID falls
// within [startDate, endDate] inclusive. Filters by document ID using
// documentId() since dateString IDs sort lexicographically as YYYY-MM-DD.
// cb receives an array of { _id, ...data } objects. Returns the unsubscribe.
export function subscribeSchoolDays(uid, startDate, endDate, cb) {
  const q = query(
    collection(db, schoolDaysPath(uid)),
    where(documentId(), '>=', startDate),
    where(documentId(), '<=', endDate),
  );
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({ _id: d.id, ...d.data() })));
  });
}
