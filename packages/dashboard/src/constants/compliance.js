// All Firestore path builders for the School Days Compliance feature.
// Data model:
//   /users/{uid}/settings/compliance              → { daysEnabled, requiredDays, startingDays, hoursEnabled, requiredHours, startingHours }
//   /users/{uid}/schoolDays/{dateString}          → { hoursLogged, ... }
// dateString format: "YYYY-MM-DD" (matches sickDayPath / weekId convention).

// Compliance settings doc — single document per user.
export const compliancePath = (uid) =>
  `users/${uid}/settings/compliance`;

// Per-day school-day records — collection of date-keyed docs.
export const schoolDaysPath = (uid) =>
  `users/${uid}/schoolDays`;

// Individual school-day document for a specific calendar date.
export const schoolDayDocPath = (uid, dateString) =>
  `users/${uid}/schoolDays/${dateString}`;

// Default values for a fresh compliance settings doc.
// Returned to subscribers when no doc exists yet so consumers always
// receive a populated object.
export const COMPLIANCE_DEFAULTS = {
  daysEnabled: false,
  requiredDays: 0,
  startingDays: 0,
  hoursEnabled: false,
  requiredHours: 0,
  startingHours: 0,
};
