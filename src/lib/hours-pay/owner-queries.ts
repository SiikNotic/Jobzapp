import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type { PayReceipt, PayRate, TimeEntryWithJob } from "./types";
import { getWeekEnd } from "./weeks";

export async function getEmployeePayRate(employeeId: string): Promise<PayRate | null> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("employee_pay_rates")
    .select("employee_id, hourly_rate, updated_at")
    .eq("employee_id", employeeId)
    .maybeSingle();

  return data as PayRate | null;
}

export async function listTimeEntriesForEmployee(employeeId: string): Promise<TimeEntryWithJob[]> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("time_entries")
    .select("id, company_id, employee_id, job_id, work_date, hours, notes, created_at, job:jobs(job_code)")
    .eq("employee_id", employeeId)
    .order("work_date", { ascending: false })
    .limit(30);

  return ((data as unknown as Record<string, unknown>[]) ?? []).map((row) => {
    const job = row.job as { job_code: string } | null;
    return { ...(row as object), job_code: job?.job_code ?? null } as TimeEntryWithJob;
  });
}

export async function listReceiptsForEmployee(employeeId: string): Promise<PayReceipt[]> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("pay_receipts")
    .select(
      "id, company_id, employee_id, receipt_number, week_start_date, week_end_date, hours_worked, hourly_rate, gross_pay, notes, issued_at"
    )
    .eq("employee_id", employeeId)
    .order("week_start_date", { ascending: false });

  return (data as PayReceipt[]) ?? [];
}

/** Total unbilled hours logged for the given employee within [weekStart, weekStart + 6]. */
export async function getUnbilledHoursForWeek(
  employeeId: string,
  weekStart: string
): Promise<number> {
  const supabase = await createSupabaseClient();
  const weekEnd = getWeekEnd(weekStart);

  const { data } = await supabase
    .from("time_entries")
    .select("hours")
    .eq("employee_id", employeeId)
    .gte("work_date", weekStart)
    .lte("work_date", weekEnd);

  return (data ?? []).reduce((sum, row) => sum + Number(row.hours), 0);
}
