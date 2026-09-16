import {
  AlertCircle,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  PieChart as PieChartIcon,
  Receipt,
  TrendingUp,
  UserSquare2,
  Wallet,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { Link, redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getDashboardData, getMonthlyTrend } from "@/lib/dashboard/queries";
import { listPendingExpenseRequestsForCompany } from "@/lib/expense-requests/queries";
import { listRecentAuditEvents } from "@/lib/audit/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalSearch } from "@/components/owner/dashboard/global-search";
import { StatTile } from "@/components/owner/dashboard/stat-tile";
import { AuditEventRow } from "@/components/owner/dashboard/audit-event-row";
import { FinanceStatCard } from "@/components/owner/dashboard/finance-stat-card";
import { DonutChart } from "@/components/charts/donut-chart";
import { ChartLegend } from "@/components/charts/chart-legend";
import { MonthlyTrendChart } from "@/components/charts/monthly-trend-chart";

export default async function OwnerDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const { user, profile } = await getCurrentProfile();
  const t = await getTranslations({ locale, namespace: "owner.dashboard" });

  if (!profile?.company_id) {
    redirect({ href: "/login", locale });
    return null;
  }

  const [data, pendingRequests, recentActivity, monthlyTrend] = await Promise.all([
    getDashboardData(profile.company_id),
    listPendingExpenseRequestsForCompany(profile.company_id, 5),
    listRecentAuditEvents(profile.company_id, 8),
    getMonthlyTrend(profile.company_id, 6),
  ]);

  const name = profile.full_name ?? user?.email ?? "";
  const monthFormat = new Intl.DateTimeFormat(locale, { month: "short" });
  const monthLabel = (key: string) => monthFormat.format(new Date(`${key}-01T00:00:00`));

  const incomeTrend = monthlyTrend.map((p) => ({ label: monthLabel(p.month), value: p.income }));
  const expensesTrend = monthlyTrend.map((p) => ({ label: monthLabel(p.month), value: p.expenses }));
  const netTrend = monthlyTrend.map((p) => ({ label: monthLabel(p.month), value: p.income - p.expenses }));
  const netThisMonth = netTrend.length > 0 ? netTrend[netTrend.length - 1].value : 0;

  const totalJobs = data.jobs.scheduled + data.jobs.inProgress + data.jobs.completed + data.jobs.cancelled;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("welcome", { name })}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <GlobalSearch />

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">{t("sections.jobs")}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile icon={<Clock className="size-4" />} label={t("jobsPending")} value={data.jobs.pending} href="/owner/jobs" />
          <StatTile
            icon={<CalendarClock className="size-4" />}
            label={t("jobsScheduled")}
            value={data.jobs.scheduled}
            href="/owner/jobs?status=scheduled"
          />
          <StatTile
            icon={<Briefcase className="size-4" />}
            label={t("jobsInProgress")}
            value={data.jobs.inProgress}
            href="/owner/jobs?status=in_progress"
          />
          <StatTile
            icon={<CheckCircle2 className="size-4" />}
            label={t("jobsCompleted")}
            value={data.jobs.completed}
            href="/owner/jobs?status=completed"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">{t("sections.finance")}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <FinanceStatCard
            icon={<TrendingUp className="size-4" />}
            label={t("incomeThisMonth")}
            value={`$${data.incomeThisMonth.toFixed(2)}`}
            trend={incomeTrend}
            color="teal"
            valueTone="success"
          />
          <FinanceStatCard
            icon={<Receipt className="size-4" />}
            label={t("expensesThisMonth")}
            value={`$${data.expensesThisMonth.toFixed(2)}`}
            trend={expensesTrend}
            color="magenta"
            valueTone="destructive"
          />
          <FinanceStatCard
            icon={<Wallet className="size-4" />}
            label={t("netThisMonth")}
            value={`$${netThisMonth.toFixed(2)}`}
            trend={netTrend}
            color={netThisMonth >= 0 ? "green" : "orange"}
            valueTone={netThisMonth >= 0 ? "success" : "destructive"}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChartIcon className="size-4 text-muted-foreground" /> {t("jobStatusTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <DonutChart
              centerValue={totalJobs}
              centerLabel={t("jobsTotal")}
              emptyLabel={t("jobStatusEmpty")}
              segments={[
                { key: "scheduled", label: t("jobsScheduled"), value: data.jobs.scheduled, color: "teal" },
                { key: "in_progress", label: t("jobsInProgress"), value: data.jobs.inProgress, color: "yellow" },
                { key: "completed", label: t("jobsCompleted"), value: data.jobs.completed, color: "green" },
                { key: "cancelled", label: t("jobsCancelled"), value: data.jobs.cancelled, color: "magenta" },
              ]}
            />
            <ChartLegend
              items={[
                { key: "scheduled", label: t("jobsScheduled"), value: data.jobs.scheduled, color: "teal" },
                { key: "in_progress", label: t("jobsInProgress"), value: data.jobs.inProgress, color: "yellow" },
                { key: "completed", label: t("jobsCompleted"), value: data.jobs.completed, color: "green" },
                { key: "cancelled", label: t("jobsCancelled"), value: data.jobs.cancelled, color: "magenta" },
              ]}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">{t("recentActivity")}</CardTitle>
            <Link href="/owner/dashboard/activity" className="text-sm text-primary hover:underline">
              {t("viewAll")}
            </Link>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("activityEmpty")}</p>
            ) : (
              <div className="flex flex-col">
                {recentActivity.map((event) => (
                  <AuditEventRow key={event.id} event={event} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("trendTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyTrendChart data={incomeTrend.map((p, i) => ({ month: p.label, income: p.value, expenses: expensesTrend[i].value }))} incomeLabel={t("incomeThisMonth")} expensesLabel={t("expensesThisMonth")} />
        </CardContent>
      </Card>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">{t("sections.business")}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile icon={<FileText className="size-4" />} label={t("quotesPending")} value={data.pendingQuotes} />
          <StatTile icon={<Receipt className="size-4" />} label={t("invoicesPending")} value={data.pendingInvoices} />
          <StatTile
            icon={<AlertCircle className="size-4" />}
            label={t("expenseRequestsPending")}
            value={data.pendingExpenseRequests}
            tone={data.pendingExpenseRequests > 0 ? "warning" : "default"}
          />
          <StatTile
            icon={<UserSquare2 className="size-4" />}
            label={t("employees")}
            value={data.employeeCount}
            href="/owner/employees"
          />
        </div>
      </div>

      {pendingRequests.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" /> {t("actionNeeded")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {pendingRequests.map((request) => (
              <Link
                key={request.id}
                href={`/owner/jobs/${request.job_id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm hover:bg-accent"
              >
                <div>
                  <span className="font-medium">{request.material_name}</span>
                  <p className="text-xs text-muted-foreground">
                    {request.job_code} · {request.requested_by_name ?? "—"}
                  </p>
                </div>
                <span className="font-mono font-medium">${request.estimated_cost.toFixed(2)}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
