import { Plus, Briefcase } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link, redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { listJobsForOwner } from "@/lib/jobs/queries";
import type { JobStatus } from "@/lib/jobs/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JobsSearchBar } from "@/components/owner/jobs/jobs-search-bar";
import { JobListRow } from "@/components/jobs/job-list-row";

const VALID_STATUSES: JobStatus[] = ["scheduled", "in_progress", "completed", "cancelled"];

export default async function OwnerJobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const { q = "", status = "all" } = await searchParams;
  const t = await getTranslations({ locale, namespace: "jobs.list" });

  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) {
    redirect({ href: "/login", locale });
    return null;
  }

  const validStatus: JobStatus | "all" = VALID_STATUSES.includes(status as JobStatus)
    ? (status as JobStatus)
    : "all";

  const jobs = await listJobsForOwner(profile.company_id, { q, status: validStatus });

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
            <JobListRow key={job.id} job={job} hrefBase="/owner/jobs" />
          ))}
        </div>
      )}
    </div>
  );
}
