"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, PlayCircle } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { JobStatus } from "@/lib/jobs/types";
import { Button } from "@/components/ui/button";
import { changeJobStatus } from "@/lib/jobs/status-actions";

export function EmployeeJobStatusActions({
  jobId,
  status,
  locale,
}: {
  jobId: string;
  status: JobStatus;
  locale: Locale;
}) {
  const t = useTranslations("jobs.employeeActions");
  const router = useRouter();
  const [pending, setPending] = React.useState<JobStatus | null>(null);
  const [error, setError] = React.useState(false);

  async function handleChange(next: JobStatus) {
    setPending(next);
    setError(false);
    const result = await changeJobStatus(locale, jobId, next);
    setPending(null);
    if (result.success) {
      router.refresh();
    } else {
      setError(true);
    }
  }

  if (status === "completed" || status === "cancelled") return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {status === "scheduled" ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => handleChange("in_progress")}
            disabled={pending !== null}
          >
            {pending === "in_progress" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <PlayCircle />
            )}
            {t("start")}
          </Button>
        ) : null}
        <Button
          type="button"
          onClick={() => handleChange("completed")}
          disabled={pending !== null}
        >
          {pending === "completed" ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
          {t("complete")}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{t("error")}</p> : null}
    </div>
  );
}
