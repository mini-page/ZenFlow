/**
 * Calculates the consecutive day streak for a series of history entries.
 * Deduplicates by date and expects 'YYYY-MM-DD' formatted date strings.
 */
export function calculateStreak(history: { date: string }[]): number {
  if (history.length === 0) return 0;

  // Deduplicate dates before mapping to timestamps for better performance
  const uniqueDates = Array.from(new Set(history.map((h) => h.date)));
  const timestamps = uniqueDates
    .map((date) => new Date(date + 'T00:00:00').getTime())
    .sort((a, b) => b - a);

  const dayMs = 24 * 60 * 60 * 1000;
  let count = 0;
  let expected = timestamps[0];

  for (const ts of timestamps) {
    if (ts === expected) {
      count += 1;
      expected -= dayMs;
    } else {
      break;
    }
  }

  return count;
}
