import { getTranslations } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { listContractTemplates, listEmployees } from "@/lib/jobs/queries";
import { JobForm } from "@/components/owner/jobs/job-form";

export default async function NewJobPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "jobs.new" });

  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) {
    redirect({ href: "/login", locale });
    return null;
  }

  const [employees, contractTemplates] = await Promise.all([
    listEmployees(profile.company_id),
    listContractTemplates(profile.company_id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <JobForm employees={employees} contractTemplates={contractTemplates} locale={locale} />
    </div>
  );
}
