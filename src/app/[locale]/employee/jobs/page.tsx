import { Briefcase } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { listJobsForEmployee } from "@/lib/jobs/queries";
import type { JobStatus } from "@/lib/jobs/types";
import { Card, CardContent } from "@/components/ui/card";
import { JobListRow } from "@/components/jobs/job-list-row";

const VALID_STATUSES: JobStatus[] = ["scheduled", "in_progress", "completed", "cancelled"];

export default async function EmployeeJobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const { status = "all" } = await searchParams;
  const t = await getTranslations({ locale, namespace: "jobs.list" });

  const validStatus: JobStatus | "all" = VALID_STATUSES.includes(status as JobStatus)
    ? (status as JobStatus)
    : "all";

  const jobs = await listJobsForEmployee({ status: validStatus });

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
            <JobListRow key={job.id} job={job} hrefBase="/employee/jobs" />
          ))}
        </div>
      )}
    </div>
  );
}
