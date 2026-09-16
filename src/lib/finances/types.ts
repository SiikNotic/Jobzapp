import type { InvoiceStatus } from "@/lib/invoices/types";

export type FinancePeriod = { from: string; to: string };

export type IncomeItem = {
  id: string;
  invoice_number: string;
  job_id: string;
  job_code: string;
  client_name: string;
  total: number;
  paid_at: string;
};

export type InvoiceSummaryItem = {
  id: string;
  invoice_number: string;
  job_id: string;
  job_code: string;
  client_name: string;
  total: number;
  status: InvoiceStatus;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
};

export type ExpenseItem = {
  id: string;
  job_id: string;
  job_code: string;
  expense_request_id: string | null;
  description: string;
  amount: number;
  created_at: string;
};

export type PayrollItem = {
  id: string;
  employee_id: string;
  employee_name: string;
  receipt_number: string;
  week_start_date: string;
  week_end_date: string;
  hours_worked: number;
  hourly_rate: number;
  gross_pay: number;
  issued_at: string;
};

export type JobFinancialSummary = {
  job_id: string;
  job_code: string;
  income: number;
  expenses: number;
  net: number;
};

export type FinanceSummary = {
  totalIncome: number;
  totalExpenses: number;
  totalPayroll: number;
  netTotal: number;
};
