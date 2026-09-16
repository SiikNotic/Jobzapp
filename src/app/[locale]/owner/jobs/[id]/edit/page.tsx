import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getJobDetail, listContractTemplates, listEmployees } from "@/lib/jobs/queries";
import { JobForm } from "@/components/owner/jobs/job-form";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = (await params) as { locale: Locale; id: string };
  const t = await getTranslations({ locale, namespace: "jobs.edit" });

  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) {
    redirect({ href: "/login", locale });
    return null;
  }

  const job = await getJobDetail(id);
  if (!job || job.company_id !== profile.company_id) {
    notFound();
  }

  const [employees, contractTemplates] = await Promise.all([
    listEmployees(profile.company_id),
    listContractTemplates(profile.company_id),
  ]);

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
        locale={locale}
      />
    </div>
  );
}
