// Firestore reads and writes for Report Notes, Saved Reports, and PDF Storage.
// No business logic — pure I/O only.
// All paths from constants/academics.js — nothing hardcoded here.

import {
  collection, doc, getDocs, addDoc, setDoc, deleteDoc,
  query, where, serverTimestamp,
} from 'firebase/firestore';
import { db, storage } from '@homeschool/shared';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import {
  reportNotesCol, reportNoteDoc,
  savedReportsCol, savedReportDoc,
} from '../constants/academics.js';

// ─── Report Notes ────────────────────────────────────────────────────────────

// Reads all report notes for this user.
// Returns: [{ id, studentId, quarterId, notes, updatedAt }, ...]
export async function getReportNotes(uid) {
  const snap = await getDocs(collection(db, reportNotesCol(uid)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Finds a report note for a specific student + quarter. Returns object or null.
export async function getReportNote(uid, studentId, quarterId) {
  const q = query(collection(db, reportNotesCol(uid)), where('studentId', '==', studentId), where('quarterId', '==', quarterId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

// Updates an existing report note.
// data shape: { studentId, quarterId, notes }
export function saveReportNote(uid, noteId, data) {
  const ref = doc(db, reportNoteDoc(uid, noteId));
  return setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

// Adds a new report note. Returns the new document id.
// data shape: { studentId, quarterId, notes }
export async function addReportNote(uid, data) {
  const ref = await addDoc(collection(db, reportNotesCol(uid)), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── Saved Reports ───────────────────────────────────────────────────────────

// Reads all saved report card snapshots for this user, newest first.
export async function getSavedReports(uid) {
  const snap = await getDocs(collection(db, savedReportsCol(uid)));
  const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return rows.sort((a, b) => (b.generatedAt?.toMillis?.() ?? 0) - (a.generatedAt?.toMillis?.() ?? 0));
}

// Saves a new report card snapshot. Returns new document id.
export async function saveSavedReport(uid, data) {
  const ref = await addDoc(collection(db, savedReportsCol(uid)), {
    ...data,
    generatedAt: serverTimestamp(),
  });
  return ref.id;
}

// Deletes a saved report card (Firestore doc only — Storage handled separately).
export function deleteSavedReport(uid, reportId) {
  return deleteDoc(doc(db, savedReportDoc(uid, reportId)));
}

// ─── Report PDF Storage ──────────────────────────────────────────────────────

// Uploads PDF bytes to Firebase Storage. Returns the download URL.
export async function uploadReportPDF(uid, reportId, pdfBytes) {
  const fileRef = storageRef(storage, `users/${uid}/reports/${reportId}.pdf`);
  await uploadBytes(fileRef, pdfBytes, { contentType: 'application/pdf' });
  return getDownloadURL(fileRef);
}

// Deletes a report PDF from Firebase Storage.
export async function deleteReportPDF(uid, reportId) {
  const fileRef = storageRef(storage, `users/${uid}/reports/${reportId}.pdf`);
  try { await deleteObject(fileRef); }
  catch (err) { if (err?.code !== 'storage/object-not-found') throw err; }
}
