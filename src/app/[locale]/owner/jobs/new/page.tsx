"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/lib/auth/auth-provider";
import { listContractTemplates, listEmployees } from "@/lib/jobs/queries";
import type { Employee } from "@/lib/jobs/types";
import { JobForm } from "@/components/owner/jobs/job-form";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

export default function NewJobPage() {
  const t = useTranslations("jobs.new");
  const { profile } = useAuth();

  const [employees, setEmployees] = React.useState<Employee[] | null>(null);
  const [contractTemplates, setContractTemplates] = React.useState<{ id: string; name: string }[]>([]);

  React.useEffect(() => {
    if (!profile?.company_id) return;
    const companyId = profile.company_id;
    Promise.all([listEmployees(companyId), listContractTemplates(companyId)]).then(
      ([emps, templates]) => {
        setEmployees(emps);
        setContractTemplates(templates);
      }
    );
  }, [profile?.company_id]);

  if (!employees) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <JobForm employees={employees} contractTemplates={contractTemplates} />
    </div>
  );
}
