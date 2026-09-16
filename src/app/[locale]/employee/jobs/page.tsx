"use client";

import * as React from "react";
import { Briefcase } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { listJobsForEmployee } from "@/lib/jobs/queries";
import type { JobListItem, JobStatus } from "@/lib/jobs/types";
import { Card, CardContent } from "@/components/ui/card";
import { JobListRow } from "@/components/jobs/job-list-row";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";
import { useAuth } from "@/lib/auth/auth-provider";

const VALID_STATUSES: JobStatus[] = ["scheduled", "in_progress", "completed", "cancelled"];

function EmployeeJobsPageInner() {
  const t = useTranslations("jobs.list");
  const { user } = useAuth();
  const status = useSearchParams().get("status") ?? "all";
  const validStatus: JobStatus | "all" = VALID_STATUSES.includes(status as JobStatus)
    ? (status as JobStatus)
    : "all";

  const [jobs, setJobs] = React.useState<JobListItem[] | null>(null);

  React.useEffect(() => {
    if (!user) return;
    listJobsForEmployee({ status: validStatus }).then(setJobs);
  }, [user, validStatus]);

  if (!jobs) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("myJobsTitle")}</h1>
        <p className="text-muted-foreground">{t("myJobsSubtitle")}</p>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Briefcase className="size-8 text-muted-foreground" />
            <p className="font-medium">{t("emptyEmployeeTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("emptyEmployeeDescription")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {jobs.map((job) => (
            <JobListRow key={job.id} job={job} hrefBase="/employee/jobs/view" />
          ))}
        </div>
      )}
    </div>
  );
}

export default function EmployeeJobsPage() {
  return (
    <React.Suspense fallback={<PageLoadingSkeleton />}>
      <EmployeeJobsPageInner />
    </React.Suspense>
  );
}
