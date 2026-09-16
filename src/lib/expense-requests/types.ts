export type ExpenseRequestStatus = "pending" | "approved" | "rejected";

export type ExpenseRequest = {
  id: string;
  company_id: string;
  job_id: string;
  requested_by: string;
  material_name: string;
  reason: string;
  quantity: string;
  estimated_cost: number;
  additional_info: string | null;
  status: ExpenseRequestStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ExpenseRequestWithNames = ExpenseRequest & {
  requested_by_name: string | null;
  reviewed_by_name: string | null;
};

export type EmployeeExpenseRequestItem = ExpenseRequestWithNames & {
  job_code: string;
};

export type Expense = {
  id: string;
  company_id: string;
  job_id: string;
  expense_request_id: string | null;
  description: string;
  amount: number;
  created_by: string | null;
  created_at: string;
};

export const EXPENSE_REQUEST_SELECT_COLUMNS = `
  id, company_id, job_id, requested_by, material_name, reason, quantity,
  estimated_cost, additional_info, status, reviewed_by, reviewed_at,
  review_notes, created_at, updated_at,
  requested_by_profile:profiles!expense_requests_requested_by_fkey(full_name),
  reviewed_by_profile:profiles!expense_requests_reviewed_by_fkey(full_name)
`;
