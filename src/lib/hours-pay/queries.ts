import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import type { PayReceipt, PayRate, TimeEntryWithJob, WeekSummary } from "./types";
import { getWeekEnd, getWeekStart } from "./weeks";

/** RLS restricts every query below to rows owned by the signed-in employee. */

export async function getMyPayRate(): Promise<PayRate | null> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("employee_pay_rates")
    .select("employee_id, hourly_rate, updated_at")
    .eq("employee_id", user.id)
    .maybeSingle();

  return data as PayRate | null;
}

export async function listMyTimeEntries(): Promise<TimeEntryWithJob[]> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("time_entries")
    .select("id, company_id, employee_id, job_id, work_date, hours, notes, created_at, job:jobs(job_code)")
    .order("work_date", { ascending: false });

  return ((data as unknown as Record<string, unknown>[]) ?? []).map((row) => {
    const job = row.job as { job_code: string } | null;
    return { ...(row as object), job_code: job?.job_code ?? null } as TimeEntryWithJob;
  });
}

export async function listMyReceipts(): Promise<PayReceipt[]> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("pay_receipts")
    .select(
      "id, company_id, employee_id, receipt_number, week_start_date, week_end_date, hours_worked, hourly_rate, gross_pay, notes, issued_at"
    )
    .order("week_start_date", { ascending: false });

  return (data as PayReceipt[]) ?? [];
}

/** Groups time entries into Monday-Sunday weeks, newest first, attaching an issued receipt when one exists. */
export function buildWeekSummaries(
  entries: TimeEntryWithJob[],
  receipts: PayReceipt[]
): WeekSummary[] {
  const receiptsByWeek = new Map(receipts.map((r) => [r.week_start_date, r]));
  const weeks = new Map<string, TimeEntryWithJob[]>();

  for (const entry of entries) {
    const weekStart = getWeekStart(entry.work_date);
    const bucket = weeks.get(weekStart) ?? [];
    bucket.push(entry);
    weeks.set(weekStart, bucket);
  }

  for (const receipt of receipts) {
    if (!weeks.has(receipt.week_start_date)) weeks.set(receipt.week_start_date, []);
  }

  return Array.from(weeks.entries())
    .map(([weekStart, weekEntries]) => ({
      weekStart,
      weekEnd: getWeekEnd(weekStart),
      hours: weekEntries.reduce((sum, e) => sum + e.hours, 0),
      entries: weekEntries.sort((a, b) => (a.work_date < b.work_date ? 1 : -1)),
      receipt: receiptsByWeek.get(weekStart) ?? null,
    }))
    .sort((a, b) => (a.weekStart < b.weekStart ? 1 : -1));
}
