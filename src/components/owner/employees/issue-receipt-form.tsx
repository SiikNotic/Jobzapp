"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2, Receipt } from "lucide-react";

import type { Locale } from "@/i18n/routing";
import { issueReceipt, previewUnbilledHours } from "@/lib/hours-pay/actions";
import { getWeekEnd, getWeekStart, todayWeekStart } from "@/lib/hours-pay/weeks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ERROR_KEYS: Record<string, string> = {
  no_pay_rate: "errorNoPayRate",
  no_hours: "errorNoHours",
  already_issued: "errorAlreadyIssued",
};

export function IssueReceiptForm({
  employeeId,
  initialUnbilledHours,
  locale,
}: {
  employeeId: string;
  initialUnbilledHours: number;
  locale: Locale;
}) {
  const t = useTranslations("owner.employees.detail");
  const [dateValue, setDateValue] = React.useState(todayWeekStart());
  const [unbilledHours, setUnbilledHours] = React.useState(initialUnbilledHours);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const weekStart = getWeekStart(dateValue);
  const weekEnd = getWeekEnd(weekStart);
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  async function handleDateChange(value: string) {
    setDateValue(value);
    if (!value) return;
    const hours = await previewUnbilledHours(employeeId, getWeekStart(value));
    setUnbilledHours(hours);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await issueReceipt(employeeId, weekStart);
    setPending(false);
    if (result.success) {
      window.location.reload();
    } else {
      setError(ERROR_KEYS[result.error] ?? "error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="week_pick">{t("weekStartLabel")}</Label>
          <Input
            id="week_pick"
            type="date"
            value={dateValue}
            onChange={(e) => handleDateChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {dateFormat.format(new Date(`${weekStart}T00:00:00`))} –{" "}
            {dateFormat.format(new Date(`${weekEnd}T00:00:00`))}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("unbilledHours")}</p>
          <p className="text-lg font-semibold">{unbilledHours.toFixed(2)}</p>
        </div>
        <Button type="submit" disabled={pending || unbilledHours <= 0}>
          {pending ? <Loader2 className="animate-spin" /> : <Receipt />}
          {t("issueReceipt")}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{t(error)}</p> : null}
    </form>
  );
}
