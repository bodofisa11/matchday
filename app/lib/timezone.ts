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
