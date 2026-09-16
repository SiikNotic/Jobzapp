import { AlertTriangle, Banknote, FileDown, Receipt, TrendingUp, Users, Wallet } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { useFormatter } from "next-intl";

import type { Locale } from "@/i18n/routing";
import { redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { TAX_FORMS_BY_COUNTRY } from "@/lib/company/tax-jurisdiction";
import { buildTaxReport } from "@/lib/taxes/queries";
import { resolvePeriod, currentYearPeriod } from "@/lib/finances/period";
import type { TaxReportData } from "@/lib/taxes/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PeriodFilter } from "@/components/owner/finances/period-filter";
import { TaxReportExport } from "@/components/owner/taxes/tax-report-export";

export default async function TaxesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const { from, to } = await searchParams;
  const t = await getTranslations({ locale, namespace: "owner.taxes" });

  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) {
    redirect({ href: "/login", locale });
    return null;
  }

  const period = resolvePeriod({ from, to }) ?? currentYearPeriod();
  const report = await buildTaxReport(profile.company_id, period);

  const forms = TAX_FORMS_BY_COUNTRY[report.company.country];
  const jurisdictionLabel = report.company.country === "PR" ? t("jurisdictionPR") : t("jurisdictionUS");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        <AlertTriangle className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-medium">{t("disclaimerTitle")}</p>
          <p className="text-sm">{t("disclaimerBody")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{jurisdictionLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">{t("preview", { jurisdiction: jurisdictionLabel })}</p>
          <div className="flex flex-wrap gap-2">
            {forms.map((form) => (
              <Badge key={form} variant="outline">
                {form}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <PeriodFilter initialFrom={period.from} initialTo={period.to} allowAllTime={false} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileDown className="size-4 text-muted-foreground" /> {t("export.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{t("export.description")}</p>
          <TaxReportExport report={report} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4 text-muted-foreground" /> {t("income.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {report.income.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("income.empty")}</p>
          ) : (
            <IncomeList report={report} />
          )}
          <TotalRow label={t("income.total")} value={report.totalIncome} tone="success" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="size-4 text-muted-foreground" /> {t("expenses.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {report.expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("expenses.empty")}</p>
          ) : (
            <ExpensesList report={report} />
          )}
          <TotalRow label={t("expenses.total")} value={report.totalExpenses} tone="destructive" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="size-4 text-muted-foreground" /> {t("payroll.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {report.payroll.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("payroll.empty")}</p>
          ) : (
            <PayrollList report={report} />
          )}
          <TotalRow label={t("payroll.total")} value={report.totalPayroll} tone="destructive" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Banknote className="size-4 text-muted-foreground" /> {t("withholding.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("withholding.note")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4 text-muted-foreground" /> {t("employees.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {report.employees.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("employees.empty")}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {report.employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm"
                >
                  <span className="font-medium">{employee.full_name ?? "—"}</span>
                  <div className="flex items-center gap-4 font-mono text-xs">
                    <span className="text-muted-foreground">
                      {t("employees.hourlyRate")}:{" "}
                      {employee.hourly_rate != null ? `$${employee.hourly_rate.toFixed(2)}` : t("employees.hourlyRateNotSet")}
                    </span>
                    <span className="font-semibold">
                      {t("employees.totalPaid")}: ${employee.total_paid.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">{t("employees.note")}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function TotalRow({ label, value, tone }: { label: string; value: number; tone: "success" | "destructive" }) {
  return (
    <div className="mt-2 flex items-center justify-between border-t pt-2 text-sm font-semibold">
      <span>{label}</span>
      <span className={tone === "success" ? "text-success" : "text-destructive"}>${value.toFixed(2)}</span>
    </div>
  );
}

function IncomeList({ report }: { report: TaxReportData }) {
  const format = useFormatter();
  return (
    <div className="flex flex-col gap-2">
      {report.income.map((item) => (
        <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0">
          <div>
            <span className="font-mono font-medium">{item.invoice_number}</span>
            <span className="ml-2 text-muted-foreground">{item.client_name}</span>
            <p className="text-xs text-muted-foreground">
              {item.job_code} · {format.dateTime(new Date(item.paid_at), { dateStyle: "medium" })}
            </p>
          </div>
          <span className="font-mono font-medium text-success">${item.total.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

function ExpensesList({ report }: { report: TaxReportData }) {
  const format = useFormatter();
  return (
    <div className="flex flex-col gap-2">
      {report.expenses.map((item) => (
        <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0">
          <div>
            <span className="font-medium">{item.description}</span>
            <p className="text-xs text-muted-foreground">
              {item.job_code} · {format.dateTime(new Date(item.created_at), { dateStyle: "medium" })}
            </p>
          </div>
          <span className="font-mono font-medium">${item.amount.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

function PayrollList({ report }: { report: TaxReportData }) {
  const format = useFormatter();
  return (
    <div className="flex flex-col gap-2">
      {report.payroll.map((item) => (
        <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0">
          <div>
            <span className="font-mono font-medium">{item.receipt_number}</span>
            <span className="ml-2 text-muted-foreground">{item.employee_name}</span>
            <p className="text-xs text-muted-foreground">
              {format.dateTime(new Date(`${item.week_start_date}T00:00:00`), { dateStyle: "medium" })} –{" "}
              {format.dateTime(new Date(`${item.week_end_date}T00:00:00`), { dateStyle: "medium" })}
            </p>
          </div>
          <span className="font-mono font-medium">${item.gross_pay.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}
