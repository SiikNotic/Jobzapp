import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type {
  ExpenseItem,
  FinancePeriod,
  FinanceSummary,
  IncomeItem,
  InvoiceSummaryItem,
  JobFinancialSummary,
  PayrollItem,
} from "./types";

/**
 * Every query here is scoped to a single company and, optionally, a date
 * period. Each returned row keeps a reference back to its originating
 * record (job, invoice, expense request, employee) so Finances never shows
 * a number that can't be traced to where it came from.
 */

export async function listIncomeForCompany(
  companyId: string,
  period?: FinancePeriod
): Promise<IncomeItem[]> {
  const supabase = await createSupabaseClient();
  let query = supabase
    .from("invoices")
    .select("id, invoice_number, job_id, total, paid_at, client_name, job:jobs(job_code)")
    .eq("company_id", companyId)
    .eq("status", "paid")
    .order("paid_at", { ascending: false });

  if (period) query = query.gte("paid_at", period.from).lte("paid_at", `${period.to}T23:59:59`);

  const { data } = await query;
  return ((data as unknown as Record<string, unknown>[]) ?? []).map((row) => {
    const job = row.job as { job_code: string } | null;
    return { ...(row as object), job_code: job?.job_code ?? "" } as IncomeItem;
  });
}

export async function listInvoicesForCompanyFinance(
  companyId: string,
  period?: FinancePeriod
): Promise<InvoiceSummaryItem[]> {
  const supabase = await createSupabaseClient();
  let query = supabase
    .from("invoices")
    .select(
      "id, invoice_number, job_id, total, status, sent_at, paid_at, created_at, client_name, job:jobs(job_code)"
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (period) query = query.gte("created_at", period.from).lte("created_at", `${period.to}T23:59:59`);

  const { data } = await query;
  return ((data as unknown as Record<string, unknown>[]) ?? []).map((row) => {
    const job = row.job as { job_code: string } | null;
    return { ...(row as object), job_code: job?.job_code ?? "" } as InvoiceSummaryItem;
  });
}

export async function listExpensesForCompanyFinance(
  companyId: string,
  period?: FinancePeriod
): Promise<ExpenseItem[]> {
  const supabase = await createSupabaseClient();
  let query = supabase
    .from("expenses")
    .select("id, job_id, expense_request_id, description, amount, created_at, job:jobs(job_code)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (period) query = query.gte("created_at", period.from).lte("created_at", `${period.to}T23:59:59`);

  const { data } = await query;
  return ((data as unknown as Record<string, unknown>[]) ?? []).map((row) => {
    const job = row.job as { job_code: string } | null;
    return { ...(row as object), job_code: job?.job_code ?? "" } as ExpenseItem;
  });
}

export async function listPayrollForCompany(
  companyId: string,
  period?: FinancePeriod
): Promise<PayrollItem[]> {
  const supabase = await createSupabaseClient();
  let query = supabase
    .from("pay_receipts")
    .select(
      "id, employee_id, receipt_number, week_start_date, week_end_date, hours_worked, hourly_rate, gross_pay, issued_at, employee:profiles!pay_receipts_employee_id_fkey(full_name)"
    )
    .eq("company_id", companyId)
    .order("week_start_date", { ascending: false });

  if (period) query = query.gte("week_start_date", period.from).lte("week_start_date", period.to);

  const { data } = await query;
  return ((data as unknown as Record<string, unknown>[]) ?? []).map((row) => {
    const employee = row.employee as { full_name: string | null } | null;
    return { ...(row as object), employee_name: employee?.full_name ?? "" } as PayrollItem;
  });
}

export async function listJobFinancialSummaries(
  companyId: string,
  period?: FinancePeriod
): Promise<JobFinancialSummary[]> {
  const [income, expenses] = await Promise.all([
    listIncomeForCompany(companyId, period),
    listExpensesForCompanyFinance(companyId, period),
  ]);

  const byJob = new Map<string, JobFinancialSummary>();

  const get = (jobId: string, jobCode: string) => {
    const existing = byJob.get(jobId);
    if (existing) return existing;
    const created: JobFinancialSummary = { job_id: jobId, job_code: jobCode, income: 0, expenses: 0, net: 0 };
    byJob.set(jobId, created);
    return created;
  };

  for (const item of income) {
    const entry = get(item.job_id, item.job_code);
    entry.income += item.total;
  }
  for (const item of expenses) {
    const entry = get(item.job_id, item.job_code);
    entry.expenses += item.amount;
  }
  for (const entry of byJob.values()) {
    entry.net = entry.income - entry.expenses;
  }

  return Array.from(byJob.values()).sort((a, b) => b.income - a.income);
}

export async function getFinanceSummary(
  companyId: string,
  period?: FinancePeriod
): Promise<FinanceSummary> {
  const [income, expenses, payroll] = await Promise.all([
    listIncomeForCompany(companyId, period),
    listExpensesForCompanyFinance(companyId, period),
    listPayrollForCompany(companyId, period),
  ]);

  const totalIncome = income.reduce((sum, item) => sum + item.total, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalPayroll = payroll.reduce((sum, item) => sum + item.gross_pay, 0);

  return {
    totalIncome,
    totalExpenses,
    totalPayroll,
    netTotal: totalIncome - totalExpenses - totalPayroll,
  };
}
