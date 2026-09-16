import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import type { Locale } from "@/i18n/routing";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getQuoteById } from "@/lib/quotes/queries";
import { QuoteForm } from "@/components/owner/documents/quote-form";

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ locale: string; id: string; quoteId: string }>;
}) {
  const { locale, id, quoteId } = (await params) as {
    locale: Locale;
    id: string;
    quoteId: string;
  };
  const t = await getTranslations({ locale, namespace: "documents.edit" });

  const { profile } = await getCurrentProfile();
  const quote = await getQuoteById(quoteId);

  if (!quote || quote.company_id !== profile?.company_id || quote.job_id !== id) {
    notFound();
  }

  if (quote.status !== "draft") {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="font-mono text-muted-foreground">{quote.quote_number}</p>
      </div>

      <QuoteForm jobId={id} quote={quote} locale={locale} />
    </div>
  );
}
