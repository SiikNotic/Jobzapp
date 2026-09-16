export type DashboardData = {
  jobs: {
    pending: number;
    scheduled: number;
    inProgress: number;
    completed: number;
  };
  pendingQuotes: number;
  pendingInvoices: number;
  incomeThisMonth: number;
  expensesThisMonth: number;
  pendingExpenseRequests: number;
  employeeCount: number;
};
