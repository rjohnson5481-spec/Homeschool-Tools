// All Firestore path builders live here — never hardcode paths elsewhere.
// Data model:
//   /users/{uid}/weeks/{weekId}/students/{studentId}/days/{dayIndex}/subjects/{subject}
//   → { lesson, note, done, flag, uid }
// Subjects are implicit: a subject exists on a day only when its document exists.

export const weekPath = (uid, weekId) =>
  `users/${uid}/weeks/${weekId}`;

export const studentPath = (uid, weekId, studentId) =>
  `users/${uid}/weeks/${weekId}/students/${studentId}`;

// Collection of all subjects present on a given day.
export const daySubjectsPath = (uid, weekId, studentId, dayIndex) =>
  `users/${uid}/weeks/${weekId}/students/${studentId}/days/${dayIndex}/subjects`;

// Individual cell document (one subject on one day).
export const cellPath = (uid, weekId, studentId, dayIndex, subject) =>
  `users/${uid}/weeks/${weekId}/students/${studentId}/days/${dayIndex}/subjects/${subject}`;

// Sick day marker for a specific calendar date.
// dateString format: "YYYY-MM-DD"
export const sickDayPath = (uid, dateString) =>
  `users/${uid}/sickDays/${dateString}`;

// Settings — student list.
// Document: { names: string[] }
export const settingsStudentsPath = (uid) =>
  `users/${uid}/settings/students`;

// Settings — default subject presets per student.
// Document: { subjects: string[] }
// Note: stored at /users/{uid}/subjectPresets/{studentId} (4-segment valid doc path)
export const settingsSubjectsPath = (uid, studentId) =>
  `users/${uid}/subjectPresets/${studentId}`;
