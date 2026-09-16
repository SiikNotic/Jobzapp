import { Building2, User } from "lucide-react";
import { useFormatter } from "next-intl";

import { Link } from "@/i18n/navigation";
import { JobStatusBadge } from "@/components/jobs/job-status-badge";
import { JobPriorityBadge } from "@/components/jobs/job-priority-badge";
import type { JobListItem } from "@/lib/jobs/types";

export function JobListRow({ job, hrefBase }: { job: JobListItem; hrefBase: string }) {
  const format = useFormatter();

  return (
    <Link
      href={`${hrefBase}?id=${job.id}`}
      className="flex flex-col gap-2 rounded-lg border bg-card p-4 transition-colors hover:bg-accent sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold">{job.job_code}</span>
          <JobStatusBadge status={job.status} />
          <JobPriorityBadge priority={job.priority} />
        </div>
        {job.client ? (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {job.client.type === "company" ? (
              <Building2 className="size-3.5" />
            ) : (
              <User className="size-3.5" />
            )}
            {job.client.display_name}
          </div>
        ) : null}
      </div>
      <div className="text-sm text-muted-foreground sm:text-right">
        {format.dateTime(new Date(`${job.scheduled_date}T00:00:00`), { dateStyle: "medium" })}
        {job.scheduled_time ? ` · ${job.scheduled_time.slice(0, 5)}` : ""}
      </div>
    </Link>
  );
}
