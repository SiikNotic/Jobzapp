export type DashboardData = {
  jobs: {
    pending: number;
    scheduled: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  pendingQuotes: number;
  pendingInvoices: number;
  incomeThisMonth: number;
  expensesThisMonth: number;
  pendingExpenseRequests: number;
  employeeCount: number;
};

/** One point per calendar month, oldest first. `month` is a YYYY-MM key —
 * format it for display with the caller's own locale. */
export type MonthlyTrendPoint = {
  month: string;
  income: number;
  expenses: number;
};

export type RecentJobItem = {
  id: string;
  job_code: string;
  client_name: string | null;
  employee_name: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
};
