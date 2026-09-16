import type { CompanyCountry } from "@/lib/company/types";
import type { ExpenseItem, FinancePeriod, IncomeItem, PayrollItem } from "@/lib/finances/types";

export type TaxReportEmployee = {
  id: string;
  full_name: string | null;
  hourly_rate: number | null;
  total_paid: number;
};

export type TaxReportData = {
  company: {
    name: string;
    country: CompanyCountry;
    tax_id: string | null;
  };
  period: FinancePeriod;
  income: IncomeItem[];
  totalIncome: number;
  expenses: ExpenseItem[];
  totalExpenses: number;
  payroll: PayrollItem[];
  totalPayroll: number;
  employees: TaxReportEmployee[];
};
