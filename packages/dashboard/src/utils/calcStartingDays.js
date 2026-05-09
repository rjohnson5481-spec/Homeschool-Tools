// Counts weekdays from schoolYear.startDate through yesterday, excluding
// any days that fall inside a configured break period.
// Returns 0 if schoolYear has no startDate or if startDate is in the future.
// schoolYear shape: { startDate: "YYYY-MM-DD", breaks: [{ startDate, endDate }] }
export function calcStartingDays(schoolYear) {
  if (!schoolYear?.startDate) return 0;
  const start = new Date(schoolYear.startDate + 'T12:00:00');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(12, 0, 0, 0);
  if (start > yesterday) return 0;

  const breaks = schoolYear.breaks ?? [];
  let count = 0;
  const cursor = new Date(start);

  while (cursor <= yesterday) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      const cursorStr = cursor.toISOString().slice(0, 10);
      const inBreak = breaks.some(b => b.startDate <= cursorStr && cursorStr <= b.endDate);
      if (!inBreak) count++;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}
