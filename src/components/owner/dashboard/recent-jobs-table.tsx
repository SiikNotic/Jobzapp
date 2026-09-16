import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { JobStatusBadge } from "@/components/jobs/job-status-badge";
import { JobPriorityBadge } from "@/components/jobs/job-priority-badge";
import type { RecentJobItem } from "@/lib/dashboard/types";

function initials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function RecentJobsTable({
  jobs,
  employeeLabel,
  unassignedLabel,
}: {
  jobs: RecentJobItem[];
  employeeLabel: string;
  unassignedLabel: string;
}) {
  return (
    <div className="flex flex-col">
      {jobs.map((job) => (
        <Link
          key={job.id}
          href={`/owner/jobs/${job.id}`}
          className="flex items-center gap-3 border-b py-3 text-sm last:border-0 hover:bg-accent"
        >
          <Avatar className="size-8 shrink-0">
            <AvatarFallback>{initials(job.client_name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{job.client_name ?? job.job_code}</p>
            <p className="truncate text-xs text-muted-foreground">
              {job.employee_name ? `${employeeLabel}: ${job.employee_name}` : unassignedLabel}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <JobPriorityBadge priority={job.priority} />
            <JobStatusBadge status={job.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}
