"use client";

import * as React from "react";
import { Plus, Briefcase } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/auth-provider";
import { listJobsForOwner } from "@/lib/jobs/queries";
import type { JobListItem, JobStatus } from "@/lib/jobs/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JobsSearchBar } from "@/components/owner/jobs/jobs-search-bar";
import { JobListRow } from "@/components/jobs/job-list-row";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

const VALID_STATUSES: JobStatus[] = ["scheduled", "in_progress", "completed", "cancelled"];

function OwnerJobsPageInner() {
  const t = useTranslations("jobs.list");
  const { profile } = useAuth();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "all";
  const validStatus: JobStatus | "all" = VALID_STATUSES.includes(status as JobStatus)
    ? (status as JobStatus)
    : "all";

  const [jobs, setJobs] = React.useState<JobListItem[] | null>(null);

  React.useEffect(() => {
    if (!profile?.company_id) return;
    listJobsForOwner(profile.company_id, { q, status: validStatus }).then(setJobs);
  }, [profile?.company_id, q, validStatus]);

  if (!jobs) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/owner/jobs/new">
            <Plus /> {t("newJob")}
          </Link>
        </Button>
      </div>

      <JobsSearchBar initialQuery={q} initialStatus={validStatus} />

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Briefcase className="size-8 text-muted-foreground" />
            <p className="font-medium">{t("emptyTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("emptyDescription")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {jobs.map((job) => (
            <JobListRow key={job.id} job={job} hrefBase="/owner/jobs/view" />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OwnerJobsPage() {
  return (
    <React.Suspense fallback={<PageLoadingSkeleton />}>
      <OwnerJobsPageInner />
    </React.Suspense>
  );
}
