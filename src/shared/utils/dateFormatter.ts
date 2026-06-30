export function toLocalISOWithOffset(datetimeLocal: string): string {
  // Input: "2026-06-16T20:45" datetime-local (Indonesia)
  // Output: "2026-06-16T20:45:00+07:00"
  const offsetMinutes = new Date().getTimezoneOffset();
  const sign = offsetMinutes <= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `${datetimeLocal}:00${sign}${hh}:${mm}`;
}

export function nowLocalDatetime(): string {
  // Return format for default input value datetime-local
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}
