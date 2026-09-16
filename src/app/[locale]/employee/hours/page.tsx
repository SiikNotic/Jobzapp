import { Clock, DollarSign, FileCheck2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getCompanyById } from "@/lib/company/get-company";
import { buildWeekSummaries, getMyPayRate, listMyReceipts, listMyTimeEntries } from "@/lib/hours-pay/queries";
import { todayWeekStart } from "@/lib/hours-pay/weeks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReceiptDownloadButton } from "@/components/employee/receipt-download-button";

export default async function EmployeeHoursPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "hoursPay" });

  const { profile } = await getCurrentProfile();
  const [payRate, entries, receipts] = await Promise.all([
    getMyPayRate(),
    listMyTimeEntries(),
    listMyReceipts(),
  ]);

  const company = profile?.company_id ? await getCompanyById(profile.company_id) : null;
  const companyName = company?.trade_name || company?.name || "";
  const employeeName = profile?.full_name ?? "";

  const weeks = buildWeekSummaries(entries, receipts);
  const currentWeekStart = todayWeekStart();
  const currentWeek = weeks.find((w) => w.weekStart === currentWeekStart);
  const historyWeeks = weeks.filter((w) => w.weekStart !== currentWeekStart);

  const currentHours = currentWeek?.hours ?? 0;
  const estimatedPay = payRate ? currentHours * payRate.hourly_rate : null;

  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="size-4 text-muted-foreground" /> {t("currentWeek")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">{t("hoursWorked")}</p>
              <p className="text-2xl font-semibold">{currentHours.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("estimatedPay")}</p>
              {payRate ? (
                <p className="text-2xl font-semibold text-success">
                  ${estimatedPay!.toFixed(2)}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">{t("rateNotSet")}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("history")}</CardTitle>
        </CardHeader>
        <CardContent>
          {historyWeeks.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("historyEmpty")}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {historyWeeks.map((week) => (
                <details key={week.weekStart} className="group rounded-md border">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 p-3 text-sm marker:content-none">
                    <span className="font-medium">
                      {dateFormat.format(new Date(`${week.weekStart}T00:00:00`))} –{" "}
                      {dateFormat.format(new Date(`${week.weekEnd}T00:00:00`))}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {week.hours.toFixed(2)} {t("hoursWorked").toLowerCase()}
                      </span>
                      {week.receipt ? (
                        <Badge variant="success">{t("receiptIssued")}</Badge>
                      ) : (
                        <Badge variant="outline">{t("receiptPending")}</Badge>
                      )}
                    </span>
                  </summary>
                  <div className="flex flex-col gap-3 border-t p-3">
                    {week.entries.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t("entriesEmpty")}</p>
                    ) : (
                      <div className="flex flex-col gap-1 text-sm">
                        {week.entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex flex-wrap items-center justify-between gap-2 border-b py-1.5 last:border-0"
                          >
                            <span>
                              {dateFormat.format(new Date(`${entry.work_date}T00:00:00`))}
                              {entry.job_code ? (
                                <span className="ml-2 font-mono text-xs text-muted-foreground">
                                  {entry.job_code}
                                </span>
                              ) : null}
                            </span>
                            <span className="font-medium">{entry.hours.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {week.receipt ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/50 p-3">
                        <div className="text-sm">
                          <p className="font-medium">{week.receipt.receipt_number}</p>
                          <p className="text-muted-foreground">
                            ${week.receipt.gross_pay.toFixed(2)}
                          </p>
                        </div>
                        <ReceiptDownloadButton
                          receipt={week.receipt}
                          companyName={companyName}
                          employeeName={employeeName}
                          locale={locale}
                        />
                      </div>
                    ) : null}
                  </div>
                </details>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileCheck2 className="size-4 text-muted-foreground" /> {t("receipts")}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-medium text-success">
                      <DollarSign className="size-3.5" />
                      {receipt.gross_pay.toFixed(2)}
                    </span>
                    <ReceiptDownloadButton
                      receipt={receipt}
                      companyName={companyName}
                      employeeName={employeeName}
                      locale={locale}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
