import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import {
  EXPENSE_REQUEST_SELECT_COLUMNS,
  type EmployeeExpenseRequestItem,
  type Expense,
  type ExpenseRequestWithNames,
} from "./types";

function mapRequest(row: Record<string, unknown>): ExpenseRequestWithNames {
  const requestedByProfile = row.requested_by_profile as { full_name: string | null } | null;
  const reviewedByProfile = row.reviewed_by_profile as { full_name: string | null } | null;

  return {
    ...(row as object),
    requested_by_name: requestedByProfile?.full_name ?? null,
    reviewed_by_name: reviewedByProfile?.full_name ?? null,
  } as ExpenseRequestWithNames;
}

export async function listExpenseRequestsForJob(
  jobId: string
): Promise<ExpenseRequestWithNames[]> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("expense_requests")
    .select(EXPENSE_REQUEST_SELECT_COLUMNS)
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  return ((data as unknown as Record<string, unknown>[]) ?? []).map(mapRequest);
}

export async function listExpenseRequestsForEmployee(): Promise<EmployeeExpenseRequestItem[]> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("expense_requests")
    .select(`${EXPENSE_REQUEST_SELECT_COLUMNS}, job:jobs(job_code)`)
    .order("created_at", { ascending: false });

  return ((data as unknown as Record<string, unknown>[]) ?? []).map((row) => {
    const job = row.job as { job_code: string } | null;
    return {
      ...mapRequest(row),
      job_code: job?.job_code ?? "",
    } as EmployeeExpenseRequestItem;
  });
}

export async function listExpensesForCompany(companyId: string): Promise<Expense[]> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("expenses")
    .select("id, company_id, job_id, expense_request_id, description, amount, created_by, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data as Expense[]) ?? [];
}
