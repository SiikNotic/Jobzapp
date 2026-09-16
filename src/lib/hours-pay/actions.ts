import { requireOwnerCompany } from "@/lib/auth/require-owner";
import { payRateSchema, timeEntrySchema, issueReceiptSchema } from "./schema";
import { getWeekEnd } from "./weeks";

export type HoursPayActionResult = { success: true } | { success: false; error: string };

export async function previewUnbilledHours(
  employeeId: string,
  weekStartDate: string
): Promise<number> {
  const { supabase, companyId } = await requireOwnerCompany();
  if (!companyId || !/^\d{4}-\d{2}-\d{2}$/.test(weekStartDate)) return 0;

  const weekEnd = getWeekEnd(weekStartDate);
  const { data } = await supabase
    .from("time_entries")
    .select("hours")
    .eq("employee_id", employeeId)
    .gte("work_date", weekStartDate)
    .lte("work_date", weekEnd);

  return (data ?? []).reduce((sum, row) => sum + Number(row.hours), 0);
}

export async function setPayRate(employeeId: string, hourlyRate: number): Promise<HoursPayActionResult> {
  const { supabase, companyId, userId } = await requireOwnerCompany();
  if (!companyId || !userId) return { success: false, error: "not_allowed" };

  const parsed = payRateSchema.safeParse({ employee_id: employeeId, hourly_rate: hourlyRate });
  if (!parsed.success) return { success: false, error: "validation" };

  const { error } = await supabase
    .from("employee_pay_rates")
    .upsert(
      {
        employee_id: parsed.data.employee_id,
        hourly_rate: parsed.data.hourly_rate,
        updated_by: userId,
      },
      { onConflict: "employee_id" }
    );

  if (error) return { success: false, error: "save_failed" };

  return { success: true };
}

export async function logTimeEntry(employeeId: string, formData: FormData): Promise<HoursPayActionResult> {
  const { supabase, companyId, userId } = await requireOwnerCompany();
  if (!companyId || !userId) return { success: false, error: "not_allowed" };

  const parsed = timeEntrySchema.safeParse({
    employee_id: employeeId,
    work_date: String(formData.get("work_date") ?? ""),
    hours: String(formData.get("hours") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });

  if (!parsed.success) return { success: false, error: "validation" };

  const { error } = await supabase.from("time_entries").insert({
    employee_id: parsed.data.employee_id,
    work_date: parsed.data.work_date,
    hours: parsed.data.hours,
    notes: parsed.data.notes,
    created_by: userId,
  });

  if (error) return { success: false, error: "save_failed" };

  return { success: true };
}

export async function deleteTimeEntry(entryId: string): Promise<HoursPayActionResult> {
  const { supabase, companyId, userId } = await requireOwnerCompany();
  if (!companyId || !userId) return { success: false, error: "not_allowed" };

  const { error } = await supabase.from("time_entries").delete().eq("id", entryId);
  if (error) return { success: false, error: "save_failed" };

  return { success: true };
}

export async function issueReceipt(employeeId: string, weekStartDate: string): Promise<HoursPayActionResult> {
  const { supabase, companyId, userId } = await requireOwnerCompany();
  if (!companyId || !userId) return { success: false, error: "not_allowed" };

  const parsed = issueReceiptSchema.safeParse({
    employee_id: employeeId,
    week_start_date: weekStartDate,
  });
  if (!parsed.success) return { success: false, error: "validation" };

  const { data: rate } = await supabase
    .from("employee_pay_rates")
    .select("hourly_rate")
    .eq("employee_id", parsed.data.employee_id)
    .maybeSingle();

  if (!rate) return { success: false, error: "no_pay_rate" };

  const weekEnd = getWeekEnd(parsed.data.week_start_date);
  const { data: entries } = await supabase
    .from("time_entries")
    .select("hours")
    .eq("employee_id", parsed.data.employee_id)
    .gte("work_date", parsed.data.week_start_date)
    .lte("work_date", weekEnd);

  const hoursWorked = (entries ?? []).reduce((sum, row) => sum + Number(row.hours), 0);
  if (hoursWorked <= 0) return { success: false, error: "no_hours" };

  const { data: receiptNumber, error: numberError } = await supabase.rpc(
    "generate_receipt_number",
    { p_company_id: companyId }
  );
  if (numberError || !receiptNumber) return { success: false, error: "save_failed" };

  const { error } = await supabase.from("pay_receipts").insert({
    employee_id: parsed.data.employee_id,
    receipt_number: receiptNumber,
    week_start_date: parsed.data.week_start_date,
    week_end_date: weekEnd,
    hours_worked: hoursWorked,
    hourly_rate: rate.hourly_rate,
    issued_by: userId,
  });

  if (error) {
    if (error.code === "23505") return { success: false, error: "already_issued" };
    return { success: false, error: "save_failed" };
  }

  return { success: true };
}
