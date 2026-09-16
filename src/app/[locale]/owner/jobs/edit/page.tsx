"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { notFound, useSearchParams } from "next/navigation";

import { useAuth } from "@/lib/auth/auth-provider";
import { getJobDetail, listContractTemplates, listEmployees } from "@/lib/jobs/queries";
import type { Employee, JobDetail } from "@/lib/jobs/types";
import { JobForm } from "@/components/owner/jobs/job-form";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

function EditJobPageInner() {
  const id = useSearchParams().get("id");
  const t = useTranslations("jobs.edit");
  const { profile } = useAuth();

  const [job, setJob] = React.useState<JobDetail | null | undefined>(undefined);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [contractTemplates, setContractTemplates] = React.useState<{ id: string; name: string }[]>([]);

  React.useEffect(() => {
    if (!profile?.company_id || !id) return;
    const companyId = profile.company_id;

    getJobDetail(id).then(async (detail) => {
      if (!detail || detail.company_id !== companyId) {
        setJob(null);
        return;
      }
      setJob(detail);
      const [emps, templates] = await Promise.all([
        listEmployees(companyId),
        listContractTemplates(companyId),
      ]);
      setEmployees(emps);
      setContractTemplates(templates);
    });
  }, [profile?.company_id, id]);

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

      <JobForm
        job={job}
        initialClient={
          job.client
            ? {
                id: job.client.id,
                type: job.client.type,
                display_name: job.client.display_name,
                phone: job.client.phone,
                email: job.client.email,
                address_line1: null,
                address_line2: null,
                city: null,
                state_province: null,
                postal_code: null,
                country: null,
              }
            : undefined
        }
        employees={employees}
        contractTemplates={contractTemplates}
      />
    </div>
  );
}

export default function EditJobPage() {
  return (
    <React.Suspense fallback={<PageLoadingSkeleton />}>
      <EditJobPageInner />
    </React.Suspense>
  );
}
