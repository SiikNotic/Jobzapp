import { Briefcase, FileText, Receipt, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { useFormatter } from "next-intl";

import { Link, redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import {
  getFinanceSummary,
  listExpensesForCompanyFinance,
  listIncomeForCompany,
  listInvoicesForCompanyFinance,
  listJobFinancialSummaries,
  listPayrollForCompany,
} from "@/lib/finances/queries";
import { resolvePeriod } from "@/lib/finances/period";
import type {
  ExpenseItem,
  IncomeItem,
  InvoiceSummaryItem,
  JobFinancialSummary,
  PayrollItem,
} from "@/lib/finances/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceStatusBadge } from "@/components/documents/invoice-status-badge";
import { PeriodFilter } from "@/components/owner/finances/period-filter";

export default async function FinancesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const { from, to } = await searchParams;
  const t = await getTranslations({ locale, namespace: "owner.finances" });

  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) {
    redirect({ href: "/login", locale });
    return null;
  }

  const period = resolvePeriod({ from, to });
  const companyId = profile.company_id;

  const [summary, income, invoices, expenses, payroll, jobSummaries] = await Promise.all([
    getFinanceSummary(companyId, period),
    listIncomeForCompany(companyId, period),
    listInvoicesForCompanyFinance(companyId, period),
    listExpensesForCompanyFinance(companyId, period),
    listPayrollForCompany(companyId, period),
    listJobFinancialSummaries(companyId, period),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <PeriodFilter initialFrom={from} initialTo={to} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={<TrendingUp className="size-4" />} label={t("totalIncome")} value={summary.totalIncome} tone="success" />
        <SummaryCard icon={<TrendingDown className="size-4" />} label={t("totalExpenses")} value={summary.totalExpenses} tone="destructive" />
        <SummaryCard icon={<Wallet className="size-4" />} label={t("totalPayroll")} value={summary.totalPayroll} tone="destructive" />
        <SummaryCard icon={<Wallet className="size-4" />} label={t("netTotal")} value={summary.netTotal} tone={summary.netTotal >= 0 ? "success" : "destructive"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4 text-muted-foreground" /> {t("income")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {income.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noIncome")}</p>
          ) : (
            <IncomeTable items={income} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4 text-muted-foreground" /> {t("invoices")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noInvoices")}</p>
          ) : (
            <InvoicesTable items={invoices} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="size-4 text-muted-foreground" /> {t("expenses")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noExpenses")}</p>
          ) : (
            <ExpensesTable items={expenses} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="size-4 text-muted-foreground" /> {t("payroll")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payroll.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noPayroll")}</p>
          ) : (
            <PayrollTable items={payroll} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="size-4 text-muted-foreground" /> {t("byJob")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobSummaries.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noJobData")}</p>
          ) : (
            <JobSummaryTable items={jobSummaries} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "success" | "destructive";
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {icon} {label}
        </div>
        <p className={`font-mono text-xl font-semibold ${tone === "success" ? "text-success" : "text-destructive"}`}>
          ${value.toFixed(2)}
        </p>
      </CardContent>
    </Card>
  );
}

function IncomeTable({ items }: { items: IncomeItem[] }) {
  const format = useFormatter();
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/owner/jobs/${item.job_id}/invoices/${item.id}`}
          className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0 hover:bg-accent"
        >
          <div>
            <span className="font-mono font-medium">{item.invoice_number}</span>
            <span className="ml-2 text-muted-foreground">{item.client_name}</span>
            <p className="text-xs text-muted-foreground">
              {item.job_code} · {format.dateTime(new Date(item.paid_at), { dateStyle: "medium" })}
            </p>
          </div>
          <span className="font-mono font-medium text-success">${item.total.toFixed(2)}</span>
        </Link>
      ))}
    </div>
  );
}

function InvoicesTable({ items }: { items: InvoiceSummaryItem[] }) {
  const format = useFormatter();
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/owner/jobs/${item.job_id}/invoices/${item.id}`}
          className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0 hover:bg-accent"
        >
          <div>
            <span className="font-mono font-medium">{item.invoice_number}</span>
            <span className="ml-2 text-muted-foreground">{item.client_name}</span>
            <p className="text-xs text-muted-foreground">
              {item.job_code} · {format.dateTime(new Date(item.created_at), { dateStyle: "medium" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-muted-foreground">${item.total.toFixed(2)}</span>
            <InvoiceStatusBadge status={item.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}

function ExpensesTable({ items }: { items: ExpenseItem[] }) {
  const format = useFormatter();
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/owner/jobs/${item.job_id}`}
          className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0 hover:bg-accent"
        >
          <div>
            <span className="font-medium">{item.description}</span>
            <p className="text-xs text-muted-foreground">
              {item.job_code} · {format.dateTime(new Date(item.created_at), { dateStyle: "medium" })}
            </p>
          </div>
          <span className="font-mono font-medium">${item.amount.toFixed(2)}</span>
        </Link>
      ))}
    </div>
  );
}

function PayrollTable({ items }: { items: PayrollItem[] }) {
  const format = useFormatter();
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/owner/employees/${item.employee_id}`}
          className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0 hover:bg-accent"
        >
          <div>
            <span className="font-mono font-medium">{item.receipt_number}</span>
            <span className="ml-2 text-muted-foreground">{item.employee_name}</span>
            <p className="text-xs text-muted-foreground">
              {format.dateTime(new Date(`${item.week_start_date}T00:00:00`), { dateStyle: "medium" })} –{" "}
              {format.dateTime(new Date(`${item.week_end_date}T00:00:00`), { dateStyle: "medium" })}
            </p>
          </div>
          <span className="font-mono font-medium">${item.gross_pay.toFixed(2)}</span>
        </Link>
      ))}
    </div>
  );
}

function JobSummaryTable({ items }: { items: JobFinancialSummary[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <Link
          key={item.job_id}
          href={`/owner/jobs/${item.job_id}`}
          className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0 hover:bg-accent"
        >
          <span className="font-mono font-medium">{item.job_code}</span>
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="text-success">+${item.income.toFixed(2)}</span>
            <span className="text-destructive">-${item.expenses.toFixed(2)}</span>
            <span className={`font-semibold ${item.net >= 0 ? "text-success" : "text-destructive"}`}>
              ${item.net.toFixed(2)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
