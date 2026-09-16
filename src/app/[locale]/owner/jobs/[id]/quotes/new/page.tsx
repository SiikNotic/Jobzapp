import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getJobDetail } from "@/lib/jobs/queries";
import { getCompanyById } from "@/lib/company/get-company";
import { formatAddress } from "@/lib/documents/format-address";
import { QuoteForm } from "@/components/owner/documents/quote-form";

export default async function NewQuotePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = (await params) as { locale: Locale; id: string };
  const t = await getTranslations({ locale, namespace: "documents.new" });
  const tQuote = await getTranslations({ locale, namespace: "documents.kind.quote" });

  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) {
    redirect({ href: "/login", locale });
    return null;
  }

  const [job, company] = await Promise.all([
    getJobDetail(id),
    getCompanyById(profile.company_id),
  ]);

  if (!job || job.company_id !== profile.company_id) {
    notFound();
  }

  const jobAddress = formatAddress(job);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("title", { kind: tQuote("title") })}
        </h1>
        <p className="font-mono text-muted-foreground">{job.job_code}</p>
      </div>

      <QuoteForm
        jobId={job.id}
        defaultClientAddress={jobAddress}
        defaultTerms={company?.document_notes}
        locale={locale}
      />
    </div>
  );
}
