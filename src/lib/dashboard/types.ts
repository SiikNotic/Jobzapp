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
