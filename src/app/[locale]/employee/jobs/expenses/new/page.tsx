"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { notFound, useSearchParams } from "next/navigation";

import { getJobDetail } from "@/lib/jobs/queries";
import type { JobDetail } from "@/lib/jobs/types";
import { ExpenseRequestForm } from "@/components/employee/expense-request-form";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

function NewExpenseRequestPageInner() {
  const id = useSearchParams().get("id");
  const t = useTranslations("expenseRequests.form");

  const [job, setJob] = React.useState<JobDetail | null | undefined>(undefined);

  React.useEffect(() => {
    if (!id) return;
    getJobDetail(id).then((detail) => setJob(detail ?? null));
  }, [id]);

  if (job === null) {
    notFound();
  }

  if (job === undefined) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="font-mono text-muted-foreground">{job.job_code}</p>
      </div>

      <ExpenseRequestForm jobId={job.id} />
    </div>
  );
}

export default function NewExpenseRequestPage() {
  return (
    <React.Suspense fallback={<PageLoadingSkeleton />}>
      <NewExpenseRequestPageInner />
    </React.Suspense>
  );
}
