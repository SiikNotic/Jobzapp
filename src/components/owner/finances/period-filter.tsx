"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CalendarRange } from "lucide-react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { currentMonthPeriod, currentYearPeriod } from "@/lib/finances/period";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PeriodFilter({
  initialFrom,
  initialTo,
  allowAllTime = true,
}: {
  initialFrom?: string;
  initialTo?: string;
  allowAllTime?: boolean;
}) {
  const t = useTranslations("period");
  const router = useRouter();
  const pathname = usePathname();
  const [from, setFrom] = React.useState(initialFrom ?? "");
  const [to, setTo] = React.useState(initialTo ?? "");

  function navigate(nextFrom: string, nextTo: string) {
    const params = new URLSearchParams();
    if (nextFrom) params.set("from", nextFrom);
    if (nextTo) params.set("to", nextTo);
    const search = params.toString();
    router.replace(`${pathname}${search ? `?${search}` : ""}`);
  }

  function applyPreset(period: { from: string; to: string }) {
    setFrom(period.from);
    setTo(period.to);
    navigate(period.from, period.to);
  }

  function clearFilter() {
    setFrom("");
    setTo("");
    navigate("", "");
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-end sm:flex-wrap">
      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <CalendarRange className="size-4" /> {t("label")}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => applyPreset(currentMonthPeriod())}>
          {t("thisMonth")}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => applyPreset(currentYearPeriod())}>
          {t("thisYear")}
        </Button>
        {allowAllTime ? (
          <Button type="button" size="sm" variant="outline" onClick={clearFilter}>
            {t("allTime")}
          </Button>
        ) : null}
      </div>
      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">{t("from")}</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">{t("to")}</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => navigate(from, to)}
          disabled={!from || !to}
        >
          {t("apply")}
        </Button>
      </div>
    </div>
  );
}
