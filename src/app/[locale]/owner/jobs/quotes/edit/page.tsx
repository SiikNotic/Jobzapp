"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { notFound, useSearchParams } from "next/navigation";

import { useAuth } from "@/lib/auth/auth-provider";
import { getQuoteById } from "@/lib/quotes/queries";
import type { Quote } from "@/lib/quotes/types";
import { QuoteForm } from "@/components/owner/documents/quote-form";
import { PageLoadingSkeleton } from "@/components/page-loading-skeleton";

function EditQuotePageInner() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const quoteId = searchParams.get("quoteId");
  const t = useTranslations("documents.edit");
  const { profile } = useAuth();

  const [quote, setQuote] = React.useState<Quote | null | undefined>(undefined);

  React.useEffect(() => {
    if (!profile?.company_id || !jobId || !quoteId) return;
    getQuoteById(quoteId).then((data) => {
      if (!data || data.company_id !== profile.company_id || data.job_id !== jobId || data.status !== "draft") {
        setQuote(null);
        return;
      }
      setQuote(data);
    });
  }, [profile?.company_id, jobId, quoteId]);

  if (quote === null) {
    notFound();
  }

  if (quote === undefined || !jobId) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="font-mono text-muted-foreground">{quote.quote_number}</p>
      </div>

      <QuoteForm jobId={jobId} quote={quote} />
    </div>
  );
}

export default function EditQuotePage() {
  return (
    <React.Suspense fallback={<PageLoadingSkeleton />}>
      <EditQuotePageInner />
    </React.Suspense>
  );
}
