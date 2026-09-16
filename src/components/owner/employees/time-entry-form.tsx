"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2, Plus } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { logTimeEntry } from "@/lib/hours-pay/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TimeEntryForm({ employeeId, locale }: { employeeId: string; locale: Locale }) {
  const t = useTranslations("owner.employees.detail");
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(false);
    const formData = new FormData(e.currentTarget);
    const result = await logTimeEntry(locale, employeeId, formData);
    setPending(false);
    if (result.success) {
      formRef.current?.reset();
      router.refresh();
    } else {
      setError(true);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="work_date">{t("workDate")}</Label>
        <Input id="work_date" name="work_date" type="date" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="hours">{t("hours")}</Label>
        <Input id="hours" name="hours" type="number" min="0.01" max="24" step="0.01" required />
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="notes">{t("notes")}</Label>
        <div className="flex gap-2">
          <Textarea id="notes" name="notes" rows={1} className="min-h-9" />
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Plus />}
            {t("logHours")}
          </Button>
        </div>
      </div>
      {error ? (
        <p className="text-sm text-destructive sm:col-span-4">{t("error")}</p>
      ) : null}
    </form>
  );
}
