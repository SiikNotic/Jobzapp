"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { notFound, useSearchParams } from "next/navigation";

import { useAuth } from "@/lib/auth/auth-provider";
import { getJobDetail } from "@/lib/jobs/queries";
import type { JobDetail } from "@/lib/jobs/types";
import { getCompanyById } from "@/lib/company/get-company";
import type { Company } from "@/lib/company/types";
import { formatAddress } from "@/lib/documents/format-address";
import { QuoteForm } from "@/components/owner/documents/quote-form";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

function NewQuotePageInner() {
  const jobId = useSearchParams().get("jobId");
  const t = useTranslations("documents.new");
  const tQuote = useTranslations("documents.kind.quote");
  const { profile } = useAuth();

  const [job, setJob] = React.useState<JobDetail | null | undefined>(undefined);
  const [company, setCompany] = React.useState<Company | null>(null);

  React.useEffect(() => {
    if (!profile?.company_id || !jobId) return;
    const companyId = profile.company_id;

    Promise.all([getJobDetail(jobId), getCompanyById(companyId)]).then(([jobDetail, companyDetail]) => {
      if (!jobDetail || jobDetail.company_id !== companyId) {
        setJob(null);
        return;
      }
      setJob(jobDetail);
      setCompany(companyDetail);
    });
  }, [profile?.company_id, jobId]);

  if (job === null) {
    notFound();
  }

  if (job === undefined) {
    return <PageLoadingSkeleton />;
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

      <QuoteForm jobId={job.id} defaultClientAddress={jobAddress} defaultTerms={company?.document_notes} />
    </div>
  );
}

export default function NewQuotePage() {
  return (
    <React.Suspense fallback={<PageLoadingSkeleton />}>
      <NewQuotePageInner />
    </React.Suspense>
  );
}
