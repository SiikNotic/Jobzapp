import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import type { Locale } from "@/i18n/routing";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getJobDetail } from "@/lib/jobs/queries";
import { getQuoteById, getInvoiceIdForQuote } from "@/lib/quotes/queries";
import { getCompanyById } from "@/lib/company/get-company";
import { formatAddress } from "@/lib/documents/format-address";
import { DocumentPreview } from "@/components/documents/document-preview";
import { QuoteStatusBadge } from "@/components/documents/quote-status-badge";
import { QuoteActions } from "@/components/owner/documents/quote-actions";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; quoteId: string }>;
}) {
  const { locale, id, quoteId } = (await params) as {
    locale: Locale;
    id: string;
    quoteId: string;
  };
  const t = await getTranslations({ locale, namespace: "documents.detail" });

  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) notFound();

  const [job, quote] = await Promise.all([getJobDetail(id), getQuoteById(quoteId)]);
  if (!job || job.company_id !== profile.company_id) notFound();
  if (!quote || quote.job_id !== id) notFound();

  const [company, invoiceId] = await Promise.all([
    getCompanyById(profile.company_id),
    getInvoiceIdForQuote(quoteId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{quote.quote_number}</h1>
          <p className="text-sm text-muted-foreground">{t("sentOrDecided")}</p>
        </div>
        <QuoteStatusBadge status={quote.status} />
      </div>

      <QuoteActions jobId={id} quote={quote} invoiceId={invoiceId} locale={locale} />

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
