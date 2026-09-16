"use client";

import * as React from "react";
import { Clock, DollarSign, Receipt } from "lucide-react";
import { useTranslations } from "next-intl";
import { notFound, useParams, useSearchParams } from "next/navigation";

import type { Locale } from "@/i18n/routing";
import { useAuth } from "@/lib/auth/auth-provider";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import {
  getEmployeePayRate,
  getUnbilledHoursForWeek,
  listReceiptsForEmployee,
  listTimeEntriesForEmployee,
} from "@/lib/hours-pay/owner-queries";
import type { PayRate, PayReceipt, TimeEntryWithJob } from "@/lib/hours-pay/types";
import { todayWeekStart } from "@/lib/hours-pay/weeks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PayRateForm } from "@/components/owner/employees/pay-rate-form";
import { TimeEntryForm } from "@/components/owner/employees/time-entry-form";
import { IssueReceiptForm } from "@/components/owner/employees/issue-receipt-form";
import { TimeEntryRow } from "@/components/owner/employees/time-entry-row";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

type EmployeeRow = { id: string; full_name: string | null; company_id: string; role: string };

function EmployeeHoursPayPageInner() {
  const { locale } = useParams<{ locale: Locale }>();
  const id = useSearchParams().get("id");
  const t = useTranslations("owner.employees.detail");
  const { profile } = useAuth();

  const [state, setState] = React.useState<
    | {
        employee: EmployeeRow;
        payRate: PayRate | null;
        timeEntries: TimeEntryWithJob[];
        receipts: PayReceipt[];
        unbilledHours: number;
      }
    | null
    | undefined
  >(undefined);

  React.useEffect(() => {
    if (!profile?.company_id || !id) return;
    const companyId = profile.company_id;

    const supabase = createSupabaseClient();
    supabase
      .from("profiles")
      .select("id, full_name, company_id, role")
      .eq("id", id)
      .single()
      .then(async ({ data: employee }) => {
        if (!employee || employee.company_id !== companyId || employee.role !== "employee") {
          setState(null);
          return;
        }

        const [payRate, timeEntries, receipts, unbilledHours] = await Promise.all([
          getEmployeePayRate(id),
          listTimeEntriesForEmployee(id),
          listReceiptsForEmployee(id),
          getUnbilledHoursForWeek(id, todayWeekStart()),
        ]);

        setState({ employee, payRate, timeEntries, receipts, unbilledHours });
      });
  }, [profile?.company_id, id]);

  if (state === null) {
    notFound();
  }

  if (state === undefined) {
    return <PageLoadingSkeleton />;
  }

  const { employee, payRate, timeEntries, receipts, unbilledHours } = state;
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
          <PayRateForm employeeId={employee.id} currentRate={payRate?.hourly_rate ?? null} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="size-4 text-muted-foreground" /> {t("timeEntriesTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TimeEntryForm employeeId={employee.id} />

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
          <IssueReceiptForm employeeId={employee.id} initialUnbilledHours={unbilledHours} locale={locale} />

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

export default function EmployeeHoursPayPage() {
  return (
    <React.Suspense fallback={<PageLoadingSkeleton />}>
      <EmployeeHoursPayPageInner />
    </React.Suspense>
  );
}
