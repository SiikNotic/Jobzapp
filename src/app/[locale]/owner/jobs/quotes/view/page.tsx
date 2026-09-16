"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { notFound, useSearchParams } from "next/navigation";

import { useAuth } from "@/lib/auth/auth-provider";
import { getJobDetail } from "@/lib/jobs/queries";
import type { JobDetail } from "@/lib/jobs/types";
import { getQuoteById, getInvoiceIdForQuote } from "@/lib/quotes/queries";
import type { Quote } from "@/lib/quotes/types";
import { getCompanyById } from "@/lib/company/get-company";
import type { Company } from "@/lib/company/types";
import { formatAddress } from "@/lib/documents/format-address";
import { DocumentPreview } from "@/components/documents/document-preview";
import { QuoteStatusBadge } from "@/components/documents/quote-status-badge";
import { QuoteActions } from "@/components/owner/documents/quote-actions";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

function QuoteDetailPageInner() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const quoteId = searchParams.get("quoteId");
  const t = useTranslations("documents.detail");
  const { profile } = useAuth();

  const [state, setState] = React.useState<
    { job: JobDetail; quote: Quote; company: Company | null; invoiceId: string | null } | null | undefined
  >(undefined);

  React.useEffect(() => {
    if (!profile?.company_id || !jobId || !quoteId) return;
    const companyId = profile.company_id;

    Promise.all([getJobDetail(jobId), getQuoteById(quoteId)]).then(async ([job, quote]) => {
      if (!job || job.company_id !== companyId || !quote || quote.job_id !== jobId) {
        setState(null);
        return;
      }
      const [company, invoiceId] = await Promise.all([
        getCompanyById(companyId),
        getInvoiceIdForQuote(quoteId),
      ]);
      setState({ job, quote, company, invoiceId });
    });
  }, [profile?.company_id, jobId, quoteId]);

  if (state === null) {
    notFound();
  }

  if (state === undefined) {
    return <PageLoadingSkeleton />;
  }

  const { job, quote, company, invoiceId } = state;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{quote.quote_number}</h1>
          <p className="text-sm text-muted-foreground">{t("sentOrDecided")}</p>
        </div>
        <QuoteStatusBadge status={quote.status} />
      </div>

      <QuoteActions jobId={job.id} quote={quote} invoiceId={invoiceId} />

      <DocumentPreview
        kind="quote"
        number={quote.quote_number}
        jobCode={job.job_code}
        clientName={quote.client_name}
        clientAddress={quote.client_address}
        description={quote.description}
        lineItems={quote.line_items}
        terms={quote.terms}
        total={quote.total}
        company={{
          name: company?.trade_name || company?.name || "",
          logoUrl: company?.logo_url ?? null,
          address: formatAddress(company ?? {}),
          email: company?.contact_email ?? null,
          phone: company?.contact_phone ?? null,
        }}
      />
    </div>
  );
}

export default function QuoteDetailPage() {
  return (
    <React.Suspense fallback={<PageLoadingSkeleton />}>
      <QuoteDetailPageInner />
    </React.Suspense>
  );
}
