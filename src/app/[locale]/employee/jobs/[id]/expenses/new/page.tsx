import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import type { Locale } from "@/i18n/routing";
import { getJobDetail } from "@/lib/jobs/queries";
import { ExpenseRequestForm } from "@/components/employee/expense-request-form";

export default async function NewExpenseRequestPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = (await params) as { locale: Locale; id: string };
  const t = await getTranslations({ locale, namespace: "expenseRequests.form" });

  const job = await getJobDetail(id);
  if (!job) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="font-mono text-muted-foreground">{job.job_code}</p>
      </div>

      <ExpenseRequestForm jobId={job.id} locale={locale} />
    </div>
  );
}
