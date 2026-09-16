import { getCompanyById } from "@/lib/company/get-company";
import { listExpensesForCompanyFinance, listIncomeForCompany, listPayrollForCompany } from "@/lib/finances/queries";
import type { FinancePeriod } from "@/lib/finances/types";
import { listEmployees } from "@/lib/jobs/queries";
import { getEmployeePayRate } from "@/lib/hours-pay/owner-queries";
import type { TaxReportData, TaxReportEmployee } from "./types";

/**
 * Pulls together everything Taxes / Payroll hands off to an accountant: it
 * reuses the same Finances queries (so the numbers always match what's
 * shown there) plus per-employee pay rate and period totals.
 */
export async function buildTaxReport(companyId: string, period: FinancePeriod): Promise<TaxReportData> {
  const [company, income, expenses, payroll, employees] = await Promise.all([
    getCompanyById(companyId),
    listIncomeForCompany(companyId, period),
    listExpensesForCompanyFinance(companyId, period),
    listPayrollForCompany(companyId, period),
    listEmployees(companyId),
  ]);

  const payrollByEmployee = new Map<string, number>();
  for (const item of payroll) {
    payrollByEmployee.set(item.employee_id, (payrollByEmployee.get(item.employee_id) ?? 0) + item.gross_pay);
  }

  const employeeReports: TaxReportEmployee[] = await Promise.all(
    employees.map(async (employee) => {
      const rate = await getEmployeePayRate(employee.id);
      return {
        id: employee.id,
        full_name: employee.full_name,
        hourly_rate: rate?.hourly_rate ?? null,
        total_paid: payrollByEmployee.get(employee.id) ?? 0,
      };
    })
  );

  return {
    company: {
      name: company?.trade_name || company?.name || "",
      country: company?.country ?? "US",
      tax_id: company?.tax_id ?? null,
    },
    period,
    income,
    totalIncome: income.reduce((sum, item) => sum + item.total, 0),
    expenses,
    totalExpenses: expenses.reduce((sum, item) => sum + item.amount, 0),
    payroll,
    totalPayroll: payroll.reduce((sum, item) => sum + item.gross_pay, 0),
    employees: employeeReports,
  };
}
