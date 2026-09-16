import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { listExpensesForCompanyFinance, listIncomeForCompany } from "@/lib/finances/queries";
import { currentMonthPeriod } from "@/lib/finances/period";
import type { DashboardData } from "./types";

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
