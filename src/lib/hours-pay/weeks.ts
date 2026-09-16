/**
 * Monday-based week boundaries, matching Postgres' date_trunc('week', ...)
 * so client-computed week keys line up with server-issued receipt weeks.
 */
export function getWeekStart(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}

export function getWeekEnd(weekStart: string): string {
  const d = new Date(`${weekStart}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().slice(0, 10);
}

export function todayWeekStart(): string {
  return getWeekStart(new Date().toISOString().slice(0, 10));
}
