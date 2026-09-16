import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { listExpensesForCompanyFinance, listIncomeForCompany } from "@/lib/finances/queries";
import { currentMonthPeriod } from "@/lib/finances/period";
import type { DashboardData, MonthlyTrendPoint, RecentJobItem } from "./types";

/**
 * One aggregation pass for the owner dashboard. Every count here maps to
 * something actionable (work to review, money to collect, requests to
 * decide) rather than a decorative chart, and reuses the same Finances
 * queries so the numbers never drift from what /owner/finances shows.
 */
export async function getDashboardData(companyId: string): Promise<DashboardData> {
  const supabase = await createSupabaseClient();
  const period = currentMonthPeriod();

  const [
    scheduled,
    inProgress,
    completed,
    cancelled,
    pendingQuotes,
    pendingInvoices,
    pendingExpenseRequests,
    employeeCount,
    income,
    expenses,
  ] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("status", "scheduled"),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("status", "in_progress"),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("status", "completed"),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("status", "cancelled"),
    supabase.from("quotes").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("status", "sent"),
    supabase.from("invoices").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("status", "sent"),
    supabase.from("expense_requests").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("status", "pending"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("role", "employee"),
    listIncomeForCompany(companyId, period),
    listExpensesForCompanyFinance(companyId, period),
  ]);

  const scheduledCount = scheduled.count ?? 0;
  const inProgressCount = inProgress.count ?? 0;

  return {
    jobs: {
      scheduled: scheduledCount,
      inProgress: inProgressCount,
      completed: completed.count ?? 0,
      cancelled: cancelled.count ?? 0,
      pending: scheduledCount + inProgressCount,
    },
    pendingQuotes: pendingQuotes.count ?? 0,
    pendingInvoices: pendingInvoices.count ?? 0,
    incomeThisMonth: income.reduce((sum, item) => sum + item.total, 0),
    expensesThisMonth: expenses.reduce((sum, item) => sum + item.amount, 0),
    pendingExpenseRequests: pendingExpenseRequests.count ?? 0,
    employeeCount: employeeCount.count ?? 0,
  };
}

/**
 * Income vs expenses for each of the last `months` calendar months (oldest
 * first), built from the same Finances queries as the rest of the app —
 * bucketed client-side rather than via a second aggregate query, since the
 * monthly volume here is small enough that this stays cheap.
 */
export async function getMonthlyTrend(companyId: string, months = 6): Promise<MonthlyTrendPoint[]> {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1));
  const period = { from: from.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) };

  const [income, expenses] = await Promise.all([
    listIncomeForCompany(companyId, period),
    listExpensesForCompanyFinance(companyId, period),
  ]);

  const buckets = new Map<string, MonthlyTrendPoint>();
  for (let i = 0; i < months; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1 - i), 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, { month: key, income: 0, expenses: 0 });
  }

  for (const item of income) {
    const bucket = buckets.get(item.paid_at.slice(0, 7));
    if (bucket) bucket.income += item.total;
  }
  for (const item of expenses) {
    const bucket = buckets.get(item.created_at.slice(0, 7));
    if (bucket) bucket.expenses += item.amount;
  }

  return Array.from(buckets.values());
}

/** Most recently created jobs, with client and first assigned employee, for
 * the dashboard's "recent jobs" panel. */
export async function listRecentJobs(companyId: string, limit = 5): Promise<RecentJobItem[]> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("jobs")
    .select(
      "id, job_code, priority, status, client:clients(display_name), job_assignments(employee:profiles!job_assignments_employee_id_fkey(full_name))"
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data as unknown as Record<string, unknown>[]) ?? []).map((row) => {
    const client = row.client as { display_name: string } | null;
    const assignments = row.job_assignments as { employee: { full_name: string | null } | null }[] | null;
    return {
      id: row.id as string,
      job_code: row.job_code as string,
      client_name: client?.display_name ?? null,
      employee_name: assignments?.[0]?.employee?.full_name ?? null,
      priority: row.priority as RecentJobItem["priority"],
      status: row.status as RecentJobItem["status"],
    };
  });
}
