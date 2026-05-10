/**
 * Timezone helpers.
 *
 * The database stores fixture date + kickoff in the API's original timezone
 * (football-data.org returns UTC). The UI shows IST (Asia/Kolkata, UTC+5:30),
 * so every time read from the database is converted here before rendering.
 */

const IST_OFFSET_MIN = 5 * 60 + 30;

/**
 * Convert a UTC `YYYY-MM-DD` + `HH:MM` pair into the equivalent IST
 * date + kickoff. The date may shift by a day across the IST boundary.
 */
export function utcToIST(
  dateStr: string,
  kickoff: string,
): { date: string; kickoff: string } {
  const utc = new Date(`${dateStr}T${kickoff}:00Z`);
  if (Number.isNaN(utc.getTime())) return { date: dateStr, kickoff };
  const ist = new Date(utc.getTime() + IST_OFFSET_MIN * 60 * 1000);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const d = String(ist.getUTCDate()).padStart(2, "0");
  const H = String(ist.getUTCHours()).padStart(2, "0");
  const M = String(ist.getUTCMinutes()).padStart(2, "0");
  return { date: `${y}-${m}-${d}`, kickoff: `${H}:${M}` };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Current calendar date in IST, formatted YYYY-MM-DD. */
export function istTodayStr(): string {
  const ist = new Date(Date.now() + IST_OFFSET_MIN * 60 * 1000);
  return `${ist.getUTCFullYear()}-${pad2(ist.getUTCMonth() + 1)}-${pad2(ist.getUTCDate())}`;
}

/** Add `days` (may be negative) to a YYYY-MM-DD date string. */
export function addDaysToDateStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

/**
 * Given a contiguous IST date window [istStart, istEnd] (inclusive), return the
 * UTC date bounds that must be queried to cover every fixture whose IST date
 * falls in that window.
 *
 * Because IST = UTC + 5:30, the IST day starts at 18:30 UTC of the previous
 * calendar day. So the UTC range expands by one day on the lower bound; the
 * upper bound stays the same (IST 23:59 = UTC 18:29 same day).
 */
export function istDateRangeToUTCDateRange(
  istStart: string,
  istEnd: string,
): { utcStart: string; utcEnd: string } {
  return {
    utcStart: addDaysToDateStr(istStart, -1),
    utcEnd: istEnd,
  };
}
