import type { FinancePeriod } from "./types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function resolvePeriod(searchParams: {
  from?: string;
  to?: string;
}): FinancePeriod | undefined {
  const { from, to } = searchParams;
  if (from && to && DATE_RE.test(from) && DATE_RE.test(to)) {
    return { from, to };
  }
  return undefined;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function currentYearPeriod(): FinancePeriod {
  const now = new Date();
  return {
    from: `${now.getUTCFullYear()}-01-01`,
    to: toDateStr(now),
  };
}

export function currentMonthPeriod(): FinancePeriod {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return { from: toDateStr(from), to: toDateStr(now) };
}
