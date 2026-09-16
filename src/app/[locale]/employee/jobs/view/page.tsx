"use client";

import * as React from "react";
import { Building2, FileText, Plus, Receipt, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { notFound, useSearchParams } from "next/navigation";

import { Link } from "@/i18n/navigation";
import { getJobDetail } from "@/lib/jobs/queries";
import type { JobDetail } from "@/lib/jobs/types";
import { listExpenseRequestsForJob } from "@/lib/expense-requests/queries";
import type { ExpenseRequestWithNames } from "@/lib/expense-requests/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobPriorityBadge } from "@/components/jobs/job-priority-badge";
import { JobStatusBadge } from "@/components/jobs/job-status-badge";
import { MaterialsList } from "@/components/jobs/materials-list";
import { EmployeeJobStatusActions } from "@/components/employee/job-status-actions";
import { ExpenseRequestCard } from "@/components/expense-requests/expense-request-card";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

function EmployeeJobDetailPageInner() {
  const id = useSearchParams().get("id");
  const t = useTranslations("jobs.detail");
  const tExpenses = useTranslations("expenseRequests");

  const [job, setJob] = React.useState<JobDetail | null | undefined>(undefined);
  const [expenseRequests, setExpenseRequests] = React.useState<ExpenseRequestWithNames[]>([]);

  React.useEffect(() => {
    if (!id) return;
    getJobDetail(id).then(async (detail) => {
      if (!detail) {
        setJob(null);
        return;
      }
      setJob(detail);
      const requests = await listExpenseRequestsForJob(detail.id);
      setExpenseRequests(requests);
    });
  }, [id]);

  if (job === null) {
    notFound();
  }

  if (job === undefined) {
    return <PageLoadingSkeleton />;
  }

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

      <EmployeeJobStatusActions jobId={job.id} status={job.status} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("client")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            {job.client ? (
              <>
                <div className="flex min-w-0 items-center gap-1.5 font-medium">
                  {job.client.type === "company" ? (
                    <Building2 className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <User className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate">{job.client.display_name}</span>
                </div>
                {job.client.phone ? <p className="break-words">{job.client.phone}</p> : null}
                {job.client.email ? <p className="break-words">{job.client.email}</p> : null}
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
              addressLines.map((line) => (
                <p key={line} className="break-words">
                  {line}
                </p>
              ))
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
          <CardContent className="whitespace-pre-wrap break-words text-sm">{job.description}</CardContent>
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
            <Link href={`/employee/jobs/expenses/new?id=${job.id}`}>
              <Plus /> {tExpenses("list.newRequest")}
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {expenseRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">{tExpenses("list.empty")}</p>
          ) : (
            expenseRequests.map((request) => (
              <ExpenseRequestCard key={request.id} request={request} canReview={false} jobId={job.id} />
            ))
          )}
        </CardContent>
      </Card>

      {job.additional_info ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("additionalInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap break-words text-sm">{job.additional_info}</CardContent>
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

export default function EmployeeJobDetailPage() {
  return (
    <React.Suspense fallback={<PageLoadingSkeleton />}>
      <EmployeeJobDetailPageInner />
    </React.Suspense>
  );
}
