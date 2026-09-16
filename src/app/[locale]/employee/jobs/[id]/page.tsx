import { Building2, FileText, Plus, Receipt, User } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getJobDetail } from "@/lib/jobs/queries";
import { listExpenseRequestsForJob } from "@/lib/expense-requests/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobPriorityBadge } from "@/components/jobs/job-priority-badge";
import { JobStatusBadge } from "@/components/jobs/job-status-badge";
import { MaterialsList } from "@/components/jobs/materials-list";
import { EmployeeJobStatusActions } from "@/components/employee/job-status-actions";
import { ExpenseRequestCard } from "@/components/expense-requests/expense-request-card";

export default async function EmployeeJobDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = (await params) as { locale: Locale; id: string };
  const t = await getTranslations({ locale, namespace: "jobs.detail" });
  const tExpenses = await getTranslations({ locale, namespace: "expenseRequests" });

  const job = await getJobDetail(id);
  if (!job) {
    notFound();
  }

  const expenseRequests = await listExpenseRequestsForJob(job.id);

  const addressLines = [
    job.address_line1,
    job.address_line2,
    [job.city, job.state_province, job.postal_code].filter(Boolean).join(", "),
    job.country,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-mono text-2xl font-semibold tracking-tight">{job.job_code}</h1>
          <JobStatusBadge status={job.status} />
          <JobPriorityBadge priority={job.priority} />
        </div>
      </div>

      <EmployeeJobStatusActions jobId={job.id} status={job.status} locale={locale} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("client")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            {job.client ? (
              <>
                <div className="flex items-center gap-1.5 font-medium">
                  {job.client.type === "company" ? (
                    <Building2 className="size-4 text-muted-foreground" />
                  ) : (
                    <User className="size-4 text-muted-foreground" />
                  )}
                  {job.client.display_name}
                </div>
                {job.client.phone ? <p>{job.client.phone}</p> : null}
                {job.client.email ? <p>{job.client.email}</p> : null}
              </>
            ) : (
              <p className="text-muted-foreground">{t("noData")}</p>
            )}
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="size-4 text-muted-foreground" /> {tExpenses("list.title")}
          </CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link href={`/employee/jobs/${job.id}/expenses/new`}>
              <Plus /> {tExpenses("list.newRequest")}
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {expenseRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">{tExpenses("list.empty")}</p>
          ) : (
            expenseRequests.map((request) => (
              <ExpenseRequestCard
                key={request.id}
                request={request}
                canReview={false}
                jobId={job.id}
                locale={locale}
              />
            ))
          )}
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4 text-muted-foreground" /> {t("documents")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {job.contract_template_name ?? (
            <p className="text-muted-foreground">{t("noDocuments")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
