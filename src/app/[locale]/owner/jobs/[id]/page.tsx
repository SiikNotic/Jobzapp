import { Building2, Pencil, User } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { Link, redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getJobDetail, listEmployees } from "@/lib/jobs/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobPriorityBadge } from "@/components/jobs/job-priority-badge";
import { MaterialsList } from "@/components/jobs/materials-list";
import { JobStatusHistory } from "@/components/jobs/job-status-history";
import { JobStatusControl } from "@/components/owner/jobs/job-status-control";
import { EmployeeAssignmentManager } from "@/components/owner/jobs/employee-assignment-manager";

export default async function OwnerJobDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = (await params) as { locale: Locale; id: string };
  const t = await getTranslations({ locale, namespace: "jobs.detail" });

  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) {
    redirect({ href: "/login", locale });
    return null;
  }

  const job = await getJobDetail(id);
  if (!job || job.company_id !== profile.company_id) {
    notFound();
  }

  const employees = await listEmployees(profile.company_id);

  const addressLines = [
    job.address_line1,
    job.address_line2,
    [job.city, job.state_province, job.postal_code].filter(Boolean).join(", "),
    job.country,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-mono text-2xl font-semibold tracking-tight">{job.job_code}</h1>
            <JobPriorityBadge priority={job.priority} />
          </div>
          {job.client ? (
            <Link
              href={`/owner/clients/${job.client.id}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              {job.client.type === "company" ? (
                <Building2 className="size-3.5" />
              ) : (
                <User className="size-3.5" />
              )}
              {job.client.display_name}
            </Link>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <JobStatusControl jobId={job.id} status={job.status} locale={locale} />
          <Button asChild variant="outline">
            <Link href={`/owner/jobs/${job.id}/edit`}>
              <Pencil /> {t("edit")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("schedule")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>
              {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
                new Date(`${job.scheduled_date}T00:00:00`)
              )}
            </p>
            {job.scheduled_time ? <p>{job.scheduled_time.slice(0, 5)}</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("address")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {addressLines.length > 0 ? (
              addressLines.map((line) => <p key={line}>{line}</p>)
            ) : (
              <p className="text-muted-foreground">{t("noData")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {job.description ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("description")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">{job.description}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("materials")}</CardTitle>
        </CardHeader>
        <CardContent>
          <MaterialsList materials={job.materials} />
        </CardContent>
      </Card>

      {job.additional_info ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("additionalInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">{job.additional_info}</CardContent>
        </Card>
      ) : null}

      {job.contract_template_name ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("contract")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{job.contract_template_name}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("assignedEmployees")}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeAssignmentManager
            jobId={job.id}
            employees={employees}
            assignedIds={job.assignees.map((a) => a.id)}
            locale={locale}
          />
        </CardContent>
      </Card>

      <JobStatusHistory events={job.status_events} />
    </div>
  );
}
