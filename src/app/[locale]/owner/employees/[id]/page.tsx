import { Clock, DollarSign, Receipt } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import type { Locale } from "@/i18n/routing";
import { redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import {
  getEmployeePayRate,
  getUnbilledHoursForWeek,
  listReceiptsForEmployee,
  listTimeEntriesForEmployee,
} from "@/lib/hours-pay/owner-queries";
import { todayWeekStart } from "@/lib/hours-pay/weeks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PayRateForm } from "@/components/owner/employees/pay-rate-form";
import { TimeEntryForm } from "@/components/owner/employees/time-entry-form";
import { IssueReceiptForm } from "@/components/owner/employees/issue-receipt-form";
import { TimeEntryRow } from "@/components/owner/employees/time-entry-row";

export default async function EmployeeHoursPayPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = (await params) as { locale: Locale; id: string };
  const t = await getTranslations({ locale, namespace: "owner.employees.detail" });

  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) {
    redirect({ href: "/login", locale });
    return null;
  }

  const supabase = await createSupabaseClient();
  const { data: employee } = await supabase
    .from("profiles")
    .select("id, full_name, company_id, role")
    .eq("id", id)
    .single();

  if (!employee || employee.company_id !== profile.company_id || employee.role !== "employee") {
    notFound();
  }

  const [payRate, timeEntries, receipts, unbilledHours] = await Promise.all([
    getEmployeePayRate(id),
    listTimeEntriesForEmployee(id),
    listReceiptsForEmployee(id),
    getUnbilledHoursForWeek(id, todayWeekStart()),
  ]);

  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {employee.full_name ?? t("unnamedEmployee")}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="size-4 text-muted-foreground" /> {t("payRateTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            {t("payRateCurrent")}:{" "}
            <span className="font-medium text-foreground">
              {payRate ? `$${payRate.hourly_rate.toFixed(2)}` : t("payRateNotSet")}
            </span>
          </p>
          <PayRateForm employeeId={id} currentRate={payRate?.hourly_rate ?? null} locale={locale} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="size-4 text-muted-foreground" /> {t("timeEntriesTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TimeEntryForm employeeId={id} locale={locale} />

          <div>
            <p className="mb-2 text-sm font-medium">{t("recentEntriesTitle")}</p>
            {timeEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("entriesEmpty")}</p>
            ) : (
              <div className="flex flex-col gap-1">
                {timeEntries.map((entry) => (
                  <TimeEntryRow
                    key={entry.id}
                    entry={entry}
                    employeeId={id}
                    locale={locale}
                    dateLabel={dateFormat.format(new Date(`${entry.work_date}T00:00:00`))}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="size-4 text-muted-foreground" /> {t("receiptsTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <IssueReceiptForm employeeId={id} initialUnbilledHours={unbilledHours} locale={locale} />

          {receipts.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("receiptsEmpty")}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {receipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{receipt.receipt_number}</p>
                    <p className="text-muted-foreground">
                      {dateFormat.format(new Date(`${receipt.week_start_date}T00:00:00`))} –{" "}
                      {dateFormat.format(new Date(`${receipt.week_end_date}T00:00:00`))}
                    </p>
                  </div>
                  <span className="font-medium">${receipt.gross_pay.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
