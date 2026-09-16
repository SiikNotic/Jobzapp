"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import type { JobStatus } from "@/lib/jobs/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { changeJobStatus } from "@/lib/jobs/status-actions";

const STATUSES: JobStatus[] = ["scheduled", "in_progress", "completed", "cancelled"];

export function JobStatusControl({
  jobId,
  status,
}: {
  jobId: string;
  status: JobStatus;
}) {
  const t = useTranslations("jobs.status");
  const [pending, setPending] = React.useState(false);

  async function handleChange(value: string) {
    setPending(true);
    const result = await changeJobStatus(jobId, value as JobStatus);
    setPending(false);
    if (result.success) window.location.reload();
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={handleChange} disabled={pending}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((value) => (
            <SelectItem key={value} value={value}>
              {t(value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {pending ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : null}
    </div>
  );
}
