"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2, Trash2 } from "lucide-react";

import type { TimeEntryWithJob } from "@/lib/hours-pay/types";
import { deleteTimeEntry } from "@/lib/hours-pay/actions";

export function TimeEntryRow({
  entry,
  dateLabel,
}: {
  entry: TimeEntryWithJob;
  dateLabel: string;
}) {
  const t = useTranslations("common");
  const [pending, setPending] = React.useState(false);

  async function handleDelete() {
    setPending(true);
    const result = await deleteTimeEntry(entry.id);
    if (result.success) window.location.reload();
    else setPending(false);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b py-1.5 text-sm last:border-0">
      <span>
        {dateLabel}
        {entry.job_code ? (
          <span className="ml-2 font-mono text-xs text-muted-foreground">{entry.job_code}</span>
        ) : null}
        {entry.notes ? <span className="ml-2 text-muted-foreground">{entry.notes}</span> : null}
      </span>
      <span className="flex items-center gap-3">
        <span className="font-medium">{entry.hours.toFixed(2)}</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="text-muted-foreground hover:text-destructive disabled:opacity-50"
          aria-label={t("delete")}
        >
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
        </button>
      </span>
    </div>
  );
}
