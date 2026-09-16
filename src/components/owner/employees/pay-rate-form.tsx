"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { setPayRate } from "@/lib/hours-pay/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PayRateForm({
  employeeId,
  currentRate,
}: {
  employeeId: string;
  currentRate: number | null;
}) {
  const t = useTranslations("owner.employees.detail");
  const [value, setValue] = React.useState(currentRate?.toString() ?? "");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(false);
    const result = await setPayRate(employeeId, Number(value));
    setPending(false);
    if (result.success) window.location.reload();
    else setError(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="hourly_rate">{t("payRateLabel")}</Label>
          <Input
            id="hourly_rate"
            type="number"
            min="0"
            max="10000"
            step="0.01"
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          {t("payRateSave")}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{t("error")}</p> : null}
    </form>
  );
}
